"""Validate PTN-Watermeal1 data before training."""
from __future__ import annotations
import argparse, json
from pathlib import Path
from PIL import Image

LABELS={"healthy","underwatered","overwatered"}
ROOT=Path(__file__).resolve().parents[1]

def p(v):
    x=Path(v); return x if x.is_absolute() else ROOT/x

def load(path):
    if not path.exists(): raise SystemExit(f"Missing: {path}")
    rows=[]
    for n,line in enumerate(path.read_text(encoding="utf-8").splitlines(),1):
        if not line.strip(): continue
        try: rows.append(json.loads(line))
        except Exception as e: raise SystemExit(f"Invalid JSON {path}:{n}: {e}")
    return rows

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--config",default="training/configs/PTN-Watermeal1.json"); args=ap.parse_args()
    c=json.loads(p(args.config).read_text(encoding="utf-8")); d=c["data"]
    all_ok=True
    for key in ("joint_train","joint_valid"):
        f=p(d[key]); rows=load(f); counts={x:0 for x in LABELS}
        for i,r in enumerate(rows):
            if r.get("label") not in LABELS: print(f"ERROR {f}:{i}: invalid label {r.get('label')}"); all_ok=False; continue
            counts[r["label"]]+=1
            image=p(r["image"])
            if not image.exists(): print(f"ERROR {f}:{i}: missing image {image}"); all_ok=False; continue
            try:
                with Image.open(image) as im: im.verify()
            except Exception as e: print(f"ERROR {f}:{i}: unreadable image {image}: {e}"); all_ok=False
            if not r.get("prompt") or not r.get("response"): print(f"ERROR {f}:{i}: missing prompt/response"); all_ok=False
        print(f"{key}: {len(rows)} rows | {counts}")
    base=p(c["llm"]["base_model"])
    if not base.exists(): print(f"ERROR: SmolLM2 base model not found: {base}"); all_ok=False
    if all_ok: print("READY: PTN-Watermeal1 dataset and local SmolLM2 base are valid.")
    else: raise SystemExit(1)

if __name__=="__main__": main()
