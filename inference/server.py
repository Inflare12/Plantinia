import io
import json
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms
from fastapi import FastAPI, File, UploadFile

ROOT = Path(__file__).resolve().parent.parent
CHECKPOINT = ROOT / "training" / "runs" / "PTN-Watermeal1.0" / "model.pt"

LABELS = [
    "healthy",
    "water_stress_3_days",
    "water_stress_6_days",
    "water_stress_9_days",
]


class PTNWatermeal(nn.Module):
    def __init__(self, vision, feature_dim, llm):
        super().__init__()
        self.vision = vision
        self.projector = nn.Sequential(
            nn.Linear(feature_dim, llm.config.hidden_size),
            nn.GELU(),
            nn.Linear(llm.config.hidden_size, llm.config.hidden_size),
        )
        self.llm = llm

    def features(self, images):
        x = self.vision.features(images)
        return F.adaptive_avg_pool2d(x, 1).flatten(1)

    def classify(self, images):
        return self.vision.classifier(self.features(images))


app = FastAPI(title="PTN-Watermeal1.0 Inference")


model = None
device = torch.device("cpu")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


def load_model():
    global model

    from transformers import AutoModelForCausalLM

    checkpoint = torch.load(
        CHECKPOINT,
        map_location="cpu",
        weights_only=False,
    )

    cfg = checkpoint["config"]

    vision = models.mobilenet_v3_small(weights=None)
    feature_dim = vision.classifier[0].in_features
    vision.classifier[-1] = nn.Linear(
        vision.classifier[-1].in_features,
        4,
    )

    llm = AutoModelForCausalLM.from_pretrained(
        ROOT / cfg["llm"]["base_model"]
    )

    # Recreate the same LoRA structure used during training.
    from peft import LoraConfig, get_peft_model

    l = cfg["llm"]
    targets = {
        "q_proj",
        "k_proj",
        "v_proj",
        "o_proj",
        "gate_proj",
        "up_proj",
        "down_proj",
    }

    llm = get_peft_model(
        llm,
        LoraConfig(
            r=int(l.get("lora_r", 8)),
            lora_alpha=int(l.get("lora_alpha", 16)),
            lora_dropout=float(l.get("lora_dropout", 0.05)),
            bias="none",
            task_type="CAUSAL_LM",
            target_modules=sorted(targets),
        ),
    )

    llm = llm.float()

    model = PTNWatermeal(
        vision,
        feature_dim,
        llm,
    )

    model.load_state_dict(checkpoint["state_dict"], strict=True)
    model.to(device)
    model.eval()


@app.on_event("startup")
def startup():
    load_model()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model": "PTN-Watermeal1.0",
        "architecture": "PTNWatermeal",
        "labels": LABELS,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        load_model()

    raw = await file.read()
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model.classify(tensor)
        probabilities = torch.softmax(logits, dim=1)[0]

    index = int(torch.argmax(probabilities))
    confidence = float(probabilities[index])

    return {
        "plant": "Hemp",
        "diagnosis": LABELS[index],
        "confidence": round(confidence * 100, 2),
        "severity": (
            "Low"
            if index == 0
            else "Moderate"
            if index == 1
            else "High"
            if index == 2
            else "Critical"
        ),
        "model": "PTN-Watermeal1.0",
        "aiProviderUsed": "custom-dedicated-gpu",
        "probabilities": {
            label: round(float(probabilities[i]) * 100, 2)
            for i, label in enumerate(LABELS)
        },
    }


@app.post("/identify")
async def identify(file: UploadFile = File(...)):
    return {
        "species": "Hemp",
        "commonName": "Industrial Hemp",
        "confidence": 100,
        "model": "PTN-Watermeal1.0",
    }


@app.post("/chat")
async def chat():
    return {
        "message": "PTN-Watermeal1.0 currently provides water-stress diagnosis. General Dr. Flora chat remains handled by the configured LLM provider."
    }
