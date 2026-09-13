# Plantinia

Plantinia is an AI plant doctor SaaS with a web application, mobile-ready architecture, evidence-backed plant knowledge, custom vision models, and a local training pipeline.

## Application

The production application is built with Next.js, React, TypeScript, Prisma/PostgreSQL, and Capacitor. It supports plant diagnosis, plant tracking, reports, care plans, AI chat, authentication, subscriptions, weather context, media uploads, and production deployment.

## AI architecture

Plantinia uses a hybrid architecture rather than asking one model to memorize everything:

```text
Image / video
     ↓
Vision model
     ↓
Observed features + candidate predictions
     ↓
Plantinia Book / retrieval / evidence
     ↓
Reasoning LLM
     ↓
Dr. Flora
```

The Plantinia Book is intended to remain the factual evidence layer. The model should preserve uncertainty and follow **SYMPTOM != DIAGNOSIS**.

## Training

Training is deliberately separate from the Vercel production runtime. Heavy model training runs locally or on dedicated GPU infrastructure.

See [`training/README.md`](training/README.md) for the complete training system. It supports:

- standalone vision classification
- SmolLM2 LoRA fine-tuning
- **joint multimodal training** where vision + language are optimized in one run and exported as one PTN model bundle
- a separate interactive LLM-only training path
- CPU/GPU selection
- batch size 1 and gradient accumulation for low-memory machines
- deterministic seeds and validation
- model manifests and reproducible model/component paths

Example:

```powershell
python training\train.py --mode joint --config training\configs\PTN-Watermeal1.json
```

`PTN-Watermeal1` is the first planned water-status model. Its initial labels are healthy, underwatered, and overwatered. Do not start training until its dataset has verified labels and clean train/validation/test separation.

The local SmolLM2-135M-Instruct weights are not committed to Git; see `models/SmolLM2-135M-Instruct/README.md`.

## Research

Phase 1 Plantinia Book research is recorded in [`docs/PLANTINIA_BOOK_PHASE1.md`](docs/PLANTINIA_BOOK_PHASE1.md). Research is treated as a working knowledge source until claims, sources, treatments, and contradictions are validated.

## Run the web app locally

Prerequisites: Node.js 24.x, PostgreSQL/Neon, and the environment variables in `.env.example`.

```powershell
npm install
npx prisma generate
npm test
npx tsc --noEmit
npm run build
npm run dev
```

## Deployment

The Next.js application is designed for Vercel-style deployment. Production secrets, storage, payment providers, email, database, and AI provider configuration are validated at runtime where appropriate. Model training is not part of the Vercel web request path.
