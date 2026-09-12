/**
 * Plantinia Knowledge Base Integration Contracts
 * 
 * These contracts define the interfaces that the future Plantinia Botanical Knowledge Book
 * must implement. The system is designed to accept your knowledge database without requiring
 * changes to the core application architecture.
 */

// ============================================================================
// PLANT KNOWLEDGE CONTRACT
// ============================================================================

export interface PlantKnowledge {
  id: string;
  scientificName: string;
  commonNames: string[];
  synonyms: string[];
  taxonomy: {
    family: string;
    genus: string;
    species: string;
    subspecies?: string;
    variety?: string;
  };
  characteristics: {
    growthHabit: string;
    leafType: string;
    floweringSeason?: string;
    nativeRange: string[];
    hardinessZones?: string[];
  };
  careRequirements: {
    sunlight: string;
    watering: string;
    soil: string;
    temperature: string;
    humidity: string;
    fertilization: string;
  };
  toxicity: {
    toxicToPets: boolean;
    toxicToHumans: boolean;
    specificConcerns?: string[];
  };
  commonDiseases: string[]; // Disease IDs
  commonPests: string[]; // Pest IDs
  images?: {
    healthy: string[];
    characteristics: string[];
  };
  sources: KnowledgeSource[];
  lastUpdated: string;
}

// ============================================================================
// DISEASE KNOWLEDGE CONTRACT
// ============================================================================

export interface DiseaseKnowledge {
  id: string;
  name: string;
  aliases: string[];
  pathogenType: 'fungal' | 'bacterial' | 'viral' | 'environmental' | 'physiological';
  causalOrganism?: string;
  affectedPlants: string[]; // Plant IDs or plant family names
  symptoms: {
    visual: string[];
    progression: string;
    earlySigns: string[];
    lateSigns: string[];
  };
  environmentalConditions: {
    temperatureRange?: string;
    humidityRange?: string;
    favoringConditions: string[];
    preventingConditions: string[];
  };
  transmission: {
    methods: string[];
    rapidSpread: boolean;
  };
  treatments: {
    organic: Treatment[];
    chemical: ChemicalTreatment[];
    cultural: string[];
  };
  prevention: string[];
  severity: {
    potentialDamage: string;
    timeToImpact: string;
  };
  sources: KnowledgeSource[];
  images?: string[];
  lastUpdated: string;
}

// ============================================================================
// PEST KNOWLEDGE CONTRACT
// ============================================================================

export interface PestKnowledge {
  id: string;
  name: string;
  scientificName?: string;
  aliases: string[];
  pestType: 'insect' | 'mite' | 'nematode' | 'slug' | 'snail' | 'other';
  affectedPlants: string[]; // Plant IDs or plant family names
  lifeCycle: {
    stages: string[];
    duration: string;
    overwintering: string;
  };
  appearance: {
    adult: string;
    nymph?: string;
    eggs: string;
    damage: string;
  };
  symptoms: {
    feedingDamage: string[];
    otherIndicators: string[];
  };
  treatments: {
    organic: Treatment[];
    chemical: ChemicalTreatment[];
    biological: string[];
    mechanical: string[];
  };
  prevention: string[];
  monitoring: string[];
  sources: KnowledgeSource[];
  images?: string[];
  lastUpdated: string;
}

// ============================================================================
// SYMPTOM KNOWLEDGE CONTRACT
// ============================================================================

export interface SymptomKnowledge {
  id: string;
  name: string;
  description: string;
  possibleCauses: {
    diseases: string[]; // Disease IDs
    pests: string[]; // Pest IDs
    nutrientDeficiencies: string[];
    environmentalStress: string[];
  };
  distinguishingFeatures: string[];
  affectedPlantParts: string[];
  images?: string[];
  sources: KnowledgeSource[];
  lastUpdated: string;
}

// ============================================================================
// NUTRIENT DEFICIENCY KNOWLEDGE CONTRACT
// ============================================================================

export interface NutrientDeficiencyKnowledge {
  id: string;
  nutrient: string;
  deficiencySymptoms: {
    visual: string[];
    pattern: string;
    affectedParts: string[];
    progression: string;
  };
  causes: string[];
  treatments: {
    immediate: string[];
    longTerm: string[];
  };
  prevention: string[];
  affectedPlants: string[]; // Plant families or specific plants
  sources: KnowledgeSource[];
  images?: string[];
  lastUpdated: string;
}

// ============================================================================
// TREATMENT CONTRACTS
// ============================================================================

export interface Treatment {
  name: string;
  description: string;
  application: string;
  frequency: string;
  precautions: string[];
  effectiveness: string;
}

export interface ChemicalTreatment {
  name: string;
  activeIngredient: string;
  modeOfAction: string;
  applicationRate?: string; // Only if authoritative source available
  applicationMethod: string;
  safety: {
    reentryInterval?: string;
    preHarvestInterval?: string;
    environmentalConcerns: string[];
    humanSafety: string[];
    petSafety: string[];
  };
  regulatoryNote?: string; // Always include for chemical treatments
  sources: KnowledgeSource[];
}

// ============================================================================
// KNOWLEDGE SOURCE CONTRACT
// ============================================================================

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'university' | 'government' | 'research' | 'extension' | 'book' | 'database' | 'other';
  url?: string;
  citation: string;
  license: string;
  reliability: 'high' | 'medium' | 'low';
  lastAccessed: string;
}

// ============================================================================
// KNOWLEDGE RETRIEVAL CONTRACT
// ============================================================================

export interface KnowledgeQuery {
  type: 'plant' | 'disease' | 'pest' | 'symptom' | 'nutrient_deficiency' | 'treatment';
  searchTerm?: string;
  filters?: {
    plantSpecies?: string;
    pathogenType?: string;
    pestType?: string;
    severity?: string;
  };
  limit?: number;
}

export interface KnowledgeRetrievalResult {
  items: Array<PlantKnowledge | DiseaseKnowledge | PestKnowledge | SymptomKnowledge | NutrientDeficiencyKnowledge>;
  total: number;
  query: KnowledgeQuery;
  sources: KnowledgeSource[];
}

export interface IKnowledgeProvider {
  /**
   * Get plant knowledge by scientific name
   */
  getPlantByScientificName(scientificName: string): Promise<PlantKnowledge | null>;
  
  /**
   * Get plant knowledge by common name
   */
  getPlantByCommonName(commonName: string): Promise<PlantKnowledge | null>;
  
  /**
   * Search plants by name or characteristics
   */
  searchPlants(query: string, limit?: number): Promise<PlantKnowledge[]>;
  
  /**
   * Get disease knowledge by name
   */
  getDiseaseByName(diseaseName: string): Promise<DiseaseKnowledge | null>;
  
  /**
   * Get diseases affecting a specific plant
   */
  getDiseasesForPlant(plantScientificName: string): Promise<DiseaseKnowledge[]>;
  
  /**
   * Search diseases
   */
  searchDiseases(query: string, limit?: number): Promise<DiseaseKnowledge[]>;
  
  /**
   * Get pest knowledge by name
   */
  getPestByName(pestName: string): Promise<PestKnowledge | null>;
  
  /**
   * Get pests affecting a specific plant
   */
  getPestsForPlant(plantScientificName: string): Promise<PestKnowledge[]>;
  
  /**
   * Search pests
   */
  searchPests(query: string, limit?: number): Promise<PestKnowledge[]>;
  
  /**
   * Get symptom knowledge
   */
  getSymptomByName(symptomName: string): Promise<SymptomKnowledge | null>;
  
  /**
   * Search symptoms
   */
  searchSymptoms(query: string, limit?: number): Promise<SymptomKnowledge[]>;
  
  /**
   * Get nutrient deficiency knowledge
   */
  getNutrientDeficiency(nutrient: string): Promise<NutrientDeficiencyKnowledge | null>;
  
  /**
   * General knowledge retrieval
   */
  retrieve(query: KnowledgeQuery): Promise<KnowledgeRetrievalResult>;
  
  /**
   * Health check for knowledge provider
   */
  healthCheck(): Promise<{ healthy: boolean; recordCount?: number }>;
  
  /**
   * Get knowledge base metadata
   */
  getMetadata(): Promise<KnowledgeBaseMetadata>;
}

// ============================================================================
// KNOWLEDGE BASE METADATA
// ============================================================================

export interface KnowledgeBaseMetadata {
  version: string;
  lastUpdated: string;
  recordCounts: {
    plants: number;
    diseases: number;
    pests: number;
    symptoms: number;
    nutrientDeficiencies: number;
  };
  sources: KnowledgeSource[];
  license: string;
  citation: string;
}

// ============================================================================
// KNOWLEDGE INGESTION CONTRACT
// ============================================================================

export interface KnowledgeIngestionConfig {
  sourcePath: string;
  format: 'json' | 'csv' | 'sqlite' | 'postgresql' | 'custom';
  validation: boolean;
  overwrite: boolean;
}

export interface KnowledgeIngestionResult {
  success: boolean;
  recordsImported: number;
  recordsFailed: number;
  errors: string[];
  warnings: string[];
  duration: number;
}

export interface IKnowledgeIngestion {
  /**
   * Import knowledge from external source
   */
  ingest(config: KnowledgeIngestionConfig): Promise<KnowledgeIngestionResult>;
  
  /**
   * Validate knowledge data structure
   */
  validate(data: any): { valid: boolean; errors: string[] };
  
  /**
   * Get ingestion status
   */
  getStatus(): Promise<{ status: string; progress: number }>;
}

// ============================================================================
// KNOWLEDGE SEARCH/RETRIEVAL CONTRACT
// ============================================================================

export interface VectorSearchQuery {
  queryVector: number[];
  collection: 'plants' | 'diseases' | 'pests' | 'treatments';
  limit: number;
  filters?: Record<string, any>;
}

export interface VectorSearchResult {
  items: Array<{
    id: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  query: VectorSearchQuery;
}

export interface IKnowledgeSearch {
  /**
   * Semantic search using embeddings
   */
  vectorSearch(query: VectorSearchQuery): Promise<VectorSearchResult>;
  
  /**
   * Hybrid search (keyword + semantic)
   */
  hybridSearch(keywordQuery: string, vectorQuery?: VectorSearchQuery): Promise<KnowledgeRetrievalResult>;
  
  /**
   * Get related knowledge items
   */
  getRelated(knowledgeId: string, limit?: number): Promise<Array<PlantKnowledge | DiseaseKnowledge | PestKnowledge>>;
}