export type PathogenType = 'fungal' | 'bacterial' | 'viral' | 'pest' | 'environmental' | 'none';
export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'critical';

export interface TreatmentStep { stepNumber:number; title:string; instruction:string; frequency:string; isComplete?:boolean; }
export interface ChemicalRemedy { name:string; activeIngredient:string; approximateCost:string; instructions:string; }
export interface BoundingBox { x:number; y:number; width:number; height:number; label:string; }
export interface DiagnosisInput { mediaUrl:string; mediaType:'image'|'video'; plantSpeciesHint?:string; notes?:string; userLocation?:string; }
export interface DiagnosisOutput { identifiedSpecies:string; diseaseName:string; pathogenType:PathogenType; confidence:number; severity:SeverityLevel; symptoms:string[]; causes:string[]; prognosis:string; treatmentSteps:TreatmentStep[]; organicRemedies:string[]; chemicalRemedies:ChemicalRemedy[]; preventativeMeasures:string[]; boundingBoxes:BoundingBox[]; aiProviderUsed:string; }
export interface IdentifyInput { imageUrl:string; }
export interface IdentifyOutput { species:string; commonName:string; family:string; confidence:number; sunlightNeeds:'direct'|'indirect'|'low'|'shade'; wateringFrequencyDays:number; difficulty:'easy'|'moderate'|'expert'; careSummary:string; toxicityAlert?:string|null; aiProviderUsed:string; }
export interface ChatMessageContext { role:'user'|'assistant'; content:string; }
export interface ChatInput { messages:ChatMessageContext[]; plantContext?:{name:string;species:string;healthStatus:string;recentDiagnosis?:string}; weatherContext?:{tempC:number;humidity:number;condition:string}; }
export interface ChatOutput { response:string; suggestedFollowUps:string[]; aiProviderUsed:string; }
export interface IAIEngine { name:string; diagnosePlant(input:DiagnosisInput):Promise<DiagnosisOutput>; identifyPlant(input:IdentifyInput):Promise<IdentifyOutput>; chatWithDoctor(input:ChatInput):Promise<ChatOutput>; }
