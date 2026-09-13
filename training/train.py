"""Plantinia unified training entry point.

Modes:
  vision      standalone image classification
  llm         Plantinia text-model LoRA fine-tuning
  joint       one multimodal checkpoint: vision + SmolLM2 + fusion projector
  interactive separate LLM-only conversational model

The joint model is deliberately small and CPU/GPU friendly. It prepends a
projected image representation to the LLM token embeddings, so image and text
losses are optimized together in the same backward/optimizer step.
"""
from __future__ import annotations

import argparse
import json
import os
import random
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch
import torch.nn as nn
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms
from transformers import AutoModelForCausalLM, AutoTokenizer, get_linear_schedule_with_warmup
from peft import LoraConfig, get_peft_model


ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_path(value: str) -> Path:
    p = Path(value)
    return p if p.is_absolute() else ROOT / p


def set_seed(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def choose_device(requested: str) -> torch.device:
    if requested == "cpu":
        return torch.device("cpu")
    if requested == "cuda":
        if not torch.cuda.is_available():
            raise RuntimeError("CUDA was requested but is not available")
        return torch.device("cuda")
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found: {path}")
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid JSON on {path}:{line_no}: {exc}") from exc
            rows.append(row)
    if not rows:
        raise ValueError(f"Dataset is empty: {path}")
    return rows


class VisionJsonlDataset(Dataset):
    def __init__(self, path: Path, labels: list[str], image_size: int):
        self.rows = read_jsonl(path)
        self.label_to_id = {label: i for i, label in enumerate(labels)}
        self.transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
        for i, row in enumerate(self.rows):
            if row.get("label") not in self.label_to_id:
                raise ValueError(f"Unknown label at row {i}: {row.get('label')}")

    def __len__(self) -> int:
        return len(self.rows)

    def __getitem__(self, index: int):
        row = self.rows[index]
        image_path = resolve_path(str(row["image"]))
        with Image.open(image_path) as im:
            image = im.convert("RGB")
        return self.transform(image), self.label_to_id[row["label"]]


class TextJsonlDataset(Dataset):
    def __init__(self, path: Path):
        self.rows = read_jsonl(path)
        for i, row in enumerate(self.rows):
            if not row.get("prompt") or not row.get("response"):
                raise ValueError(f"Text row {i} requires prompt and response")

    def __len__(self) -> int:
        return len(self.rows)

    def __getitem__(self, index: int):
        return self.rows[index]


class JointJsonlDataset(TextJsonlDataset):
    def __getitem__(self, index: int):
        row = self.rows[index]
        image_path = resolve_path(str(row["image"]))
        return image_path, row["prompt"], row["response"]


@dataclass
class TokenBatch:
    input_ids: torch.Tensor
    attention_mask: torch.Tensor
    labels: torch.Tensor


def tokenize_response(tokenizer, prompt: str, response: str, max_length: int) -> TokenBatch:
    # Keep a clear boundary so the model is trained to answer rather than copy
    # the instruction. Loss on the prompt tokens is masked with -100.
    prompt_text = f"User: {prompt}\nAssistant:"
    full_text = f"{prompt_text} {response}"
    prompt_ids = tokenizer(prompt_text, add_special_tokens=True, truncation=True, max_length=max_length)["input_ids"]
    full = tokenizer(full_text, add_special_tokens=True, truncation=True, max_length=max_length, padding="max_length")
    input_ids = torch.tensor(full["input_ids"], dtype=torch.long)
    attention_mask = torch.tensor(full["attention_mask"], dtype=torch.long)
    labels = input_ids.clone()
    prompt_len = min(len(prompt_ids), labels.numel())
    labels[:prompt_len] = -100
    labels[attention_mask == 0] = -100
    return TokenBatch(input_ids, attention_mask, labels)


def make_lora(model):
    candidates = {"q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"}
    found = set()
    for name, module in model.named_modules():
        if isinstance(module, nn.Linear):
            leaf = name.rsplit(".", 1)[-1]
            if leaf in candidates:
                found.add(leaf)
    if not found:
        raise RuntimeError("Could not find compatible Transformer projection layers for LoRA")
    config = LoraConfig(
        r=8,
        lora_alpha=16,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=sorted(found),
    )
    return get_peft_model(model, config)


def load_llm(model_path: Path, use_lora: bool):
    if not model_path.exists():
        raise FileNotFoundError(f"LLM model directory not found: {model_path}")
    tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    llm = AutoModelForCausalLM.from_pretrained(model_path, local_files_only=True, low_cpu_mem_usage=True)
    if use_lora:
        llm = make_lora(llm)
    return tokenizer, llm


def build_vision(backbone: str, num_classes: int, pretrained: bool):
    if backbone == "mobilenet_v3_small":
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        net = models.mobilenet_v3_small(weights=weights)
        feature_dim = net.classifier[-1].in_features
        net.classifier[-1] = nn.Linear(feature_dim, num_classes)
        return net, feature_dim
    if backbone == "resnet18":
        weights = models.ResNet18_Weights.DEFAULT if pretrained else None
        net = models.resnet18(weights=weights)
        feature_dim = net.fc.in_features
        net.fc = nn.Linear(feature_dim, num_classes)
        return net, feature_dim
    raise ValueError(f"Unsupported vision backbone: {backbone}")


class JointPlantiniaModel(nn.Module):
    """One multimodal model bundle with jointly trained vision + language parts."""

    def __init__(self, vision: nn.Module, feature_dim: int, llm: nn.Module, hidden_size: int):
        super().__init__()
        self.vision = vision
        # Reuse the backbone feature extractor without duplicating weights.
        if hasattr(vision, "features") and hasattr(vision, "classifier"):
            self._vision_features = lambda x: vision.features(x)
            self._vision_pool = lambda x: torch.nn.functional.adaptive_avg_pool2d(x, 1).flatten(1)
        else:
            raise ValueError("Joint mode currently expects a torchvision MobileNet-style backbone")
        self.projector = nn.Sequential(
            nn.Linear(feature_dim, hidden_size),
            nn.GELU(),
            nn.Linear(hidden_size, hidden_size),
        )
        self.llm = llm

    def image_embedding(self, images: torch.Tensor) -> torch.Tensor:
        features = self._vision_features(images)
        pooled = self._vision_pool(features)
        return self.projector(pooled)

    def forward(self, images, input_ids, attention_mask, labels):
        token_embeddings = self.llm.get_input_embeddings()(input_ids)
        image_token = self.image_embedding(images).unsqueeze(1)
        inputs_embeds = torch.cat([image_token, token_embeddings], dim=1)
        image_mask = torch.ones((attention_mask.size(0), 1), dtype=attention_mask.dtype, device=attention_mask.device)
        combined_mask = torch.cat([image_mask, attention_mask], dim=1)
        image_labels = torch.full((labels.size(0), 1), -100, dtype=labels.dtype, device=labels.device)
        combined_labels = torch.cat([image_labels, labels], dim=1)
        return self.llm(inputs_embeds=inputs_embeds, attention_mask=combined_mask, labels=combined_labels)


def vision_epoch(model, loader, device, optimizer=None, log_every=10):
    training = optimizer is not None
    model.train(training)
    loss_fn = nn.CrossEntropyLoss()
    total_loss = 0.0
    correct = 0
    count = 0
    for step, (images, labels) in enumerate(loader, 1):
        images, labels = images.to(device), labels.to(device)
        with torch.set_grad_enabled(training):
            logits = model(images)
            loss = loss_fn(logits, labels)
            if training:
                optimizer.zero_grad(set_to_none=True)
                loss.backward()
                optimizer.step()
        total_loss += loss.item() * labels.size(0)
        correct += (logits.argmax(1) == labels).sum().item()
        count += labels.size(0)
        if training and step % log_every == 0:
            print(f"  step={step} loss={loss.item():.4f}")
    return total_loss / max(count, 1), correct / max(count, 1)


def text_epoch(llm, tokenizer, rows, device, optimizer=None, max_length=256, grad_accum=8, log_every=10):
    training = optimizer is not None
    llm.train(training)
    total = 0.0
    optimizer_steps = 0
    if training:
        optimizer.zero_grad(set_to_none=True)
    for index, row in enumerate(rows, 1):
        batch = tokenize_response(tokenizer, row["prompt"], row["response"], max_length)
        ids = batch.input_ids.unsqueeze(0).to(device)
        mask = batch.attention_mask.unsqueeze(0).to(device)
        labels = batch.labels.unsqueeze(0).to(device)
        with torch.set_grad_enabled(training):
            out = llm(input_ids=ids, attention_mask=mask, labels=labels)
            loss = out.loss
            if training:
                (loss / grad_accum).backward()
                if index % grad_accum == 0 or index == len(rows):
                    torch.nn.utils.clip_grad_norm_(llm.parameters(), 1.0)
                    optimizer.step()
                    optimizer.zero_grad(set_to_none=True)
                    optimizer_steps += 1
        total += loss.item()
        if index % log_every == 0:
            print(f"  example={index}/{len(rows)} loss={loss.item():.4f}")
    return total / max(len(rows), 1), optimizer_steps


def joint_collate(rows, tokenizer, image_size, max_length):
    transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    images = []
    token_batches = []
    for image_path, prompt, response in rows:
        with Image.open(image_path) as im:
            images.append(transform(im.convert("RGB")))
        token_batches.append(tokenize_response(tokenizer, prompt, response, max_length))
    return (
        torch.stack(images),
        torch.stack([b.input_ids for b in token_batches]),
        torch.stack([b.attention_mask for b in token_batches]),
        torch.stack([b.labels for b in token_batches]),
    )


def save_manifest(out: Path, cfg: dict[str, Any], metrics: dict[str, Any], device: torch.device):
    manifest = {
        "model_name": cfg["model_name"],
        "format_version": 1,
        "training_mode": cfg["mode"],
        "device": str(device),
        "metrics": metrics,
        "vision": cfg.get("vision"),
        "llm": cfg.get("llm"),
        "data": cfg.get("data"),
        "training": cfg.get("training"),
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def train_vision(cfg, device):
    v = cfg["vision"]
    t = cfg["training"]
    out = resolve_path(cfg["output_dir"])
    out.mkdir(parents=True, exist_ok=True)
    model, _ = build_vision(v["backbone"], v["num_classes"], v.get("pretrained", True))
    model.to(device)
    train_ds = VisionJsonlDataset(resolve_path(cfg["data"]["vision_train"]), v["labels"], v["image_size"])
    valid_ds = VisionJsonlDataset(resolve_path(cfg["data"]["vision_valid"]), v["labels"], v["image_size"])
    train_loader = DataLoader(train_ds, batch_size=t["batch_size"], shuffle=True, num_workers=t.get("num_workers", 0))
    valid_loader = DataLoader(valid_ds, batch_size=t["batch_size"], shuffle=False, num_workers=t.get("num_workers", 0))
    optimizer = torch.optim.AdamW(model.parameters(), lr=t["vision_learning_rate"], weight_decay=t["weight_decay"])
    metrics = {}
    for epoch in range(1, t["epochs"] + 1):
        loss, acc = vision_epoch(model, train_loader, device, optimizer, t["log_every"])
        val_loss, val_acc = vision_epoch(model, valid_loader, device)
        metrics = {"epoch": epoch, "train_loss": loss, "train_accuracy": acc, "valid_loss": val_loss, "valid_accuracy": val_acc}
        print(f"epoch={epoch} train_acc={acc:.4f} valid_acc={val_acc:.4f}")
        torch.save(model.state_dict(), out / "vision.pt")
    (out / "labels.json").write_text(json.dumps(v["labels"], indent=2), encoding="utf-8")
    save_manifest(out, cfg, metrics, device)


def train_llm(cfg, device, interactive=False):
    l = cfg["llm"]
    t = cfg["training"]
    d = cfg["data"]
    out = resolve_path(cfg["output_dir"])
    out.mkdir(parents=True, exist_ok=True)
    tokenizer, llm = load_llm(resolve_path(l["base_model"]), l.get("lora", True))
    llm.to(device)
    train_rows = read_jsonl(resolve_path(d["train"]))
    valid_rows = read_jsonl(resolve_path(d["valid"]))
    optimizer = torch.optim.AdamW((p for p in llm.parameters() if p.requires_grad), lr=t["learning_rate"], weight_decay=t["weight_decay"])
    metrics = {}
    for epoch in range(1, t["epochs"] + 1):
        train_loss, _ = text_epoch(llm, tokenizer, train_rows, device, optimizer, l["max_length"], t["gradient_accumulation_steps"], t["log_every"])
        with torch.no_grad():
            valid_loss, _ = text_epoch(llm, tokenizer, valid_rows, device, None, l["max_length"], 1, t["log_every"])
        metrics = {"epoch": epoch, "train_loss": train_loss, "valid_loss": valid_loss, "interactive": interactive}
        print(f"epoch={epoch} train_loss={train_loss:.4f} valid_loss={valid_loss:.4f}")
        llm.save_pretrained(out / "llm_adapter")
        tokenizer.save_pretrained(out / "tokenizer")
    save_manifest(out, cfg, metrics, device)


def train_joint(cfg, device):
    v, l, t, d = cfg["vision"], cfg["llm"], cfg["training"], cfg["data"]
    out = resolve_path(cfg["output_dir"])
    out.mkdir(parents=True, exist_ok=True)
    tokenizer, llm = load_llm(resolve_path(l["base_model"]), l.get("lora", True))
    vision, feature_dim = build_vision(v["backbone"], v["num_classes"], v.get("pretrained", True))
    hidden_size = int(llm.config.hidden_size)
    model = JointPlantiniaModel(vision, feature_dim, llm, hidden_size).to(device)
    train_rows = JointJsonlDataset(resolve_path(d["joint_train"]))
    valid_rows = JointJsonlDataset(resolve_path(d["joint_valid"]))
    # Batch size defaults to 1 on the target 8 GB development machine.
    train_loader = DataLoader(train_rows, batch_size=t["batch_size"], shuffle=True, num_workers=t.get("num_workers", 0), collate_fn=lambda rows: joint_collate(rows, tokenizer, v["image_size"], l["max_length"]))
    valid_loader = DataLoader(valid_rows, batch_size=t["batch_size"], shuffle=False, num_workers=t.get("num_workers", 0), collate_fn=lambda rows: joint_collate(rows, tokenizer, v["image_size"], l["max_length"]))
    llm_params = [p for p in model.llm.parameters() if p.requires_grad]
    vision_params = list(model.vision.parameters()) + list(model.projector.parameters())
    optimizer = torch.optim.AdamW([
        {"params": llm_params, "lr": t["learning_rate"]},
        {"params": vision_params, "lr": t["vision_learning_rate"]},
    ], weight_decay=t["weight_decay"])
    metrics = {}
    for epoch in range(1, t["epochs"] + 1):
        model.train()
        running = 0.0
        optimizer.zero_grad(set_to_none=True)
        for step, batch in enumerate(train_loader, 1):
            images, ids, mask, labels = [x.to(device) for x in batch]
            loss = model(images, ids, mask, labels).loss
            (loss / t["gradient_accumulation_steps"]).backward()
            if step % t["gradient_accumulation_steps"] == 0 or step == len(train_loader):
                torch.nn.utils.clip_grad_norm_(model.parameters(), t["max_grad_norm"])
                optimizer.step()
                optimizer.zero_grad(set_to_none=True)
            running += loss.item()
            if step % t["log_every"] == 0:
                print(f"  joint step={step}/{len(train_loader)} loss={loss.item():.4f}")
        model.eval()
        valid_total = 0.0
        with torch.no_grad():
            for batch in valid_loader:
                images, ids, mask, labels = [x.to(device) for x in batch]
                valid_total += model(images, ids, mask, labels).loss.item()
        train_loss = running / max(len(train_loader), 1)
        valid_loss = valid_total / max(len(valid_loader), 1)
        metrics = {"epoch": epoch, "train_loss": train_loss, "valid_loss": valid_loss}
        print(f"epoch={epoch} train_loss={train_loss:.4f} valid_loss={valid_loss:.4f}")
        torch.save(model.vision.state_dict(), out / "vision.pt")
        torch.save(model.projector.state_dict(), out / "projector.pt")
        model.llm.save_pretrained(out / "llm_adapter")
        tokenizer.save_pretrained(out / "tokenizer")
    save_manifest(out, cfg, metrics, device)


def main():
    parser = argparse.ArgumentParser(description="Plantinia unified AI trainer")
    parser.add_argument("--mode", choices=["vision", "llm", "joint", "interactive"], required=True)
    parser.add_argument("--config", required=True)
    args = parser.parse_args()
    cfg = load_json(resolve_path(args.config))
    cfg["mode"] = args.mode
    set_seed(int(cfg["training"]["seed"]))
    device = choose_device(cfg["training"].get("device", "auto"))
    print(f"Plantinia Training | model={cfg['model_name']} | mode={args.mode} | device={device}")
    if args.mode == "vision":
        train_vision(cfg, device)
    elif args.mode == "llm":
        train_llm(cfg, device)
    elif args.mode == "interactive":
        train_llm(cfg, device, interactive=True)
    else:
        train_joint(cfg, device)
    print("Training/export complete.")


if __name__ == "__main__":
    main()
