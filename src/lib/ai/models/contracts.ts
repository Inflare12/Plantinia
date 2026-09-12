/**
 * AI Model Integration Contracts
 * 
 * These contracts define the interfaces that future trained models must implement.
 * The system is designed to accept your future specialized models without requiring
 * changes to the core application architecture.
 */

// ============================================================================
// PLANT IDENTIFICATION MODEL CONTRACT
// ============================================================================

export interface PlantIdentificationInput {
  imageData: Buffer | string; // Buffer or base64 string
  imageMetadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
}

export interface PlantIdentificationCandidate {
  scientificName: string;
  commonName: string;
  family: string;
  genus: string;
  confidence: number; // 0.0 to 1.0
  characteristics?: {
    leafShape?: string;
    leafArrangement?: string;
    flowerColor?: string;
    growthHabit?: string;
  };
}

export interface PlantIdentificationOutput {
  candidates: PlantIdentificationCandidate[];
  topCandidate: PlantIdentificationCandidate | null;
  confidence: number;
  modelVersion: string;
  inferenceTimeMs: number;
  metadata?: {
    inputSize?: number;
    preprocessing?: string;
  };
}

export interface IPlantIdentificationModel {
  name: string;
  version: string;
  status: 'active' | 'staging' | 'loading' | 'error';
  
  /**
   * Identify plant species from image
   */
  identify(input: PlantIdentificationInput): Promise<PlantIdentificationOutput>;
  
  /**
   * Health check for model availability
   */
  healthCheck(): Promise<{ healthy: boolean; latency?: number }>;
  
  /**
   * Get model metadata
   */
  getMetadata(): Promise<ModelMetadata>;
}

// ============================================================================
// DISEASE DETECTION MODEL CONTRACT
// ============================================================================

export interface DiseaseDetectionInput {
  imageData: Buffer | string;
  plantSpeciesHint?: string; // Optional hint to narrow search space
  imageMetadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
}

export interface DiseaseDetectionCandidate {
  diseaseName: string;
  pathogenType: 'fungal' | 'bacterial' | 'viral' | 'environmental' | 'unknown';
  confidence: number; // 0.0 to 1.0
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  affectedAreas?: Array<{
    label: string;
    boundingBox?: { x: number; y: number; width: number; height: number };
  }>;
}

export interface DiseaseDetectionOutput {
  candidates: DiseaseDetectionCandidate[];
  topCandidate: DiseaseDetectionCandidate | null;
  isHealthy: boolean;
  confidence: number;
  modelVersion: string;
  inferenceTimeMs: number;
  metadata?: {
    inputSize?: number;
    preprocessing?: string;
  };
}

export interface IDiseaseDetectionModel {
  name: string;
  version: string;
  status: 'active' | 'staging' | 'loading' | 'error';
  
  /**
   * Detect diseases from plant image
   */
  detect(input: DiseaseDetectionInput): Promise<DiseaseDetectionOutput>;
  
  /**
   * Health check for model availability
   */
  healthCheck(): Promise<{ healthy: boolean; latency?: number }>;
  
  /**
   * Get model metadata
   */
  getMetadata(): Promise<ModelMetadata>;
}

// ============================================================================
// PEST DETECTION MODEL CONTRACT
// ============================================================================

export interface PestDetectionInput {
  imageData: Buffer | string;
  plantSpeciesHint?: string;
  imageMetadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
}

export interface PestDetectionCandidate {
  pestName: string;
  scientificName?: string;
  pestType: 'insect' | 'mite' | 'nematode' | 'other';
  confidence: number; // 0.0 to 1.0
  severity: 'low' | 'moderate' | 'high' | 'severe';
  detectedInstances?: Array<{
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
  }>;
}

export interface PestDetectionOutput {
  candidates: PestDetectionCandidate[];
  topCandidate: PestDetectionCandidate | null;
  hasPests: boolean;
  confidence: number;
  modelVersion: string;
  inferenceTimeMs: number;
  metadata?: {
    inputSize?: number;
    preprocessing?: string;
  };
}

export interface IPestDetectionModel {
  name: string;
  version: string;
  status: 'active' | 'staging' | 'loading' | 'error';
  
  /**
   * Detect pests from plant image
   */
  detect(input: PestDetectionInput): Promise<PestDetectionOutput>;
  
  /**
   * Health check for model availability
   */
  healthCheck(): Promise<{ healthy: boolean; latency?: number }>;
  
  /**
   * Get model metadata
   */
  getMetadata(): Promise<ModelMetadata>;
}

// ============================================================================
// IMAGE EMBEDDING MODEL CONTRACT
// ============================================================================

export interface ImageEmbeddingInput {
  imageData: Buffer | string;
  imageMetadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
}

export interface ImageEmbeddingOutput {
  embedding: number[]; // Vector representation
  dimension: number;
  modelVersion: string;
  inferenceTimeMs: number;
}

export interface IImageEmbeddingModel {
  name: string;
  version: string;
  status: 'active' | 'staging' | 'loading' | 'error';
  
  /**
   * Generate image embeddings for similarity search
   */
  generateEmbedding(input: ImageEmbeddingInput): Promise<ImageEmbeddingOutput>;
  
  /**
   * Health check for model availability
   */
  healthCheck(): Promise<{ healthy: boolean; latency?: number }>;
  
  /**
   * Get model metadata
   */
  getMetadata(): Promise<ModelMetadata>;
}

// ============================================================================
// SHARED MODEL METADATA
// ============================================================================

export interface ModelMetadata {
  name: string;
  version: string;
  type: 'plant_identification' | 'disease_detection' | 'pest_detection' | 'image_embedding';
  description: string;
  trainedOn: string; // Dataset description
  accuracy?: number; // If available from evaluation
  classes?: string[]; // Model classes/categories
  inputSize?: { width: number; height: number };
  preprocessing?: string[];
  lastUpdated: string;
  license?: string;
  citation?: string;
}

// ============================================================================
// MODEL REGISTRY CONTRACT
// ============================================================================

export interface ModelRegistryEntry {
  id: string;
  modelType: 'plant_identification' | 'disease_detection' | 'pest_detection' | 'image_embedding';
  model: IPlantIdentificationModel | IDiseaseDetectionModel | IPestDetectionModel | IImageEmbeddingModel;
  metadata: ModelMetadata;
  isActive: boolean;
  registeredAt: string;
}

export interface IModelRegistry {
  /**
   * Register a model instance
   */
  register(model: IPlantIdentificationModel | IDiseaseDetectionModel | IPestDetectionModel | IImageEmbeddingModel): Promise<string>;
  
  /**
   * Unregister a model by ID
   */
  unregister(modelId: string): Promise<boolean>;
  
  /**
   * Get active model by type
   */
  getActiveModel(modelType: 'plant_identification' | 'disease_detection' | 'pest_detection' | 'image_embedding'): Promise<IPlantIdentificationModel | IDiseaseDetectionModel | IPestDetectionModel | IImageEmbeddingModel | null>;
  
  /**
   * Set active model by ID
   */
  setActiveModel(modelId: string): Promise<boolean>;
  
  /**
   * List all registered models
   */
  listModels(): Promise<ModelRegistryEntry[]>;
  
  /**
   * Health check all registered models
   */
  healthCheckAll(): Promise<Record<string, { healthy: boolean; latency?: number }>>;
}

// ============================================================================
// MODEL LOADER CONTRACT
// ============================================================================

export interface ModelLoadConfig {
  modelPath: string;
  modelType: 'plant_identification' | 'disease_detection' | 'pest_detection' | 'image_embedding';
  device?: 'cpu' | 'gpu' | 'tpu';
  precision?: 'fp32' | 'fp16' | 'int8';
  batch_size?: number;
}

export interface IModelLoader {
  /**
   * Load a model from disk
   */
  load(config: ModelLoadConfig): Promise<IPlantIdentificationModel | IDiseaseDetectionModel | IPestDetectionModel | IImageEmbeddingModel>;
  
  /**
   * Unload a model from memory
   */
  unload(modelId: string): Promise<boolean>;
  
  /**
   * Check if model files exist and are valid
   */
  validateModelFiles(modelPath: string): Promise<{ valid: boolean; errors: string[] }>;
}