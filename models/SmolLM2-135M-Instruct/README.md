# SmolLM2-135M-Instruct

Plantinia uses Hugging Face `HuggingFaceTB/SmolLM2-135M-Instruct` as the small local language-model base for development and fine-tuning.

The actual model weights are intentionally **not committed to Git**. On the development machine the expected local path is:

```text
models/SmolLM2-135M-Instruct
```

The unified trainer loads this directory with `local_files_only=True`, preventing accidental model downloads during a training run.

## Roles

- `llm`: text-only Plantinia Book / reasoning fine-tune.
- `interactive`: separate conversational model training.
- `joint`: SmolLM2 is the language branch of the single multimodal PTN checkpoint; a vision encoder is projected into the LLM hidden space and both branches are optimized together.

Do not fine-tune from scratch. Start from the pretrained base and use LoRA/PEFT where practical on the target hardware.
