"""Prepare PTN-Watermeal1 datasets from a class-folder image dataset.

Expected source layout:
  <source>/healthy/*
  <source>/water_stress_3_days/*
  <source>/water_stress_6_days/*
  <source>/water_stress_9_days/*

Creates vision JSONL plus joint multimodal JSONL. The same image is paired with
an instruction/response so the single joint model learns both visual class
features and plant-doctor language behavior.
"""
from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

LABELS = ["healthy", "water_stress_3_days", "water_stress_6_days", "water_stress_9_days"]
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")


def response_for(label: str) -> str:
    if label == "healthy":
        return "The image is consistent with a healthy-looking plant. Water status should still be confirmed with soil moisture and recent watering history."
    if label == "water_stress_3_days":
        return "The image is consistent with mild water stress associated with three days without irrigation in the source experiment. Confirm with soil moisture and recent watering history before changing the watering routine."
    if label == "water_stress_6_days":
        return "The image is consistent with moderate water stress associated with six days without irrigation in the source experiment. Confirm with soil moisture and recent watering history before changing the watering routine."
    return "The image is consistent with severe water stress associated with nine days without irrigation in the source experiment. Confirm with soil moisture and recent watering history before changing the watering routine."


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--source", required=True, help="Folder containing healthy/water_stress_3_days/water_stress_6_days/water_stress_9_days")
    p.add_argument("--output", default="datasets/Watermeal")
    p.add_argument("--valid-ratio", type=float, default=0.15)
    p.add_argument("--test-ratio", type=float, default=0.15)
    p.add_argument("--seed", type=int, default=42)
    args = p.parse_args()

    source = Path(args.source).resolve()
    output = Path(args.output)
    if not source.exists():
        raise SystemExit(f"Source dataset does not exist: {source}")
    if args.valid_ratio < 0 or args.test_ratio < 0 or args.valid_ratio + args.test_ratio >= 1:
        raise SystemExit("valid-ratio + test-ratio must be between 0 and 1")

    rng = random.Random(args.seed)
    rows: list[dict] = []
    counts = {}
    for label in LABELS:
        folder = source / label
        if not folder.is_dir():
            raise SystemExit(f"Missing class folder: {folder}")
        images = sorted(x for x in folder.rglob("*") if x.is_file() and x.suffix.lower() in EXTS)
        if not images:
            raise SystemExit(f"No images found for class: {label}")
        counts[label] = len(images)
        for image in images:
            rel = image.relative_to(Path.cwd()) if image.is_relative_to(Path.cwd()) else image
            rows.append({"image": str(rel), "label": label})

    splits = {"train": [], "valid": [], "test": []}
    for label in LABELS:
        class_rows = [r for r in rows if r["label"] == label]
        rng.shuffle(class_rows)
        n = len(class_rows)
        n_test = max(1, round(n * args.test_ratio)) if n >= 3 else 0
        n_valid = max(1, round(n * args.valid_ratio)) if n >= 3 else 0
        if n_test + n_valid >= n:
            n_test = max(0, n - 2)
            n_valid = 1 if n >= 2 else 0
        splits["test"].extend(class_rows[:n_test])
        splits["valid"].extend(class_rows[n_test:n_test + n_valid])
        splits["train"].extend(class_rows[n_test + n_valid:])

    for name in splits:
        rng.shuffle(splits[name])
        write_jsonl(output / f"{name}.jsonl", splits[name])

    def joint_row(row: dict) -> dict:
        return {
            "image": row["image"],
            "label": row["label"],
            "prompt": "Inspect this plant image for water status. Classify it using the four experimental water-stress classes and explain the evidence conservatively.",
            "response": f"Classification: {row['label']}. {response_for(row['label'])}",
        }

    write_jsonl(output / "joint_train.jsonl", [joint_row(r) for r in splits["train"]])
    write_jsonl(output / "joint_valid.jsonl", [joint_row(r) for r in splits["valid"]])
    (output / "dataset_manifest.json").write_text(json.dumps({
        "labels": LABELS,
        "counts_before_split": counts,
        "split_counts": {k: len(v) for k, v in splits.items()},
        "seed": args.seed,
        "source": "fearro/IoT_monitoring_hemp",
        "warning": "Labels come from the source experiment; generated responses do not create new visual ground truth."
    }, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(output.resolve()), "counts": {k: len(v) for k, v in splits.items()}}, indent=2))


if __name__ == "__main__":
    main()
