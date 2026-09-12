/**
 * Mock Model Adapters for Development
 * 
 * These adapters provide development fallbacks when real trained models are not available.
 * They clearly distinguish between DEVELOPMENT/MOCK and REAL PRODUCTION AI.
 * 
 * IMPORTANT: These are temporary placeholders for your future trained models.
 * When you provide real model files, these will be replaced with actual model adapters.
 */

import {
  IPlantIdentificationModel,
  IDiseaseDetectionModel,
  IPestDetectionModel,
  IImageEmbeddingModel,
  PlantIdentificationInput,
  PlantIdentificationOutput,
  DiseaseDetectionInput,
  DiseaseDetectionOutput,
  PestDetectionInput,
  PestDetectionOutput,
  ImageEmbeddingInput,
  ImageEmbeddingOutput,
  ModelMetadata
} from '../contracts';

// ============================================================================
// MOCK PLANT IDENTIFICATION MODEL
// ============================================================================

export class MockPlantIdentificationModel implements IPlantIdentificationModel {
  name = 'mock-plant-identification';
  version = '0.1.0-dev';
  status: 'active' | 'staging' | 'loading' | 'error' = 'active';

  async identify(input: PlantIdentificationInput): Promise<PlantIdentificationOutput> {
    // Development fallback - returns placeholder data
    // This will be replaced with your trained plant identification model
    
    return {
      candidates: [],
      topCandidate: null,
      confidence: 0.0,
      modelVersion: this.version,
      inferenceTimeMs: 0,
      metadata: {
        inputSize: 0,
        preprocessing: 'mock'
      }
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    return { healthy: true, latency: 0 };
  }

  async getMetadata(): Promise<ModelMetadata> {
    return {
      name: this.name,
      version: this.version,
      type: 'plant_identification',
      description: 'Development placeholder for plant identification model',
      trainedOn: 'MOCK DATA - NOT FOR PRODUCTION',
      accuracy: 0.0,
      classes: [],
      inputSize: { width: 224, height: 224 },
      preprocessing: [],
      lastUpdated: new Date().toISOString(),
      license: 'DEV_ONLY',
      citation: 'This is a development mock, not a real model'
    };
  }
}

// ============================================================================
// MOCK DISEASE DETECTION MODEL
// ============================================================================

export class MockDiseaseDetectionModel implements IDiseaseDetectionModel {
  name = 'mock-disease-detection';
  version = '0.1.0-dev';
  status: 'active' | 'staging' | 'loading' | 'error' = 'active';

  async detect(input: DiseaseDetectionInput): Promise<DiseaseDetectionOutput> {
    // Development fallback - returns placeholder data
    // This will be replaced with your trained disease detection model
    
    return {
      candidates: [],
      topCandidate: null,
      isHealthy: false,
      confidence: 0.0,
      modelVersion: this.version,
      inferenceTimeMs: 0,
      metadata: {
        inputSize: 0,
        preprocessing: 'mock'
      }
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    return { healthy: true, latency: 0 };
  }

  async getMetadata(): Promise<ModelMetadata> {
    return {
      name: this.name,
      version: this.version,
      type: 'disease_detection',
      description: 'Development placeholder for disease detection model',
      trainedOn: 'MOCK DATA - NOT FOR PRODUCTION',
      accuracy: 0.0,
      classes: [],
      inputSize: { width: 224, height: 224 },
      preprocessing: [],
      lastUpdated: new Date().toISOString(),
      license: 'DEV_ONLY',
      citation: 'This is a development mock, not a real model'
    };
  }
}

// ============================================================================
// MOCK PEST DETECTION MODEL
// ============================================================================

export class MockPestDetectionModel implements IPestDetectionModel {
  name = 'mock-pest-detection';
  version = '0.1.0-dev';
  status: 'active' | 'staging' | 'loading' | 'error' = 'active';

  async detect(input: PestDetectionInput): Promise<PestDetectionOutput> {
    // Development fallback - returns placeholder data
    // This will be replaced with your trained pest detection model
    
    return {
      candidates: [],
      topCandidate: null,
      hasPests: false,
      confidence: 0.0,
      modelVersion: this.version,
      inferenceTimeMs: 0,
      metadata: {
        inputSize: 0,
        preprocessing: 'mock'
      }
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    return { healthy: true, latency: 0 };
  }

  async getMetadata(): Promise<ModelMetadata> {
    return {
      name: this.name,
      version: this.version,
      type: 'pest_detection',
      description: 'Development placeholder for pest detection model',
      trainedOn: 'MOCK DATA - NOT FOR PRODUCTION',
      accuracy: 0.0,
      classes: [],
      inputSize: { width: 224, height: 224 },
      preprocessing: [],
      lastUpdated: new Date().toISOString(),
      license: 'DEV_ONLY',
      citation: 'This is a development mock, not a real model'
    };
  }
}

// ============================================================================
// MOCK IMAGE EMBEDDING MODEL
// ============================================================================

export class MockImageEmbeddingModel implements IImageEmbeddingModel {
  name = 'mock-image-embedding';
  version = '0.1.0-dev';
  status: 'active' | 'staging' | 'loading' | 'error' = 'active';

  async generateEmbedding(input: ImageEmbeddingInput): Promise<ImageEmbeddingOutput> {
    // Development fallback - returns placeholder embedding
    // This will be replaced with your trained embedding model
    
    return {
      embedding: new Array(512).fill(0), // Placeholder 512-dim vector
      dimension: 512,
      modelVersion: this.version,
      inferenceTimeMs: 0
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    return { healthy: true, latency: 0 };
  }

  async getMetadata(): Promise<ModelMetadata> {
    return {
      name: this.name,
      version: this.version,
      type: 'image_embedding',
      description: 'Development placeholder for image embedding model',
      trainedOn: 'MOCK DATA - NOT FOR PRODUCTION',
      accuracy: 0.0,
      classes: [],
      inputSize: { width: 224, height: 224 },
      preprocessing: [],
      lastUpdated: new Date().toISOString(),
      license: 'DEV_ONLY',
      citation: 'This is a development mock, not a real model'
    };
  }
}