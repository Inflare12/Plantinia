import { z } from 'zod';
import { DiagnosisOutput, IdentifyOutput, ChatOutput } from './types';

const treatmentStepSchema = z.object({
  stepNumber: z.coerce.number().int().min(1).max(100),
  title: z.string().min(1).max(200),
  instruction: z.string().min(1).max(4000),
  frequency: z.string().min(1).max(500),
  isComplete: z.boolean().optional(),
});

const chemicalRemedySchema = z.object({
  name: z.string().min(1).max(200),
  activeIngredient: z.string().max(500),
  approximateCost: z.string().max(200),
  instructions: z.string().min(1).max(4000),
});

const boundingBoxSchema = z.object({
  x: z.coerce.number().min(0).max(100),
  y: z.coerce.number().min(0).max(100),
  width: z.coerce.number().min(0).max(100),
  height: z.coerce.number().min(0).max(100),
  label: z.string().min(1).max(200),
});

export const diagnosisOutputSchema = z.object({
  identifiedSpecies: z.string().min(1).max(300),
  diseaseName: z.string().min(1).max(300),
  pathogenType: z.enum(['fungal', 'bacterial', 'viral', 'pest', 'environmental', 'none']),
  confidence: z.coerce.number().min(0).max(100),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
  symptoms: z.array(z.string().min(1).max(1000)).max(50),
  causes: z.array(z.string().min(1).max(1000)).max(50),
  prognosis: z.string().max(5000),
  treatmentSteps: z.array(treatmentStepSchema).max(50),
  organicRemedies: z.array(z.string().min(1).max(2000)).max(50),
  chemicalRemedies: z.array(chemicalRemedySchema).max(50),
  preventativeMeasures: z.array(z.string().min(1).max(2000)).max(50),
  boundingBoxes: z.array(boundingBoxSchema).max(100),
});

export const identifyOutputSchema = z.object({
  species: z.string().min(1).max(300),
  commonName: z.string().min(1).max(300),
  family: z.string().min(1).max(200),
  confidence: z.coerce.number().min(0).max(100),
  sunlightNeeds: z.enum(['direct', 'indirect', 'low', 'shade']),
  wateringFrequencyDays: z.coerce.number().int().min(0).max(365),
  difficulty: z.enum(['easy', 'moderate', 'expert']),
  careSummary: z.string().max(5000),
  toxicityAlert: z.string().max(2000).nullable().optional(),
});

export const chatOutputSchema = z.object({
  response: z.string().min(1).max(12000),
  suggestedFollowUps: z.array(z.string().min(1).max(500)).max(10),
});

export function validateDiagnosisOutput(value: unknown): Omit<DiagnosisOutput, 'aiProviderUsed'> {
  return diagnosisOutputSchema.parse(value);
}

export function validateIdentifyOutput(value: unknown): Omit<IdentifyOutput, 'aiProviderUsed'> {
  return identifyOutputSchema.parse(value);
}

export function validateChatOutput(value: unknown): Omit<ChatOutput, 'aiProviderUsed'> {
  return chatOutputSchema.parse(value);
}
