import { prisma } from './prisma';
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
const tierToPrisma = (v: User['subscriptionTier']) => v.toUpperCase() as 'FREE' | 'PRO' | 'FARM';
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

export const db = {
  users: {
    async findById(id: string): Promise<User | null> {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? mapUser(user) : null;
    },

    async findByEmail(email: string): Promise<User | null> {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      return user ? mapUser(user) : null;
    },

    async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
      const created = await prisma.user.create({
        data: {
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
        },
      });

      return mapUser(created);
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

      try {
        const updated = await prisma.user.update({
          where: { id },
          data,
        });
        return mapUser(updated);
      } catch {
        return null;
      }
    },

    async listAll(): Promise<User[]> {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return users.map(mapUser);
    },
  },

  plants: {
    async listByUser(userId: string): Promise<Plant[]> {
      const plants = await prisma.plant.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return plants.map(mapPlant);
    },

    async findById(id: string): Promise<Plant | null> {
      const plant = await prisma.plant.findUnique({ where: { id } });
      return plant ? mapPlant(plant) : null;
    },

    async create(plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plant> {
      const created = await prisma.plant.create({
        data: {
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
        },
      });

      return mapPlant(created);
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

      try {
        const updated = await prisma.plant.update({
          where: { id },
          data,
        });
        return mapPlant(updated);
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        await prisma.plant.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  },

  diagnoses: {
    async listByUser(userId: string): Promise<Diagnosis[]> {
      const diagnoses = await prisma.diagnosis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return diagnoses.map(mapDiagnosis);
    },

    async listByPlant(plantId: string): Promise<Diagnosis[]> {
      const diagnoses = await prisma.diagnosis.findMany({
        where: { plantId },
        orderBy: { createdAt: 'desc' },
      });
      return diagnoses.map(mapDiagnosis);
    },

    async findById(id: string): Promise<Diagnosis | null> {
      const diagnosis = await prisma.diagnosis.findUnique({ where: { id } });
      return diagnosis ? mapDiagnosis(diagnosis) : null;
    },

    async create(diagnosis: Omit<Diagnosis, 'id' | 'createdAt'>): Promise<Diagnosis> {
      const created = await prisma.diagnosis.create({
        data: {
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
        },
      });

      return mapDiagnosis(created);
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

      try {
        const updated = await prisma.diagnosis.update({
          where: { id },
          data,
        });
        return mapDiagnosis(updated);
      } catch {
        return null;
      }
    },

    async listAll(): Promise<Diagnosis[]> {
      const diagnoses = await prisma.diagnosis.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return diagnoses.map(mapDiagnosis);
    },
  },

  timeline: {
    async listByPlant(plantId: string): Promise<PlantTimelineEvent[]> {
      const events = await prisma.plantTimelineEvent.findMany({
        where: { plantId },
        orderBy: { createdAt: 'desc' },
      });
      return events.map(mapTimelineEvent);
    },

    async create(event: Omit<PlantTimelineEvent, 'id' | 'createdAt'>): Promise<PlantTimelineEvent> {
      const created = await prisma.plantTimelineEvent.create({
        data: {
          plantId: event.plantId,
          userId: event.userId,
          eventType: event.eventType,
          title: event.title,
          description: event.description,
          imageUrl: event.imageUrl,
        },
      });

      return mapTimelineEvent(created);
    },
  },

  careTasks: {
    async listByUser(userId: string): Promise<CarePlanTask[]> {
      const tasks = await prisma.carePlanTask.findMany({
        where: { userId },
        orderBy: { dueDate: 'asc' },
      });
      return tasks.map(mapCareTask);
    },

    async create(task: Omit<CarePlanTask, 'id' | 'createdAt'>): Promise<CarePlanTask> {
      const created = await prisma.carePlanTask.create({
        data: {
          userId: task.userId,
          plantId: task.plantId,
          plantName: task.plantName,
          title: task.title,
          category: task.category,
          dueDate: new Date(task.dueDate),
          isCompleted: task.isCompleted,
          notes: task.notes,
        },
      });

      return mapCareTask(created);
    },

    async toggleComplete(id: string): Promise<CarePlanTask | null> {
      try {
        const task = await prisma.carePlanTask.findUnique({ where: { id } });
        if (!task) return null;

        const updated = await prisma.carePlanTask.update({
          where: { id },
          data: { isCompleted: !task.isCompleted },
        });

        return mapCareTask(updated);
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        await prisma.carePlanTask.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    },
  },

  chatMessages: {
    async listByUser(userId: string, plantId?: string): Promise<ChatMessage[]> {
      const messages = await prisma.chatMessage.findMany({
        where: {
          userId,
          ...(plantId ? { plantId } : {}),
        },
        orderBy: { createdAt: 'asc' },
      });

      return messages.map(mapChatMessage);
    },

    async create(msg: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
      const created = await prisma.chatMessage.create({
        data: {
          userId: msg.userId,
          plantId: msg.plantId,
          role: msg.role,
          content: msg.content,
          mediaUrl: msg.mediaUrl,
        },
      });

      return mapChatMessage(created);
    },
  },

  knowledge: {
    async listAll(): Promise<KnowledgeItem[]> {
      const items = await prisma.knowledgeItem.findMany({
        where: { isActive: true },
        orderBy: { lastUpdated: 'desc' },
      });
      return items.map(mapKnowledgeItem);
    },

    async getByScientificName(scientificName: string): Promise<KnowledgeItem | null> {
      const item = await prisma.knowledgeItem.findUnique({ 
        where: { scientificName, isActive: true } 
      });
      return item ? mapKnowledgeItem(item) : null;
    },

    async search(query: string, type?: string): Promise<KnowledgeItem[]> {
      const q = query.toLowerCase();
      
      const whereClause: any = { isActive: true };
      if (type) whereClause.type = type;

      const items = await prisma.knowledgeItem.findMany({
        where: whereClause,
      });

      return items
        .map(mapKnowledgeItem)
        .filter(
          (k) =>
            k.name.toLowerCase().includes(q) ||
            (k.scientificName && k.scientificName.toLowerCase().includes(q)) ||
            (k.commonNames && k.commonNames.some((n: string) => n.toLowerCase().includes(q))) ||
            (k.description && k.description.toLowerCase().includes(q))
        );
    },
  },

  modelMetadata: {
    async listAll(): Promise<ModelMetadata[]> {
      const models = await prisma.modelMetadata.findMany({
        orderBy: { registeredAt: 'desc' },
      });
      return models.map(mapModelMetadata);
    },

    async getActive(modelType: string): Promise<ModelMetadata | null> {
      const model = await prisma.modelMetadata.findFirst({
        where: { 
          type: modelType as any,
          isActive: true,
          status: 'active' as any
        },
      });
      return model ? mapModelMetadata(model) : null;
    },

    async setActive(id: string): Promise<ModelMetadata | null> {
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
    },

    async create(model: Omit<ModelMetadata, 'id'>): Promise<ModelMetadata> {
      const created = await prisma.modelMetadata.create({
        data: {
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
        },
      });

      return mapModelMetadata(created);
    },
  },

  userFeedback: {
    async listByUser(userId: string): Promise<UserFeedback[]> {
      const feedback = await prisma.userFeedback.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });
      return feedback.map(mapUserFeedback);
    },

    async getByDiagnosis(diagnosisId: string): Promise<UserFeedback | null> {
      const feedback = await prisma.userFeedback.findUnique({
        where: { diagnosisId },
      });
      return feedback ? mapUserFeedback(feedback) : null;
    },

    async create(feedback: Omit<UserFeedback, 'id'>): Promise<UserFeedback> {
      const created = await prisma.userFeedback.create({
        data: {
          userId: feedback.userId,
          diagnosisId: feedback.diagnosisId,
          wasCorrect: feedback.wasCorrect,
          correction: feedback.correction,
          notes: feedback.notes,
          timestamp: new Date(feedback.timestamp),
        },
      });

      return mapUserFeedback(created);
    },
  },

  invoices: {
    async listByUser(userId: string): Promise<Invoice[]> {
      const invoices = await prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return invoices.map(mapInvoice);
    },

    async create(invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
      const created = await prisma.invoice.create({
        data: {
          userId: invoice.userId,
          amount: invoice.amount,
          currency: invoice.currency,
          provider: invoice.provider,
          providerPaymentId: invoice.providerPaymentId,
          status: invoice.status,
          plan: invoice.plan,
          receiptUrl: invoice.receiptUrl,
        },
      });

      return mapInvoice(created);
    },
  },
};

