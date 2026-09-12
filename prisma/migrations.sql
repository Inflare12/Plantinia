-- Plantinia PostgreSQL Production DDL
-- Compatible with Neon, Supabase, Vercel Postgres, AWS RDS

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  "verificationToken" TEXT,
  "resetPasswordToken" TEXT,
  "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
  "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',
  "subscriptionCurrentPeriodEnd" TIMESTAMP(3),
  "paymentProvider" TEXT,
  "subscriptionId" TEXT,
  "creditsRemaining" INTEGER NOT NULL DEFAULT 5,
  "apiKey" TEXT UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Plant" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "species" TEXT NOT NULL,
  "commonName" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "location" TEXT NOT NULL DEFAULT 'indoor',
  "healthStatus" TEXT NOT NULL DEFAULT 'healthy',
  "sunlightNeeds" TEXT NOT NULL DEFAULT 'indirect',
  "wateringFrequencyDays" INTEGER NOT NULL DEFAULT 7,
  "lastWateredDate" TIMESTAMP(3),
  "nextWateringDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Diagnosis" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "plantId" TEXT REFERENCES "Plant"("id") ON DELETE SET NULL,
  "mediaType" TEXT NOT NULL DEFAULT 'image',
  "mediaUrl" TEXT NOT NULL,
  "identifiedSpecies" TEXT NOT NULL,
  "diseaseName" TEXT NOT NULL,
  "pathogenType" TEXT NOT NULL DEFAULT 'none',
  "confidence" DOUBLE PRECISION NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'mild',
  "symptoms" JSONB NOT NULL,
  "causes" JSONB NOT NULL,
  "prognosis" TEXT NOT NULL,
  "treatmentSteps" JSONB NOT NULL,
  "organicRemedies" JSONB NOT NULL,
  "chemicalRemedies" JSONB NOT NULL,
  "preventativeMeasures" JSONB NOT NULL,
  "boundingBoxes" JSONB,
  "aiProviderUsed" TEXT NOT NULL,
  "adminReviewed" BOOLEAN NOT NULL DEFAULT false,
  "adminAccuracyFeedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PlantTimelineEvent" (
  "id" TEXT PRIMARY KEY,
  "plantId" TEXT NOT NULL REFERENCES "Plant"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "eventType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CarePlanTask" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "plantId" TEXT REFERENCES "Plant"("id") ON DELETE SET NULL,
  "plantName" TEXT,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "plantId" TEXT,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "mediaUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "KnowledgeItem" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "category" TEXT NOT NULL,
  "affectedPlants" JSONB NOT NULL,
  "symptoms" JSONB NOT NULL,
  "treatment" TEXT NOT NULL,
  "prevention" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "ModelVersion" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "version" TEXT UNIQUE NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'staging',
  "accuracy" DOUBLE PRECISION NOT NULL,
  "datasetCount" INTEGER NOT NULL,
  "lastTrainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endpointUrl" TEXT
);

CREATE TABLE IF NOT EXISTS "Invoice" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "provider" TEXT NOT NULL,
  "providerPaymentId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'paid',
  "plan" TEXT NOT NULL,
  "receiptUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_plant_user" ON "Plant"("userId");
CREATE INDEX IF NOT EXISTS "idx_diagnosis_user" ON "Diagnosis"("userId");
CREATE INDEX IF NOT EXISTS "idx_diagnosis_plant" ON "Diagnosis"("plantId");
CREATE INDEX IF NOT EXISTS "idx_timeline_plant" ON "PlantTimelineEvent"("plantId");
CREATE INDEX IF NOT EXISTS "idx_caretask_user" ON "CarePlanTask"("userId");
CREATE INDEX IF NOT EXISTS "idx_chat_user" ON "ChatMessage"("userId");
