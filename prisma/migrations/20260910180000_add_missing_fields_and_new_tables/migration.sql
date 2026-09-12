-- AlterTable
ALTER TABLE "User" ADD COLUMN "verificationCode" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "verificationCodeExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Diagnosis" ADD COLUMN "uncertainty" TEXT DEFAULT 'low';

-- AlterTable
ALTER TABLE "Diagnosis" ADD COLUMN "modelVersion" TEXT;

-- AlterTable
ALTER TABLE "Diagnosis" ADD COLUMN "candidates" JSONB;

-- AlterTable
ALTER TABLE "Diagnosis" ADD COLUMN "knowledgeReferences" JSONB;

-- CreateIndex
CREATE INDEX "Diagnosis_userId" ON "Diagnosis"("userId");

-- CreateIndex
CREATE INDEX "Diagnosis_plantId" ON "Diagnosis"("plantId");

-- CreateIndex
CREATE INDEX "Diagnosis_createdAt" ON "Diagnosis"("createdAt");

-- CreateIndex
CREATE INDEX "Plant_userId" ON "Plant"("userId");

-- CreateIndex
CREATE INDEX "Plant_species" ON "Plant"("species");

-- CreateIndex
CREATE INDEX "Plant_healthStatus" ON "Plant"("healthStatus");

-- CreateTable
CREATE TABLE "UserFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diagnosisId" TEXT NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,
    "correction" TEXT,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFeedback_diagnosisId_key" ON "UserFeedback"("diagnosisId");

-- CreateIndex
CREATE INDEX "UserFeedback_userId" ON "UserFeedback"("userId");

-- CreateIndex
CREATE INDEX "UserFeedback_diagnosisId" ON "UserFeedback"("diagnosisId");

-- AddForeignKey
ALTER TABLE "UserFeedback" ADD CONSTRAINT "UserFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFeedback" ADD CONSTRAINT "UserFeedback_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "Diagnosis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ModelMetadata" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'staging',
    "description" TEXT NOT NULL,
    "trainedOn" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "classes" JSONB,
    "inputSize" JSONB,
    "preprocessing" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "license" TEXT,
    "citation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelMetadata_version_key" ON "ModelMetadata"("version");

-- CreateIndex
CREATE INDEX "ModelMetadata_type" ON "ModelMetadata"("type");

-- CreateIndex
CREATE INDEX "ModelMetadata_status" ON "ModelMetadata"("status");

-- CreateIndex
CREATE INDEX "ModelMetadata_isActive" ON "ModelMetadata"("isActive");

-- AlterTable
ALTER TABLE "KnowledgeItem" ADD COLUMN "type" TEXT;

-- AlterTable
ALTER TABLE "KnowledgeItem" ADD COLUMN "scientificName" TEXT;

-- AlterTable
ALTER TABLE "KnowledgeItem" ADD COLUMN "commonNames" JSONB;

-- AlterTable
ALTER TABLE "KnowledgeItem" ADD COLUMN "description" TEXT;

-- AlterTable
ALTER TABLE "KnowledgeItem" ADD COLUMN "sources" JSONB;

-- AlterTable
ALTER TABLE "KnowledgeItem" ADD COLUMN "metadata" JSONB;

-- AlterTable
ALTER TABLE "KnowledgeItem" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "KnowledgeItem" ADD COLUMN "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "KnowledgeItem_type" ON "KnowledgeItem"("type");

-- CreateIndex
CREATE INDEX "KnowledgeItem_scientificName" ON "KnowledgeItem"("scientificName");

-- CreateIndex
CREATE INDEX "KnowledgeItem_isActive" ON "KnowledgeItem"("isActive");

-- DropIndex
DROP INDEX "KnowledgeItem_slug_key";