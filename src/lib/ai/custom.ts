import { IAIEngine, DiagnosisInput, DiagnosisOutput, IdentifyInput, IdentifyOutput, ChatInput, ChatOutput } from './types';
import { env } from '../env';
import { validateDiagnosisOutput, validateIdentifyOutput, validateChatOutput } from './validation';

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

async function request(endpoint: string, apiKey: string, body: unknown): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Custom inference error ${response.status}`);
    const text = await response.text();
    if (text.length > MAX_RESPONSE_BYTES) throw new Error('Custom inference response is too large');
    return JSON.parse(text);
  } finally {
    clearTimeout(timeout);
  }
}

export class CustomInferenceAIEngine implements IAIEngine {
  name = 'custom-gpu-inference-engine';
  private get endpoint(): string { return env.CUSTOM_INFERENCE_URL || ''; }
  private get apiKey(): string { return env.CUSTOM_INFERENCE_API_KEY || ''; }

  private endpointFor(path: string): string {
    if (!this.endpoint) throw new Error('CUSTOM_INFERENCE_URL is not configured for custom model');
    return `${this.endpoint.replace(/\/$/, '')}/${path}`;
  }

  async diagnosePlant(input: DiagnosisInput): Promise<DiagnosisOutput> {
    const data = await request(this.endpointFor('predict'), this.apiKey, {
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      speciesHint: input.plantSpeciesHint?.slice(0, 1000),
      notes: input.notes?.slice(0, 1000),
    });
    return { ...validateDiagnosisOutput(data), aiProviderUsed: 'custom-dedicated-gpu' };
  }

  async identifyPlant(input: IdentifyInput): Promise<IdentifyOutput> {
    const data = await request(this.endpointFor('identify'), this.apiKey, { imageUrl: input.imageUrl });
    return { ...validateIdentifyOutput(data), aiProviderUsed: 'custom-dedicated-gpu' };
  }

  async chatWithDoctor(input: ChatInput): Promise<ChatOutput> {
    const data = await request(this.endpointFor('chat'), this.apiKey, input);
    return { ...validateChatOutput(data), aiProviderUsed: 'custom-dedicated-gpu' };
  }
}
