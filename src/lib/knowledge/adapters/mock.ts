/**
 * Mock Knowledge Provider for Development
 * 
 * This adapter provides a development fallback when the real Plantinia Botanical Knowledge Book
 * is not available. It clearly distinguishes between DEVELOPMENT/MOCK and REAL PRODUCTION KNOWLEDGE.
 * 
 * IMPORTANT: This is a temporary placeholder for your future Plantinia Knowledge Book.
 * When you provide the real knowledge database, this will be replaced with the actual knowledge provider.
 */

import {
  IKnowledgeProvider,
  PlantKnowledge,
  DiseaseKnowledge,
  PestKnowledge,
  SymptomKnowledge,
  NutrientDeficiencyKnowledge,
  KnowledgeQuery,
  KnowledgeRetrievalResult,
  KnowledgeBaseMetadata,
  KnowledgeSource
} from '../contracts';

// ============================================================================
// MOCK KNOWLEDGE PROVIDER
// ============================================================================

export class MockKnowledgeProvider implements IKnowledgeProvider {
  private mockPlants: PlantKnowledge[] = [];
  private mockDiseases: DiseaseKnowledge[] = [];
  private mockPests: PestKnowledge[] = [];

  async getPlantByScientificName(scientificName: string): Promise<PlantKnowledge | null> {
    // Development fallback - returns null
    // This will be replaced with your real Plantinia Knowledge Book
    return null;
  }

  async getPlantByCommonName(commonName: string): Promise<PlantKnowledge | null> {
    // Development fallback - returns null
    return null;
  }

  async searchPlants(query: string, limit?: number): Promise<PlantKnowledge[]> {
    // Development fallback - returns empty array
    return [];
  }

  async getDiseaseByName(diseaseName: string): Promise<DiseaseKnowledge | null> {
    // Development fallback - returns null
    return null;
  }

  async getDiseasesForPlant(plantScientificName: string): Promise<DiseaseKnowledge[]> {
    // Development fallback - returns empty array
    return [];
  }

  async searchDiseases(query: string, limit?: number): Promise<DiseaseKnowledge[]> {
    // Development fallback - returns empty array
    return [];
  }

  async getPestByName(pestName: string): Promise<PestKnowledge | null> {
    // Development fallback - returns null
    return null;
  }

  async getPestsForPlant(plantScientificName: string): Promise<PestKnowledge[]> {
    // Development fallback - returns empty array
    return [];
  }

  async searchPests(query: string, limit?: number): Promise<PestKnowledge[]> {
    // Development fallback - returns empty array
    return [];
  }

  async getSymptomByName(symptomName: string): Promise<SymptomKnowledge | null> {
    // Development fallback - returns null
    return null;
  }

  async searchSymptoms(query: string, limit?: number): Promise<SymptomKnowledge[]> {
    // Development fallback - returns empty array
    return [];
  }

  async getNutrientDeficiency(nutrient: string): Promise<NutrientDeficiencyKnowledge | null> {
    // Development fallback - returns null
    return null;
  }

  async retrieve(query: KnowledgeQuery): Promise<KnowledgeRetrievalResult> {
    // Development fallback - returns empty result
    return {
      items: [],
      total: 0,
      query,
      sources: []
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; recordCount?: number }> {
    return { healthy: true, recordCount: 0 };
  }

  async getMetadata(): Promise<KnowledgeBaseMetadata> {
    return {
      version: '0.1.0-dev',
      lastUpdated: new Date().toISOString(),
      recordCounts: {
        plants: 0,
        diseases: 0,
        pests: 0,
        symptoms: 0,
        nutrientDeficiencies: 0
      },
      sources: [],
      license: 'DEV_ONLY',
      citation: 'This is a development mock, not the real Plantinia Knowledge Book'
    };
  }
}