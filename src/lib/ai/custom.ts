import {
  IAIEngine,
  DiagnosisInput,
  DiagnosisOutput,
  IdentifyInput,
  IdentifyOutput,
  ChatInput,
  ChatOutput,
} from './types';
import { env } from '../env';

export class CustomInferenceAIEngine implements IAIEngine {
  name = 'custom-gpu-inference-engine';

  private get endpoint(): string {
    return env.CUSTOM_INFERENCE_URL || '';
  }

  private get apiKey(): string {
    return env.CUSTOM_INFERENCE_API_KEY || '';
  }

  async diagnosePlant(input: DiagnosisInput): Promise<DiagnosisOutput> {
    if (!this.endpoint) {
      throw new Error('CUSTOM_INFERENCE_URL is not configured for custom model');
    }

    const response = await fetch(`${this.endpoint}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
        speciesHint: input.plantSpeciesHint,
        notes: input.notes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom inference error ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      aiProviderUsed: 'custom-dedicated-gpu',
    };
  }

  async identifyPlant(input: IdentifyInput): Promise<IdentifyOutput> {
    if (!this.endpoint) {
      throw new Error('CUSTOM_INFERENCE_URL is not configured');
    }

    const response = await fetch(`${this.endpoint}/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({ imageUrl: input.imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`Custom identify error ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      aiProviderUsed: 'custom-dedicated-gpu',
    };
  }

  async chatWithDoctor(input: ChatInput): Promise<ChatOutput> {
    if (!this.endpoint) {
      throw new Error('CUSTOM_INFERENCE_URL is not configured');
    }

    const response = await fetch(`${this.endpoint}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Custom chat error: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      aiProviderUsed: 'custom-dedicated-gpu',
    };
  }
}
