# PTN-Watermeal1.0 — first Plantinia multimodal model

PTN-Watermeal1.0 is a **single multimodal model**, not two models used one after another.

Architecture:

`image -> MobileNetV3-Small -> image embedding -> fusion projector -> SmolLM2-135M-Instruct -> plant-doctor response`

At every training step the same `PTNWatermeal` model receives:
- a plant image;
- a water-status class target (`healthy`, `underwatered`, `overwatered`);
- a text instruction and response target.

The loss is:

`total loss = language loss + vision_loss_weight * vision classification loss`

Both the vision branch and the language/LoRA branch are updated by the same optimizer step. The complete model is exported to one `model.pt` file.

The separate `PTN-Interactive1` model remains intentionally LLM-only. It is not merged into Watermeal.

## 1. Dataset

Use real, reliable water-status labels. Do not use PlantWild as the water-stress ground truth; PlantWild is a plant-identification resource.

Source folder must be:

```text
watermeal_source/
  healthy/
    image001.jpg
    image002.jpg
  underwatered/
    image101.jpg
  overwatered/
    image201.jpg
```

Then prepare the training files from the Plantinia root:

```powershell
cd E:\Desktop\Plantinia
python training\prepare_watermeal.py --source E:\path\to\watermeal_source
```

This creates:

```text
datasets/Watermeal/
  train.jsonl
  valid.jsonl
  test.jsonl
  joint_train.jsonl
  joint_valid.jsonl
  dataset_manifest.json
```

The joint files pair each image with a conservative Plantinia doctor-style instruction and response. The response does not invent new visual labels; the class label comes from the source dataset.

## 2. Validate before training

```powershell
cd E:\Desktop\Plantinia
python training\validate_watermeal.py --config training\configs\PTN-Watermeal1.json
```

You must see:

`READY: PTN-Watermeal1 dataset and local SmolLM2 base are valid.`

## 3. Train the ONE model

Make sure SmolLM2 exists at:

`E:\Desktop\Plantinia\models\SmolLM2-135M-Instruct`

Then run:

```powershell
cd E:\Desktop\Plantinia
python training\train_joint.py --config training\configs\PTN-Watermeal1.json
```

The trainer automatically uses CUDA if available, otherwise CPU. The config is intentionally conservative for an 8 GB development machine: batch size 1, gradient accumulation 8, MobileNetV3-Small, and SmolLM2-135M-Instruct with LoRA.

## 4. Output

The first finished checkpoint is:

`training/runs/PTN-Watermeal1.0/model.pt`

It contains the complete `PTNWatermeal` state dict, including:
- MobileNetV3-Small vision weights;
- the image-to-language fusion projector;
- the SmolLM2 base weights;
- trained LoRA weights;
- configuration and metrics.

`llm_adapter/`, `tokenizer/`, `labels.json`, and `manifest.json` are supporting export files. They do not mean Watermeal is architecturally two separate models.

## 5. First run recommendation

Keep `epochs: 1` for the first smoke/training run. Confirm that:
- images load;
- language loss is finite;
- vision loss is finite;
- vision accuracy is reported;
- validation completes;
- `model.pt` is written.

Only after this succeeds should epochs, dataset size, augmentation, class balance, and loss weighting be tuned.
