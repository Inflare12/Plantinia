import { User, Plant, Diagnosis, PlantTimelineEvent, CarePlanTask, KnowledgeItem, ModelMetadata, Invoice } from './schema';

// Development fallback store intentionally contains no credentials, API keys, or
// privileged demo accounts. Production data is seeded through prisma/seed.ts.
export const SEED_USERS: User[] = [];
export const SEED_PLANTS: Plant[] = [];
export const SEED_DIAGNOSES: Diagnosis[] = [];
export const SEED_TIMELINE_EVENTS: PlantTimelineEvent[] = [];
export const SEED_CARE_TASKS: CarePlanTask[] = [];
export const SEED_KNOWLEDGE_BASE: KnowledgeItem[] = [];
export const SEED_MODEL_METADATA: ModelMetadata[] = [];
export const SEED_INVOICES: Invoice[] = [];
