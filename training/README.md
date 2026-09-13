# Plantinia Training System

Plantinia training is intentionally separate from the production Next.js/Vercel app. Heavy training runs locally or on a GPU machine; the web app consumes exported model artifacts.

## Training modes

- `vision`: train a standalone image classifier.
- `llm`: fine-tune SmolLM2 with Plantinia Book/training examples using LoRA/PEFT.
- `joint`: train **one multimodal Plantinia model** in a single run. A lightweight vision encoder produces an image embedding which is projected into the SmolLM2 hidden space; the language model then learns from the image + text together. Gradients update both branches in the same optimization step.
- `interactive`: LLM-only conversational training. This is intentionally separate from the multimodal model and is not merged into the joint checkpoint.

The `joint` mode is the normal path for named PTN models. For example, `PTN-Watermeal1` can be a joint model whose vision branch learns water-stress evidence while the language branch learns Plantinia-style diagnostic reasoning.

## Important distinction

A joint checkpoint is one deployable model bundle, but it is not magic weight sharing: it contains a vision encoder, an LLM, and a trainable projection/fusion layer. The branches are trained together and exported together. This is the practical architecture for a small local machine and can later be replaced by a more advanced multimodal backbone without changing the dataset contract.

## Dataset contract

### Vision JSONL

Each line:

```json
{"image":"datasets/Watermeal/train/a.jpg","label":"underwatered"}
```

For classification, use one of the labels declared in the model config. Keep train/valid/test physically separate and do not put duplicates across splits.

### Joint JSONL

Each line:

```json
{"image":"datasets/Watermeal/train/a.jpg","prompt":"Assess the plant's water status. State the observation, likely status, confidence, and next safe action.","response":"Likely underwatered. Evidence includes drooping and dry-looking foliage. Confidence: moderate. Check soil moisture before watering; do not diagnose from leaf color alone."}
```

The joint model learns the response text from the image and prompt. The response should be grounded in verified Plantinia Book material and should preserve uncertainty where the image alone is insufficient.

### LLM JSONL

Each line:

```json
{"prompt":"What can yellow leaves mean?","response":"Yellowing is a symptom, not a diagnosis. Possible causes include..."}
```

## Local setup

Recommended Python environment:

```powershell
cd E:\Desktop\Plantinia
python -m venv .venv-training
.\.venv-training\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r training\requirements.txt
```

The project already has a downloaded SmolLM2-135M-Instruct directory at `models/SmolLM2-135M-Instruct` on the development machine. **Do not commit model weights or datasets to Git.**

## Commands

Low-memory first run:

```powershell
python training\train.py --mode joint --config training\configs\PTN-Watermeal1.json
```

Vision only:

```powershell
python training\train.py --mode vision --config training\configs\PTN-Watermeal1.json
```

LLM only:

```powershell
python training\train.py --mode llm --config training\configs\PTN-Watermeal1.json
```

Interactive LLM-only model:

```powershell
python training\train.py --mode interactive --config training\configs\PTN-Interactive1.json
```

The trainer supports CPU, CUDA, batch size 1, gradient accumulation, checkpoint resume, deterministic seeds, validation, and a single exported model bundle under `training/runs/`.

## PTN naming

`PTN-<task><version>` identifies a Plantinia model family/version. `PTN-Watermeal1` is the first water-status model. The manifest records the vision labels, LLM base, dataset paths, training mode, metrics, and component checkpoints so production can load the exact artifact rather than guessing.

## Safety

Training data is not automatically treated as truth. The trainer does not invent botanical facts, diagnoses, or treatments. Research must be validated before it becomes training data. Plantinia's core rule remains **SYMPTOM != DIAGNOSIS**.
