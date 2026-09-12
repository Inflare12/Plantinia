export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationCode?: string;
  verificationCodeExpiresAt?: string;
  resetPasswordToken?: string;
  subscriptionTier: 'free' | 'care' | 'doctor' | 'pro' | 'farm';
  subscriptionStatus: 'active' | 'trialing' | 'canceled' | 'past_due';
  subscriptionCurrentPeriodEnd?: string;
  paymentProvider?: 'razorpay' | 'stripe' | null;
  subscriptionId?: string;
  creditsRemaining: number;
  videoCreditsRemaining?: number;
  apiKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plant {
  id: string;
  userId: string;
  name: string;
  species: string;
  commonName: string;
  imageUrl: string;
  location: 'indoor' | 'outdoor' | 'balcony' | 'greenhouse';
  healthStatus: 'healthy' | 'warning' | 'critical' | 'treating';
  sunlightNeeds: 'direct' | 'indirect' | 'low' | 'shade';
  wateringFrequencyDays: number;
  lastWateredDate?: string;
  nextWateringDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Diagnosis {
  id: string;
  userId: string;
  plantId?: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  identifiedSpecies: string;
  diseaseName: string;
  pathogenType: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'environmental' | 'none';
  confidence: number; // 0-100
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  uncertainty?: 'low' | 'medium' | 'high';
  symptoms: string[];
  causes: string[];
  prognosis: string;
  treatmentSteps: {
    stepNumber: number;
    title: string;
    instruction: string;
    frequency: string;
    isComplete?: boolean;
  }[];
  organicRemedies: string[]; // "What to Make"
  chemicalRemedies: {
    name: string;
    activeIngredient: string;
    approximateCost: string;
    instructions: string;
  }[]; // "What to Buy"
  preventativeMeasures: string[];
  boundingBoxes?: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }[];
  aiProviderUsed: string;
  modelVersion?: string;
  candidates?: any[]; // Alternative diagnoses when uncertainty is high
  knowledgeReferences?: any[]; // References to knowledge base items used
  adminReviewed: boolean;
  adminAccuracyFeedback?: 'accurate' | 'inaccurate' | 'pending';
  createdAt: string;
}

export interface PlantTimelineEvent {
  id: string;
  plantId: string;
  userId: string;
  eventType: 'diagnosis' | 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'note' | 'photo';
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
}

export interface CarePlanTask {
  id: string;
  userId: string;
  plantId?: string;
  plantName?: string;
  title: string;
  category: 'water' | 'fertilize' | 'spray' | 'prune' | 'inspect';
  dueDate: string;
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  plantId?: string;
  role: 'user' | 'assistant';
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface KnowledgeItem {
  id: string;
  type: 'plant' | 'disease' | 'pest' | 'symptom' | 'nutrient_deficiency';
  name: string;
  scientificName?: string;
  commonNames?: string[];
  category?: string;
  description?: string;
  affectedPlants?: string[];
  symptoms?: string[];
  treatment?: any; // Flexible JSON field
  prevention?: any; // Flexible JSON field
  sources?: any[]; // Array of source references
  imageUrl?: string;
  metadata?: any; // Additional flexible metadata
  isActive: boolean;
  lastUpdated: string;
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: 'INR' | 'USD';
  provider: 'razorpay' | 'stripe';
  providerPaymentId: string;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  diagnosisId: string;
  wasCorrect: boolean;
  correction?: string;
  notes?: string;
  timestamp: string;
}

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  type: 'plant_identification' | 'disease_detection' | 'pest_detection' | 'image_embedding';
  status: 'active' | 'staging' | 'deprecated';
  description: string;
  trainedOn: string;
  accuracy?: number;
  classes?: string[];
  inputSize?: { width: number; height: number };
  preprocessing?: string[];
  lastUpdated: string;
  license?: string;
  citation?: string;
  isActive: boolean;
  registeredAt: string;
}

