import { prisma } from './prisma';
import {
  SEED_USERS,
  SEED_PLANTS,
  SEED_DIAGNOSES,
  SEED_TIMELINE_EVENTS,
  SEED_CARE_TASKS,
  SEED_KNOWLEDGE_BASE,
  SEED_MODEL_METADATA,
  SEED_INVOICES,
} from './seed-data';
import {
  User,
  Plant,
  Diagnosis,
  PlantTimelineEvent,
  CarePlanTask,
  ChatMessage,
  KnowledgeItem,
  ModelMetadata,
  Invoice,
  UserFeedback,
} from './schema';

const roleToPrisma = (v: User['role']) => v.toUpperCase() as 'USER' | 'ADMIN';
const tierToPrisma = (v: User['subscriptionTier']) =>
  v.toUpperCase() as 'FREE' | 'CARE' | 'DOCTOR' | 'PRO' | 'FARM';
const statusToPrisma = (v: User['subscriptionStatus']) =>
  v.toUpperCase() as 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'PAST_DUE';
const healthToPrisma = (v: Plant['healthStatus']) =>
  v.toUpperCase() as 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'TREATING';
const pathogenToPrisma = (v: Diagnosis['pathogenType']) =>
  v.toUpperCase() as 'FUNGAL' | 'BACTERIAL' | 'VIRAL' | 'PEST' | 'ENVIRONMENTAL' | 'NONE';
const severityToPrisma = (v: Diagnosis['severity']) =>
  v.toUpperCase() as 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';

const roleFromPrisma = (v: string): User['role'] =>
  v.toLowerCase() as User['role'];
const tierFromPrisma = (v: string): User['subscriptionTier'] =>
  v.toLowerCase() as User['subscriptionTier'];
const statusFromPrisma = (v: string): User['subscriptionStatus'] =>
  v.toLowerCase() as User['subscriptionStatus'];
const healthFromPrisma = (v: string): Plant['healthStatus'] =>
  v.toLowerCase() as Plant['healthStatus'];
const pathogenFromPrisma = (v: string): Diagnosis['pathogenType'] =>
  v.toLowerCase() as Diagnosis['pathogenType'];
const severityFromPrisma = (v: string): Diagnosis['severity'] =>
  v.toLowerCase() as Diagnosis['severity'];

const dateToString = (value: Date | null | undefined): string | undefined =>
  value ? value.toISOString() : undefined;

function mapUser(u: any): User {
  return {
    id: u.id,
    email: u.email,
    passwordHash: u.passwordHash,
    name: u.name,
    avatarUrl: u.avatarUrl ?? undefined,
    role: roleFromPrisma(u.role),
    isEmailVerified: u.isEmailVerified,
    verificationToken: u.verificationToken ?? undefined,
    verificationCode: u.verificationCode ?? undefined,
    verificationCodeExpiresAt: u.verificationCodeExpiresAt?.toISOString(),
    resetPasswordToken: u.resetPasswordToken ?? undefined,
    subscriptionTier: tierFromPrisma(u.subscriptionTier),
    subscriptionStatus: statusFromPrisma(u.subscriptionStatus),
    subscriptionCurrentPeriodEnd: dateToString(u.subscriptionCurrentPeriodEnd),
    paymentProvider: u.paymentProvider ?? null,
    subscriptionId: u.subscriptionId ?? undefined,
    creditsRemaining: u.creditsRemaining,
    videoCreditsRemaining: u.videoCreditsRemaining ?? undefined,
    apiKey: u.apiKey ?? undefined,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

function mapPlant(p: any): Plant {
  return {
    id: p.id,
    userId: p.userId,
    name: p.name,
    species: p.species,
    commonName: p.commonName,
    imageUrl: p.imageUrl,
    location: p.location as Plant['location'],
    healthStatus: healthFromPrisma(p.healthStatus),
    sunlightNeeds: p.sunlightNeeds as Plant['sunlightNeeds'],
    wateringFrequencyDays: p.wateringFrequencyDays,
    lastWateredDate: dateToString(p.lastWateredDate),
    nextWateringDate: dateToString(p.nextWateringDate),
    notes: p.notes ?? undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function mapDiagnosis(d: any): Diagnosis {
  return {
    id: d.id,
    userId: d.userId,
    plantId: d.plantId ?? undefined,
    mediaType: d.mediaType as Diagnosis['mediaType'],
    mediaUrl: d.mediaUrl,
    identifiedSpecies: d.identifiedSpecies,
    diseaseName: d.diseaseName,
    pathogenType: pathogenFromPrisma(d.pathogenType),
    confidence: d.confidence,
    severity: severityFromPrisma(d.severity),
    uncertainty: d.uncertainty as Diagnosis['uncertainty'] ?? undefined,
    symptoms: d.symptoms as string[],
    causes: d.causes as string[],
    prognosis: d.prognosis,
    treatmentSteps: d.treatmentSteps as Diagnosis['treatmentSteps'],
    organicRemedies: d.organicRemedies as string[],
    chemicalRemedies: d.chemicalRemedies as Diagnosis['chemicalRemedies'],
    preventativeMeasures: d.preventativeMeasures as string[],
    boundingBoxes: d.boundingBoxes
      ? (d.boundingBoxes as Diagnosis['boundingBoxes'])
      : undefined,
    aiProviderUsed: d.aiProviderUsed,
    modelVersion: d.modelVersion ?? undefined,
    candidates: d.candidates as Diagnosis['candidates'] ?? undefined,
    knowledgeReferences: d.knowledgeReferences as Diagnosis['knowledgeReferences'] ?? undefined,
    adminReviewed: d.adminReviewed,
    adminAccuracyFeedback: d.adminAccuracyFeedback ?? undefined,
    createdAt: d.createdAt.toISOString(),
  };
}

function mapTimelineEvent(e: any): PlantTimelineEvent {
  return {
    id: e.id,
    plantId: e.plantId,
    userId: e.userId,
    eventType: e.eventType as PlantTimelineEvent['eventType'],
    title: e.title,
    description: e.description,
    imageUrl: e.imageUrl ?? undefined,
    createdAt: e.createdAt.toISOString(),
  };
}

function mapCareTask(t: any): CarePlanTask {
  return {
    id: t.id,
    userId: t.userId,
    plantId: t.plantId ?? undefined,
    plantName: t.plantName ?? undefined,
    title: t.title,
    category: t.category as CarePlanTask['category'],
    dueDate: t.dueDate.toISOString(),
    isCompleted: t.isCompleted,
    notes: t.notes ?? undefined,
    createdAt: t.createdAt.toISOString(),
  };
}

function mapChatMessage(m: any): ChatMessage {
  return {
    id: m.id,
    userId: m.userId,
    plantId: m.plantId ?? undefined,
    role: m.role as ChatMessage['role'],
    content: m.content,
    mediaUrl: m.mediaUrl ?? undefined,
    createdAt: m.createdAt.toISOString(),
  };
}

function mapKnowledgeItem(k: any): KnowledgeItem {
  return {
    id: k.id,
    type: k.type as KnowledgeItem['type'],
    name: k.name,
    scientificName: k.scientificName ?? undefined,
    commonNames: k.commonNames as KnowledgeItem['commonNames'] ?? undefined,
    category: k.category ?? undefined,
    description: k.description ?? undefined,
    affectedPlants: k.affectedPlants as KnowledgeItem['affectedPlants'] ?? undefined,
    symptoms: k.symptoms as KnowledgeItem['symptoms'] ?? undefined,
    treatment: k.treatment as any,
    prevention: k.prevention as any,
    sources: k.sources as KnowledgeItem['sources'] ?? undefined,
    imageUrl: k.imageUrl ?? undefined,
    metadata: k.metadata as KnowledgeItem['metadata'] ?? undefined,
    isActive: k.isActive,
    lastUpdated: k.lastUpdated.toISOString(),
  };
}

function mapModelMetadata(m: any): ModelMetadata {
  return {
    id: m.id,
    name: m.name,
    version: m.version,
    type: m.type as ModelMetadata['type'],
    status: m.status as ModelMetadata['status'],
    description: m.description,
    trainedOn: m.trainedOn,
    accuracy: m.accuracy ?? undefined,
    classes: m.classes as ModelMetadata['classes'] ?? undefined,
    inputSize: m.inputSize as ModelMetadata['inputSize'] ?? undefined,
    preprocessing: m.preprocessing as ModelMetadata['preprocessing'] ?? undefined,
    lastUpdated: m.lastUpdated.toISOString(),
    license: m.license ?? undefined,
    citation: m.citation ?? undefined,
    isActive: m.isActive,
    registeredAt: m.registeredAt.toISOString(),
  };
}

function mapUserFeedback(f: any): UserFeedback {
  return {
    id: f.id,
    userId: f.userId,
    diagnosisId: f.diagnosisId,
    wasCorrect: f.wasCorrect,
    correction: f.correction ?? undefined,
    notes: f.notes ?? undefined,
    timestamp: f.timestamp.toISOString(),
  };
}

function mapInvoice(i: any): Invoice {
  return {
    id: i.id,
    userId: i.userId,
    amount: i.amount,
    currency: i.currency as Invoice['currency'],
    provider: i.provider as Invoice['provider'],
    providerPaymentId: i.providerPaymentId,
    status: i.status as Invoice['status'],
    plan: i.plan,
    receiptUrl: i.receiptUrl ?? undefined,
    createdAt: i.createdAt.toISOString(),
  };
}

const globalForStore = globalThis as unknown as {
  inMemoryStore: {
    users: User[];
    plants: Plant[];
    diagnoses: Diagnosis[];
    timeline: PlantTimelineEvent[];
    careTasks: CarePlanTask[];
    chatMessages: ChatMessage[];
    knowledge: KnowledgeItem[];
    modelMetadata: ModelMetadata[];
    userFeedback: UserFeedback[];
    invoices: Invoice[];
  } | undefined;
};

const store = globalForStore.inMemoryStore ?? {
  users: [...SEED_USERS],
  plants: [...SEED_PLANTS],
  diagnoses: [...SEED_DIAGNOSES],
  timeline: [...SEED_TIMELINE_EVENTS],
  careTasks: [...SEED_CARE_TASKS],
  chatMessages: [],
  knowledge: [...SEED_KNOWLEDGE_BASE],
  modelMetadata: [...SEED_MODEL_METADATA],
  userFeedback: [],
  invoices: [...SEED_INVOICES],
};

if (process.env.NODE_ENV !== 'production') {
  globalForStore.inMemoryStore = store;
}

const isProd = process.env.NODE_ENV === 'production';

const isPostgres = () => {
  const url = process.env.DATABASE_URL;
  return typeof url === 'string' && (url.startsWith('postgres://') || url.startsWith('postgresql://'));
};

export const db = {
  users: {
    async findById(id: string): Promise<User | null> {
      if (isProd) {
        const user = await prisma.user.findUnique({ where: { id } });
        return user ? mapUser(user) : null;
      }
      if (isPostgres()) {
        try {
          const user = await prisma.user.findUnique({ where: { id } });
          if (user) return mapUser(user);
        } catch {}
      }
      return store.users.find((u) => u.id === id) ?? null;
    },

    async findByEmail(email: string): Promise<User | null> {
      if (isProd) {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });
        return user ? mapUser(user) : null;
      }
      if (isPostgres()) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
          });
          if (user) return mapUser(user);
        } catch {}
      }
      return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) ?? null;
    },

    async findByApiKey(apiKey: string): Promise<User | null> {
      if (!apiKey || apiKey.length < 16) return null;
      if (isProd) {
        const user = await prisma.user.findUnique({
          where: { apiKey },
        });
        return user ? mapUser(user) : null;
      }
      if (isPostgres()) {
        try {
          const user = await prisma.user.findUnique({
            where: { apiKey },
          });
          if (user) return mapUser(user);
        } catch {}
      }
      return store.users.find((u) => u.apiKey === apiKey) ?? null;
    },

    async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
      const data = {
        email: user.email.toLowerCase().trim(),
        passwordHash: user.passwordHash,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: roleToPrisma(user.role),
        isEmailVerified: user.isEmailVerified,
        verificationToken: user.verificationToken,
        verificationCode: user.verificationCode,
        verificationCodeExpiresAt: user.verificationCodeExpiresAt ? new Date(user.verificationCodeExpiresAt) : undefined,
        resetPasswordToken: user.resetPasswordToken,
        subscriptionTier: tierToPrisma(user.subscriptionTier),
        subscriptionStatus: statusToPrisma(user.subscriptionStatus),
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd
          ? new Date(user.subscriptionCurrentPeriodEnd)
          : undefined,
        paymentProvider: user.paymentProvider ?? undefined,
        subscriptionId: user.subscriptionId,
        creditsRemaining: user.creditsRemaining,
        apiKey: user.apiKey,
      };

      if (isProd) {
        const created = await prisma.user.create({ data });
        return mapUser(created);
      }
      if (isPostgres()) {
        try {
          const created = await prisma.user.create({ data });
          const mapped = mapUser(created);
          store.users.push(mapped);
          return mapped;
        } catch {}
      }

      const now = new Date().toISOString();
      const newUser: User = {
        id: `user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now,
        ...user,
      };
      store.users.push(newUser);
      return newUser;
    },

    async update(id: string, updates: Partial<User>): Promise<User | null> {
      const data: any = {};

      if (updates.email !== undefined) data.email = updates.email.toLowerCase().trim();
      if (updates.passwordHash !== undefined) data.passwordHash = updates.passwordHash;
      if (updates.name !== undefined) data.name = updates.name;
      if (updates.avatarUrl !== undefined) data.avatarUrl = updates.avatarUrl;
      if (updates.role !== undefined) data.role = roleToPrisma(updates.role);
      if (updates.isEmailVerified !== undefined) data.isEmailVerified = updates.isEmailVerified;
      if (updates.verificationToken !== undefined) data.verificationToken = updates.verificationToken;
      if (updates.verificationCode !== undefined) data.verificationCode = updates.verificationCode;
      if (updates.verificationCodeExpiresAt !== undefined) data.verificationCodeExpiresAt = updates.verificationCodeExpiresAt ? new Date(updates.verificationCodeExpiresAt) : null;
      if (updates.resetPasswordToken !== undefined) data.resetPasswordToken = updates.resetPasswordToken;
      if (updates.subscriptionTier !== undefined) data.subscriptionTier = tierToPrisma(updates.subscriptionTier);
      if (updates.subscriptionStatus !== undefined) data.subscriptionStatus = statusToPrisma(updates.subscriptionStatus);
      if (updates.subscriptionCurrentPeriodEnd !== undefined) {
        data.subscriptionCurrentPeriodEnd = updates.subscriptionCurrentPeriodEnd
          ? new Date(updates.subscriptionCurrentPeriodEnd)
          : null;
      }
      if (updates.paymentProvider !== undefined) data.paymentProvider = updates.paymentProvider;
      if (updates.subscriptionId !== undefined) data.subscriptionId = updates.subscriptionId;
      if (updates.creditsRemaining !== undefined) data.creditsRemaining = updates.creditsRemaining;
      if (updates.apiKey !== undefined) data.apiKey = updates.apiKey;

      if (isProd) {
        const updated = await prisma.user.update({
          where: { id },
          data,
        });
        return mapUser(updated);
      }
      if (isPostgres()) {
        try {
          const updated = await prisma.user.update({
            where: { id },
            data,
          });
          const mapped = mapUser(updated);
          const inMemIdx = store.users.findIndex((u) => u.id === id);
          if (inMemIdx !== -1) {
            store.users[inMemIdx] = { ...store.users[inMemIdx], ...updates, updatedAt: new Date().toISOString() };
          }
          return mapped;
        } catch {}
      }

      const inMemIdx = store.users.findIndex((u) => u.id === id);
      if (inMemIdx === -1) return null;
      store.users[inMemIdx] = {
        ...store.users[inMemIdx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return { ...store.users[inMemIdx] };
    },

    async listAll(): Promise<User[]> {
      if (isProd) {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return users.map(mapUser);
      }
      if (isPostgres()) {
        try {
          const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
          });
          return users.map(mapUser);
        } catch {}
      }
      return [...store.users];
    },
  },

  plants: {
    async listByUser(userId: string): Promise<Plant[]> {
      if (isProd) {
        const plants = await prisma.plant.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        return plants.map(mapPlant);
      }
      if (isPostgres()) {
        try {
          const plants = await prisma.plant.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          });
          return plants.map(mapPlant);
        } catch {}
      }
      return store.plants
        .filter((p) => p.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async findById(id: string): Promise<Plant | null> {
      if (isProd) {
        const plant = await prisma.plant.findUnique({ where: { id } });
        return plant ? mapPlant(plant) : null;
      }
      if (isPostgres()) {
        try {
          const plant = await prisma.plant.findUnique({ where: { id } });
          if (plant) return mapPlant(plant);
        } catch {}
      }
      return store.plants.find((p) => p.id === id) ?? null;
    },

    async create(plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plant> {
      const data = {
        userId: plant.userId,
        name: plant.name,
        species: plant.species,
        commonName: plant.commonName,
        imageUrl: plant.imageUrl,
        location: plant.location,
        healthStatus: healthToPrisma(plant.healthStatus),
        sunlightNeeds: plant.sunlightNeeds,
        wateringFrequencyDays: plant.wateringFrequencyDays,
        lastWateredDate: plant.lastWateredDate ? new Date(plant.lastWateredDate) : undefined,
        nextWateringDate: plant.nextWateringDate ? new Date(plant.nextWateringDate) : undefined,
        notes: plant.notes,
      };

      if (isProd) {
        const created = await prisma.plant.create({ data });
        return mapPlant(created);
      }
      if (isPostgres()) {
        try {
          const created = await prisma.plant.create({ data });
          const mapped = mapPlant(created);
          store.plants.push(mapped);
          return mapped;
        } catch {}
      }

      const now = new Date().toISOString();
      const newPlant: Plant = {
        id: `plant_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now,
        ...plant,
      };
      store.plants.push(newPlant);
      return newPlant;
    },

    async update(id: string, updates: Partial<Plant>): Promise<Plant | null> {
      const data: any = {};

      if (updates.userId !== undefined) data.userId = updates.userId;
      if (updates.name !== undefined) data.name = updates.name;
      if (updates.species !== undefined) data.species = updates.species;
      if (updates.commonName !== undefined) data.commonName = updates.commonName;
      if (updates.imageUrl !== undefined) data.imageUrl = updates.imageUrl;
      if (updates.location !== undefined) data.location = updates.location;
      if (updates.healthStatus !== undefined) data.healthStatus = healthToPrisma(updates.healthStatus);
      if (updates.sunlightNeeds !== undefined) data.sunlightNeeds = updates.sunlightNeeds;
      if (updates.wateringFrequencyDays !== undefined) data.wateringFrequencyDays = updates.wateringFrequencyDays;
      if (updates.lastWateredDate !== undefined) {
        data.lastWateredDate = updates.lastWateredDate ? new Date(updates.lastWateredDate) : null;
      }
      if (updates.nextWateringDate !== undefined) {
        data.nextWateringDate = updates.nextWateringDate ? new Date(updates.nextWateringDate) : null;
      }
      if (updates.notes !== undefined) data.notes = updates.notes;

      if (isProd) {
        const updated = await prisma.plant.update({
          where: { id },
          data,
        });
        return mapPlant(updated);
      }
      if (isPostgres()) {
        try {
          const updated = await prisma.plant.update({
            where: { id },
            data,
          });
          const mapped = mapPlant(updated);
          const inMemIdx = store.plants.findIndex((p) => p.id === id);
          if (inMemIdx !== -1) {
            store.plants[inMemIdx] = { ...store.plants[inMemIdx], ...updates, updatedAt: new Date().toISOString() };
          }
          return mapped;
        } catch {}
      }

      const inMemIdx = store.plants.findIndex((p) => p.id === id);
      if (inMemIdx === -1) return null;
      store.plants[inMemIdx] = {
        ...store.plants[inMemIdx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return { ...store.plants[inMemIdx] };
    },

    async delete(id: string): Promise<boolean> {
      if (isProd) {
        await prisma.plant.delete({ where: { id } });
        return true;
      }
      if (isPostgres()) {
        try {
          await prisma.plant.delete({ where: { id } });
          const inMemIdx = store.plants.findIndex((p) => p.id === id);
          if (inMemIdx !== -1) store.plants.splice(inMemIdx, 1);
          return true;
        } catch {}
      }
      const inMemIdx = store.plants.findIndex((p) => p.id === id);
      if (inMemIdx !== -1) {
        store.plants.splice(inMemIdx, 1);
        return true;
      }
      return false;
    },
  },

  diagnoses: {
    async listByUser(userId: string): Promise<Diagnosis[]> {
      if (isProd) {
        const diagnoses = await prisma.diagnosis.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        return diagnoses.map(mapDiagnosis);
      }
      if (isPostgres()) {
        try {
          const diagnoses = await prisma.diagnosis.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          });
          return diagnoses.map(mapDiagnosis);
        } catch {}
      }
      return store.diagnoses
        .filter((d) => d.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async listByPlant(plantId: string): Promise<Diagnosis[]> {
      if (isProd) {
        const diagnoses = await prisma.diagnosis.findMany({
          where: { plantId },
          orderBy: { createdAt: 'desc' },
        });
        return diagnoses.map(mapDiagnosis);
      }
      if (isPostgres()) {
        try {
          const diagnoses = await prisma.diagnosis.findMany({
            where: { plantId },
            orderBy: { createdAt: 'desc' },
          });
          return diagnoses.map(mapDiagnosis);
        } catch {}
      }
      return store.diagnoses
        .filter((d) => d.plantId === plantId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async findById(id: string): Promise<Diagnosis | null> {
      if (isProd) {
        const diagnosis = await prisma.diagnosis.findUnique({ where: { id } });
        return diagnosis ? mapDiagnosis(diagnosis) : null;
      }
      if (isPostgres()) {
        try {
          const diagnosis = await prisma.diagnosis.findUnique({ where: { id } });
          if (diagnosis) return mapDiagnosis(diagnosis);
        } catch {}
      }
      return store.diagnoses.find((d) => d.id === id) ?? null;
    },

    async create(diagnosis: Omit<Diagnosis, 'id' | 'createdAt'>): Promise<Diagnosis> {
      const data = {
        userId: diagnosis.userId,
        plantId: diagnosis.plantId,
        mediaType: diagnosis.mediaType,
        mediaUrl: diagnosis.mediaUrl,
        identifiedSpecies: diagnosis.identifiedSpecies,
        diseaseName: diagnosis.diseaseName,
        pathogenType: pathogenToPrisma(diagnosis.pathogenType),
        confidence: diagnosis.confidence,
        severity: severityToPrisma(diagnosis.severity),
        uncertainty: diagnosis.uncertainty,
        symptoms: diagnosis.symptoms as any,
        causes: diagnosis.causes as any,
        prognosis: diagnosis.prognosis,
        treatmentSteps: diagnosis.treatmentSteps as any,
        organicRemedies: diagnosis.organicRemedies as any,
        chemicalRemedies: diagnosis.chemicalRemedies as any,
        preventativeMeasures: diagnosis.preventativeMeasures as any,
        boundingBoxes: diagnosis.boundingBoxes as any,
        aiProviderUsed: diagnosis.aiProviderUsed,
        modelVersion: diagnosis.modelVersion,
        candidates: diagnosis.candidates as any,
        knowledgeReferences: diagnosis.knowledgeReferences as any,
        adminReviewed: diagnosis.adminReviewed,
        adminAccuracyFeedback: diagnosis.adminAccuracyFeedback,
      };

      if (isProd) {
        const created = await prisma.diagnosis.create({ data });
        return mapDiagnosis(created);
      }
      if (isPostgres()) {
        try {
          const created = await prisma.diagnosis.create({ data });
          const mapped = mapDiagnosis(created);
          store.diagnoses.push(mapped);
          return mapped;
        } catch {}
      }

      const now = new Date().toISOString();
      const newDiagnosis: Diagnosis = {
        id: `diag_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        ...diagnosis,
      };
      store.diagnoses.push(newDiagnosis);
      return newDiagnosis;
    },

    async update(id: string, updates: Partial<Diagnosis>): Promise<Diagnosis | null> {
      const data: any = {};

      if (updates.userId !== undefined) data.userId = updates.userId;
      if (updates.plantId !== undefined) data.plantId = updates.plantId;
      if (updates.mediaType !== undefined) data.mediaType = updates.mediaType;
      if (updates.mediaUrl !== undefined) data.mediaUrl = updates.mediaUrl;
      if (updates.identifiedSpecies !== undefined) data.identifiedSpecies = updates.identifiedSpecies;
      if (updates.diseaseName !== undefined) data.diseaseName = updates.diseaseName;
      if (updates.pathogenType !== undefined) data.pathogenType = pathogenToPrisma(updates.pathogenType);
      if (updates.confidence !== undefined) data.confidence = updates.confidence;
      if (updates.severity !== undefined) data.severity = severityToPrisma(updates.severity);
      if (updates.symptoms !== undefined) data.symptoms = updates.symptoms as any;
      if (updates.causes !== undefined) data.causes = updates.causes as any;
      if (updates.prognosis !== undefined) data.prognosis = updates.prognosis;
      if (updates.treatmentSteps !== undefined) data.treatmentSteps = updates.treatmentSteps as any;
      if (updates.organicRemedies !== undefined) data.organicRemedies = updates.organicRemedies as any;
      if (updates.chemicalRemedies !== undefined) data.chemicalRemedies = updates.chemicalRemedies as any;
      if (updates.preventativeMeasures !== undefined) data.preventativeMeasures = updates.preventativeMeasures as any;
      if (updates.boundingBoxes !== undefined) data.boundingBoxes = updates.boundingBoxes as any;
      if (updates.aiProviderUsed !== undefined) data.aiProviderUsed = updates.aiProviderUsed;
      if (updates.uncertainty !== undefined) data.uncertainty = updates.uncertainty;
      if (updates.modelVersion !== undefined) data.modelVersion = updates.modelVersion;
      if (updates.candidates !== undefined) data.candidates = updates.candidates as any;
      if (updates.knowledgeReferences !== undefined) data.knowledgeReferences = updates.knowledgeReferences as any;
      if (updates.adminReviewed !== undefined) data.adminReviewed = updates.adminReviewed;
      if (updates.adminAccuracyFeedback !== undefined) data.adminAccuracyFeedback = updates.adminAccuracyFeedback;

      if (isProd) {
        const updated = await prisma.diagnosis.update({
          where: { id },
          data,
        });
        return mapDiagnosis(updated);
      }
      if (isPostgres()) {
        try {
          const updated = await prisma.diagnosis.update({
            where: { id },
            data,
          });
          const mapped = mapDiagnosis(updated);
          const inMemIdx = store.diagnoses.findIndex((d) => d.id === id);
          if (inMemIdx !== -1) {
            store.diagnoses[inMemIdx] = { ...store.diagnoses[inMemIdx], ...updates };
          }
          return mapped;
        } catch {}
      }

      const inMemIdx = store.diagnoses.findIndex((d) => d.id === id);
      if (inMemIdx === -1) return null;
      store.diagnoses[inMemIdx] = {
        ...store.diagnoses[inMemIdx],
        ...updates,
      };
      return { ...store.diagnoses[inMemIdx] };
    },

    async listAll(): Promise<Diagnosis[]> {
      if (isProd) {
        const diagnoses = await prisma.diagnosis.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return diagnoses.map(mapDiagnosis);
      }
      if (isPostgres()) {
        try {
          const diagnoses = await prisma.diagnosis.findMany({
            orderBy: { createdAt: 'desc' },
          });
          return diagnoses.map(mapDiagnosis);
        } catch {}
      }
      return [...store.diagnoses];
    },
  },

  timeline: {
    async listByPlant(plantId: string): Promise<PlantTimelineEvent[]> {
      if (isProd) {
        const events = await prisma.plantTimelineEvent.findMany({
          where: { plantId },
          orderBy: { createdAt: 'desc' },
        });
        return events.map(mapTimelineEvent);
      }
      if (isPostgres()) {
        try {
          const events = await prisma.plantTimelineEvent.findMany({
            where: { plantId },
            orderBy: { createdAt: 'desc' },
          });
          return events.map(mapTimelineEvent);
        } catch {}
      }
      return store.timeline
        .filter((e) => e.plantId === plantId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async create(event: Omit<PlantTimelineEvent, 'id' | 'createdAt'>): Promise<PlantTimelineEvent> {
      const data = {
        plantId: event.plantId,
        userId: event.userId,
        eventType: event.eventType,
        title: event.title,
        description: event.description,
        imageUrl: event.imageUrl,
      };

      if (isProd) {
        const created = await prisma.plantTimelineEvent.create({ data });
        return mapTimelineEvent(created);
      }
      if (isPostgres()) {
        try {
          const created = await prisma.plantTimelineEvent.create({ data });
          const mapped = mapTimelineEvent(created);
          store.timeline.push(mapped);
          return mapped;
        } catch {}
      }

      const now = new Date().toISOString();
      const newEvent: PlantTimelineEvent = {
        id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        ...event,
      };
      store.timeline.push(newEvent);
      return newEvent;
    },
  },

  careTasks: {
    async listByUser(userId: string): Promise<CarePlanTask[]> {
      if (isProd) {
        const tasks = await prisma.carePlanTask.findMany({
          where: { userId },
          orderBy: { dueDate: 'asc' },
        });
        return tasks.map(mapCareTask);
      }
      if (isPostgres()) {
        try {
          const tasks = await prisma.carePlanTask.findMany({
            where: { userId },
            orderBy: { dueDate: 'asc' },
          });
          return tasks.map(mapCareTask);
        } catch {}
      }
      return store.careTasks
        .filter((t) => t.userId === userId)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    },

    async findById(id: string): Promise<CarePlanTask | null> {
      if (isProd) {
        const task = await prisma.carePlanTask.findUnique({ where: { id } });
        return task ? mapCareTask(task) : null;
      }
      if (isPostgres()) {
        try {
          const task = await prisma.carePlanTask.findUnique({ where: { id } });
          if (task) return mapCareTask(task);
        } catch {}
      }
      return store.careTasks.find((t) => t.id === id) ?? null;
    },

    async create(task: Omit<CarePlanTask, 'id' | 'createdAt'>): Promise<CarePlanTask> {
      const data = {
        userId: task.userId,
        plantId: task.plantId,
        plantName: task.plantName,
        title: task.title,
        category: task.category,
        dueDate: new Date(task.dueDate),
        isCompleted: task.isCompleted,
        notes: task.notes,
      };

      if (isProd) {
        const created = await prisma.carePlanTask.create({ data });
        return mapCareTask(created);
      }
      if (isPostgres()) {
        try {
          const created = await prisma.carePlanTask.create({ data });
          const mapped = mapCareTask(created);
          store.careTasks.push(mapped);
          return mapped;
        } catch {}
      }

      const now = new Date().toISOString();
      const newTask: CarePlanTask = {
        id: `task_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        ...task,
      };
      store.careTasks.push(newTask);
      return newTask;
    },

    async toggleComplete(id: string): Promise<CarePlanTask | null> {
      if (isProd) {
        const task = await prisma.carePlanTask.findUnique({ where: { id } });
        if (!task) return null;
        const updated = await prisma.carePlanTask.update({
          where: { id },
          data: { isCompleted: !task.isCompleted },
        });
        return mapCareTask(updated);
      }
      if (isPostgres()) {
        try {
          const task = await prisma.carePlanTask.findUnique({ where: { id } });
          if (task) {
            const updated = await prisma.carePlanTask.update({
              where: { id },
              data: { isCompleted: !task.isCompleted },
            });
            const mapped = mapCareTask(updated);
            const inMemIdx = store.careTasks.findIndex((t) => t.id === id);
            if (inMemIdx !== -1) {
              store.careTasks[inMemIdx].isCompleted = mapped.isCompleted;
            }
            return mapped;
          }
        } catch {}
      }
      const inMemIdx = store.careTasks.findIndex((t) => t.id === id);
      if (inMemIdx === -1) return null;
      store.careTasks[inMemIdx].isCompleted = !store.careTasks[inMemIdx].isCompleted;
      return { ...store.careTasks[inMemIdx] };
    },

    async delete(id: string): Promise<boolean> {
      if (isProd) {
        await prisma.carePlanTask.delete({ where: { id } });
        return true;
      }
      if (isPostgres()) {
        try {
          await prisma.carePlanTask.delete({ where: { id } });
          const inMemIdx = store.careTasks.findIndex((t) => t.id === id);
          if (inMemIdx !== -1) store.careTasks.splice(inMemIdx, 1);
          return true;
        } catch {}
      }
      const inMemIdx = store.careTasks.findIndex((t) => t.id === id);
      if (inMemIdx !== -1) {
        store.careTasks.splice(inMemIdx, 1);
        return true;
      }
      return false;
    },
  },

  chatMessages: {
    async listByUser(userId: string, plantId?: string): Promise<ChatMessage[]> {
      if (isProd) {
        const messages = await prisma.chatMessage.findMany({
          where: {
            userId,
            ...(plantId ? { plantId } : {}),
          },
          orderBy: { createdAt: 'asc' },
        });
        return messages.map(mapChatMessage);
      }
      if (isPostgres()) {
        try {
          const messages = await prisma.chatMessage.findMany({
            where: {
              userId,
              ...(plantId ? { plantId } : {}),
            },
            orderBy: { createdAt: 'asc' },
          });
          return messages.map(mapChatMessage);
        } catch {}
      }
      return store.chatMessages
        .filter((m) => m.userId === userId && (!plantId || m.plantId === plantId))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },

    async create(msg: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
      const data = {
        userId: msg.userId,
        plantId: msg.plantId,
        role: msg.role,
        content: msg.content,
        mediaUrl: msg.mediaUrl,
      };

      if (isProd) {
        const created = await prisma.chatMessage.create({ data });
        return mapChatMessage(created);
      }
      if (isPostgres()) {
        try {
          const created = await prisma.chatMessage.create({ data });
          const mapped = mapChatMessage(created);
          store.chatMessages.push(mapped);
          return mapped;
        } catch {}
      }

      const now = new Date().toISOString();
      const newMsg: ChatMessage = {
        id: `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        ...msg,
      };
      store.chatMessages.push(newMsg);
      return newMsg;
    },
  },

  knowledge: {
    async listAll(): Promise<KnowledgeItem[]> {
      if (isProd) {
        const items = await prisma.knowledgeItem.findMany({
          where: { isActive: true },
          orderBy: { lastUpdated: 'desc' },
        });
        return items.map(mapKnowledgeItem);
      }
      if (isPostgres()) {
        try {
          const items = await prisma.knowledgeItem.findMany({
            where: { isActive: true },
            orderBy: { lastUpdated: 'desc' },
          });
          if (items?.length) return items.map(mapKnowledgeItem);
        } catch {}
      }
      return store.knowledge.filter((k) => k.isActive);
    },

    async getByScientificName(scientificName: string): Promise<KnowledgeItem | null> {
      if (isProd) {
        const item = await prisma.knowledgeItem.findUnique({ 
          where: { scientificName, isActive: true } 
        });
        return item ? mapKnowledgeItem(item) : null;
      }
      if (isPostgres()) {
        try {
          const item = await prisma.knowledgeItem.findUnique({ 
            where: { scientificName, isActive: true } 
          });
          if (item) return mapKnowledgeItem(item);
        } catch {}
      }
      return store.knowledge.find(
        (k) =>
          k.scientificName?.toLowerCase() === scientificName.toLowerCase() &&
          k.isActive
      ) ?? null;
    },

    async search(query: string, type?: string): Promise<KnowledgeItem[]> {
      const q = query.toLowerCase();

      if (isProd) {
        const whereClause: any = { isActive: true };
        if (type) whereClause.type = type;

        const items = await prisma.knowledgeItem.findMany({
          where: whereClause,
        });

        return (items.map(mapKnowledgeItem) as KnowledgeItem[]).filter(
          (k: KnowledgeItem) =>
            k.name.toLowerCase().includes(q) ||
            (k.scientificName && k.scientificName.toLowerCase().includes(q)) ||
            (k.commonNames && k.commonNames.some((n: string) => n.toLowerCase().includes(q))) ||
            (k.description && k.description.toLowerCase().includes(q))
        );
      }

      if (isPostgres()) {
        try {
          const whereClause: any = { isActive: true };
          if (type) whereClause.type = type;

          const items = await prisma.knowledgeItem.findMany({
            where: whereClause,
          });

          if (items?.length) {
            return (items.map(mapKnowledgeItem) as KnowledgeItem[]).filter(
              (k: KnowledgeItem) =>
                k.name.toLowerCase().includes(q) ||
                (k.scientificName && k.scientificName.toLowerCase().includes(q)) ||
                (k.commonNames && k.commonNames.some((n: string) => n.toLowerCase().includes(q))) ||
                (k.description && k.description.toLowerCase().includes(q))
            );
          }
        } catch {}
      }

      return store.knowledge.filter((k) => {
        if (!k.isActive) return false;
        if (type && k.type !== type) return false;
        return (
          k.name.toLowerCase().includes(q) ||
          (k.scientificName && k.scientificName.toLowerCase().includes(q)) ||
          (k.commonNames && k.commonNames.some((n: string) => n.toLowerCase().includes(q))) ||
          (k.description && k.description.toLowerCase().includes(q))
        );
      });
    },
  },

  modelMetadata: {
    async listAll(): Promise<ModelMetadata[]> {
      if (isProd) {
        const models = await prisma.modelMetadata.findMany({
          orderBy: { registeredAt: 'desc' },
        });
        return models.map(mapModelMetadata);
      }
      if (isPostgres()) {
        try {
          const models = await prisma.modelMetadata.findMany({
            orderBy: { registeredAt: 'desc' },
          });
          if (models?.length) return models.map(mapModelMetadata);
        } catch {}
      }
      return [...store.modelMetadata];
    },

    async getActive(modelType: string): Promise<ModelMetadata | null> {
      if (isProd) {
        const model = await prisma.modelMetadata.findFirst({
          where: { 
            type: modelType as any,
            isActive: true,
            status: 'active' as any
          },
        });
        return model ? mapModelMetadata(model) : null;
      }
      if (isPostgres()) {
        try {
          const model = await prisma.modelMetadata.findFirst({
            where: { 
              type: modelType as any,
              isActive: true,
              status: 'active' as any
            },
          });
          if (model) return mapModelMetadata(model);
        } catch {}
      }
      return (
        store.modelMetadata.find(
          (m) => m.type === modelType && m.isActive && m.status === 'active'
        ) ?? null
      );
    },

    async setActive(id: string): Promise<ModelMetadata | null> {
      if (isProd) {
        const target = await prisma.modelMetadata.findUnique({ where: { id } });
        if (!target) return null;
        await prisma.$transaction([
          prisma.modelMetadata.updateMany({
            where: { type: target.type as any },
            data: { isActive: false },
          }),
          prisma.modelMetadata.update({
            where: { id },
            data: { isActive: true, status: 'active' as any },
          }),
        ]);

        const updated = await prisma.modelMetadata.findUnique({ where: { id } });
        return updated ? mapModelMetadata(updated) : null;
      }
      if (isPostgres()) {
        try {
          const target = await prisma.modelMetadata.findUnique({ where: { id } });
          if (target) {
            await prisma.$transaction([
              prisma.modelMetadata.updateMany({
                where: { type: target.type as any },
                data: { isActive: false },
              }),
              prisma.modelMetadata.update({
                where: { id },
                data: { isActive: true, status: 'active' as any },
              }),
            ]);

            const updated = await prisma.modelMetadata.findUnique({ where: { id } });
            if (updated) return mapModelMetadata(updated);
          }
        } catch {}
      }
      const target = store.modelMetadata.find((m) => m.id === id);
      if (!target) return null;
      store.modelMetadata.forEach((m) => {
        if (m.type === target.type) m.isActive = false;
      });
      target.isActive = true;
      target.status = 'active';
      return { ...target };
    },

    async create(model: Omit<ModelMetadata, 'id'>): Promise<ModelMetadata> {
      const data = {
        name: model.name,
        version: model.version,
        type: model.type,
        status: model.status,
        description: model.description,
        trainedOn: model.trainedOn,
        accuracy: model.accuracy,
        classes: model.classes as any,
        inputSize: model.inputSize as any,
        preprocessing: model.preprocessing as any,
        license: model.license,
        citation: model.citation,
        isActive: model.isActive,
        registeredAt: new Date(model.registeredAt),
      };

      if (isProd) {
        const created = await prisma.modelMetadata.create({ data });
        return mapModelMetadata(created);
      }
      if (isPostgres()) {
        try {
          const created = await prisma.modelMetadata.create({ data });
          return mapModelMetadata(created);
        } catch {}
      }
      const newModel: ModelMetadata = {
        ...model,
        id: `mdl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
      store.modelMetadata.push(newModel);
      return newModel;
    },
  },

  models: {
    listAll(): Promise<ModelMetadata[]> {
      return db.modelMetadata.listAll();
    },
    getActive(modelType: string): Promise<ModelMetadata | null> {
      return db.modelMetadata.getActive(modelType);
    },
    setActive(id: string): Promise<ModelMetadata | null> {
      return db.modelMetadata.setActive(id);
    },
    create(model: Omit<ModelMetadata, 'id'>): Promise<ModelMetadata> {
      return db.modelMetadata.create(model);
    },
  },

  userFeedback: {
    async listByUser(userId: string): Promise<UserFeedback[]> {
      if (isProd) {
        const feedback = await prisma.userFeedback.findMany({
          where: { userId },
          orderBy: { timestamp: 'desc' },
        });
        return feedback.map(mapUserFeedback);
      }
      if (isPostgres()) {
        try {
          const feedback = await prisma.userFeedback.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
          });
          return feedback.map(mapUserFeedback);
        } catch {}
      }
      return store.userFeedback.filter((f) => f.userId === userId);
    },

    async getByDiagnosis(diagnosisId: string): Promise<UserFeedback | null> {
      if (isProd) {
        const feedback = await prisma.userFeedback.findUnique({
          where: { diagnosisId },
        });
        return feedback ? mapUserFeedback(feedback) : null;
      }
      if (isPostgres()) {
        try {
          const feedback = await prisma.userFeedback.findUnique({
            where: { diagnosisId },
          });
          if (feedback) return mapUserFeedback(feedback);
        } catch {}
      }
      return store.userFeedback.find((f) => f.diagnosisId === diagnosisId) ?? null;
    },

    async create(feedback: Omit<UserFeedback, 'id'>): Promise<UserFeedback> {
      const data = {
        userId: feedback.userId,
        diagnosisId: feedback.diagnosisId,
        wasCorrect: feedback.wasCorrect,
        correction: feedback.correction,
        notes: feedback.notes,
        timestamp: new Date(feedback.timestamp),
      };

      if (isProd) {
        const created = await prisma.userFeedback.create({ data });
        return mapUserFeedback(created);
      }
      if (isPostgres()) {
        try {
          const created = await prisma.userFeedback.create({ data });
          return mapUserFeedback(created);
        } catch {}
      }
      const newFeedback: UserFeedback = { ...feedback, id: `fb_${Date.now()}` };
      store.userFeedback.push(newFeedback);
      return newFeedback;
    },
  },

  invoices: {
    async listByUser(userId: string): Promise<Invoice[]> {
      if (isProd) {
        const invoices = await prisma.invoice.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        return invoices.map(mapInvoice);
      }
      if (isPostgres()) {
        try {
          const invoices = await prisma.invoice.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          });
          return invoices.map(mapInvoice);
        } catch {}
      }
      return store.invoices.filter((i) => i.userId === userId);
    },

    async create(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
      const data = {
        userId: invoice.userId,
        amount: invoice.amount,
        currency: invoice.currency,
        provider: invoice.provider,
        providerPaymentId: invoice.providerPaymentId,
        status: invoice.status,
        plan: invoice.plan,
        receiptUrl: invoice.receiptUrl,
      };

      if (isProd) {
        const created = await prisma.invoice.create({ data });
        return mapInvoice(created);
      }
      if (isPostgres()) {
        try {
          const created = await prisma.invoice.create({ data });
          const mapped = mapInvoice(created);
          store.invoices.push(mapped);
          return mapped;
        } catch {}
      }
      const now = new Date().toISOString();
      const newInvoice: Invoice = {
        id: `inv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        ...invoice,
      };
      store.invoices.push(newInvoice);
      return newInvoice;
    },
  },
};

