"""Train a single Plantinia multimodal checkpoint.

PTN-Watermeal1 uses MobileNetV3-Small + SmolLM2-135M-Instruct. Both are
members of ONE PyTorch model and receive gradients during the same optimizer
step. Vision classification loss and language-response loss are combined.
The exported model.pt contains the complete multimodal state dict.
"""
from __future__ import annotations

import argparse
import json
import random
import time
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model

ROOT = Path(__file__).resolve().parents[1]
NORM = ([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])


def path(v: str) -> Path:
    p = Path(v)
    return p if p.is_absolute() else ROOT / p


def read_json(path_: Path):
    return json.loads(path_.read_text(encoding="utf-8"))


def read_jsonl(path_: Path):
    if not path_.exists():
        raise FileNotFoundError(f"Dataset file not found: {path_}")
    rows = [json.loads(x) for x in path_.read_text(encoding="utf-8").splitlines() if x.strip()]
    if not rows:
        raise ValueError(f"Dataset is empty: {path_}")
    return rows


def seed_all(seed: int):
    random.seed(seed); torch.manual_seed(seed)
    if torch.cuda.is_available(): torch.cuda.manual_seed_all(seed)


def device_for(value: str):
    if value == "cpu": return torch.device("cpu")
    if value == "cuda":
        if not torch.cuda.is_available(): raise RuntimeError("CUDA requested but unavailable")
        return torch.device("cuda")
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def tokenizer_batch(tokenizer, prompt: str, response: str, max_len: int):
    p = f"User: {prompt}\nAssistant:"
    full = f"{p} {response}"
    pids = tokenizer(p, add_special_tokens=True, truncation=True, max_length=max_len)["input_ids"]
    enc = tokenizer(full, add_special_tokens=True, truncation=True, max_length=max_len, padding="max_length")
    ids = torch.tensor(enc["input_ids"], dtype=torch.long)
    mask = torch.tensor(enc["attention_mask"], dtype=torch.long)
    labels = ids.clone()
    labels[:min(len(pids), len(labels))] = -100
    labels[mask == 0] = -100
    return ids, mask, labels


class JointDataset(Dataset):
    def __init__(self, file: Path):
        self.rows = read_jsonl(file)
        for i, r in enumerate(self.rows):
            for key in ("image", "prompt", "response", "label"):
                if not r.get(key): raise ValueError(f"{file}:{i} missing {key}")
            if not path(r["image"]).exists(): raise FileNotFoundError(f"Missing image: {r['image']}")

    def __len__(self): return len(self.rows)
    def __getitem__(self, i): return self.rows[i]


def make_collate(tokenizer, image_size, max_len, labels):
    transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.RandomHorizontalFlip(0.5),
        transforms.ToTensor(),
        transforms.Normalize(*NORM),
    ])
    label_to_id = {x: i for i, x in enumerate(labels)}
    def collate(rows):
        images=[]; ids=[]; masks=[]; lm_labels=[]; class_ids=[]
        for r in rows:
            with Image.open(path(r["image"])) as im: images.append(transform(im.convert("RGB")))
            a,b,c = tokenizer_batch(tokenizer, r["prompt"], r["response"], max_len)
            ids.append(a); masks.append(b); lm_labels.append(c)
            if r["label"] not in label_to_id: raise ValueError(f"Unknown label: {r['label']}")
            class_ids.append(label_to_id[r["label"]])
        return (torch.stack(images), torch.stack(ids), torch.stack(masks), torch.stack(lm_labels), torch.tensor(class_ids))
    return collate


def load_llm(base: Path, cfg):
    tok = AutoTokenizer.from_pretrained(base, local_files_only=True)
    if tok.pad_token is None: tok.pad_token = tok.eos_token
    llm = AutoModelForCausalLM.from_pretrained(base, local_files_only=True, low_cpu_mem_usage=True)
    l = cfg["llm"]
    if l.get("lora", True):
        targets=[]
        candidates={"q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj","down_proj"}
        for n,m in llm.named_modules():
            if isinstance(m, nn.Linear) and n.rsplit(".",1)[-1] in candidates:
                targets.append(n.rsplit(".",1)[-1])
        if not targets: raise RuntimeError("No compatible LoRA layers found")
        llm = get_peft_model(llm, LoraConfig(r=int(l.get("lora_r",8)), lora_alpha=int(l.get("lora_alpha",16)), lora_dropout=float(l.get("lora_dropout",0.05)), bias="none", task_type="CAUSAL_LM", target_modules=sorted(set(targets))))
    return tok, llm


class PTNWatermeal(nn.Module):
    """ONE model: image encoder + fusion projector + language model."""
    def __init__(self, vision, feature_dim, llm):
        super().__init__()
        self.vision = vision
        self.projector = nn.Sequential(nn.Linear(feature_dim, llm.config.hidden_size), nn.GELU(), nn.Linear(llm.config.hidden_size, llm.config.hidden_size))
        self.llm = llm

    def features(self, images):
        x = self.vision.features(images)
        return F.adaptive_avg_pool2d(x, 1).flatten(1)

    def classify(self, images):
        return self.vision.classifier(self.features(images))

    def forward(self, images, ids, mask, labels):
        image_token = self.projector(self.features(images)).unsqueeze(1)
        text_embeds = self.llm.get_input_embeddings()(ids)
        embeds = torch.cat([image_token, text_embeds], dim=1)
        image_mask = torch.ones((mask.size(0),1), dtype=mask.dtype, device=mask.device)
        full_mask = torch.cat([image_mask, mask], dim=1)
        image_labels = torch.full((labels.size(0),1), -100, dtype=labels.dtype, device=labels.device)
        full_labels = torch.cat([image_labels, labels], dim=1)
        return self.llm(inputs_embeds=embeds, attention_mask=full_mask, labels=full_labels)


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    args=ap.parse_args()
    cfg=read_json(path(args.config)); seed_all(int(cfg["training"].get("seed",42)))
    dev=device_for(cfg["training"].get("device","auto"))
    v,l,t,d=cfg["vision"],cfg["llm"],cfg["training"],cfg["data"]
    if v["backbone"] != "mobilenet_v3_small": raise ValueError("PTN-Watermeal1 currently requires mobilenet_v3_small")
    if not Path(path(l["base_model"])).exists(): raise FileNotFoundError(f"SmolLM2 not found: {path(l['base_model'])}")
    tok,llm=load_llm(path(l["base_model"]),cfg)
    weights=models.MobileNet_V3_Small_Weights.DEFAULT if v.get("pretrained",True) else None
    vision=models.mobilenet_v3_small(weights=weights)
    feature_dim=vision.classifier[-1].in_features
    vision.classifier[-1]=nn.Linear(feature_dim,v["num_classes"])
    model=PTNWatermeal(vision,feature_dim,llm).to(dev)
    train=JointDataset(path(d["joint_train"])); valid=JointDataset(path(d["joint_valid"]))
    collate=make_collate(tok,int(v["image_size"]),int(l["max_length"]),v["labels"])
    bs=int(t.get("batch_size",1)); accum=int(t.get("gradient_accumulation_steps",8))
    tr=DataLoader(train,batch_size=bs,shuffle=True,num_workers=int(t.get("num_workers",0)),collate_fn=collate)
    va=DataLoader(valid,batch_size=bs,shuffle=False,num_workers=int(t.get("num_workers",0)),collate_fn=collate)
    llm_params=[p for p in model.llm.parameters() if p.requires_grad]
    vision_params=list(model.vision.parameters())+list(model.projector.parameters())
    opt=torch.optim.AdamW([{"params":llm_params,"lr":float(t["learning_rate"])},{"params":vision_params,"lr":float(t["vision_learning_rate"])}],weight_decay=float(t.get("weight_decay",0.01)))
    alpha=float(t.get("vision_loss_weight",1.0)); epochs=int(t["epochs"]); out=path(cfg["output_dir"]); out.mkdir(parents=True,exist_ok=True)
    metrics={}
    for epoch in range(1,epochs+1):
        model.train(); opt.zero_grad(set_to_none=True); total=lang=vis=0; correct=count=0
        for step,batch in enumerate(tr,1):
            images,ids,mask,lbl,cids=[x.to(dev) for x in batch]
            language_loss=model(images,ids,mask,lbl).loss
            logits=model.classify(images)
            vision_loss=F.cross_entropy(logits,cids)
            loss=language_loss+alpha*vision_loss
            (loss/accum).backward()
            if step%accum==0 or step==len(tr):
                torch.nn.utils.clip_grad_norm_(model.parameters(),float(t.get("max_grad_norm",1.0))); opt.step(); opt.zero_grad(set_to_none=True)
            total+=loss.item(); lang+=language_loss.item(); vis+=vision_loss.item(); correct+=(logits.argmax(1)==cids).sum().item(); count+=len(cids)
            if step%int(t.get("log_every",10))==0: print(f"step {step}/{len(tr)} total={loss.item():.4f} language={language_loss.item():.4f} vision={vision_loss.item():.4f}")
        model.eval(); vtotal=vlang=vvis=0; vcorrect=vcount=0
        with torch.no_grad():
            for batch in va:
                images,ids,mask,lbl,cids=[x.to(dev) for x in batch]
                ll=model(images,ids,mask,lbl).loss; vl=F.cross_entropy(model.classify(images),cids); vtotal+=(ll+alpha*vl).item(); vlang+=ll.item(); vvis+=vl.item(); vcorrect+=(model.classify(images).argmax(1)==cids).sum().item(); vcount+=len(cids)
        metrics={"epoch":epoch,"train_total_loss":total/max(len(tr),1),"train_language_loss":lang/max(len(tr),1),"train_vision_loss":vis/max(len(tr),1),"train_vision_accuracy":correct/max(count,1),"valid_total_loss":vtotal/max(len(va),1),"valid_language_loss":vlang/max(len(va),1),"valid_vision_loss":vvis/max(len(va),1),"valid_vision_accuracy":vcorrect/max(vcount,1)}
        print(json.dumps(metrics,indent=2))
        torch.save({"model_name":cfg["model_name"],"architecture":"PTNWatermeal","state_dict":model.state_dict(),"config":cfg,"metrics":metrics},out/"model.pt")
        model.llm.save_pretrained(out/"llm_adapter"); tok.save_pretrained(out/"tokenizer"); (out/"labels.json").write_text(json.dumps(v["labels"],indent=2),encoding="utf-8")
    manifest={"model_name":cfg["model_name"],"architecture":"ONE multimodal checkpoint","base_llm":l["base_model"],"vision_backbone":v["backbone"],"metrics":metrics,"device":str(dev),"created_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())}
    (out/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8")
    print(f"DONE: {out/'model.pt'}")

if __name__=="__main__": main()
