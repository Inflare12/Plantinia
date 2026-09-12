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

export class OpenAIAIEngine implements IAIEngine {
  name = 'openai-vision-engine';

  private get apiKey(): string {
    return env.OPENAI_API_KEY || '';
  }

  private get model(): string {
    return env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async diagnosePlant(input: DiagnosisInput): Promise<DiagnosisOutput> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert plant doctor. Analyze the plant image and return JSON:
{
  "identifiedSpecies": "Scientific & common name",
  "diseaseName": "Disease name or Healthy Plant",
  "pathogenType": "fungal" | "bacterial" | "viral" | "pest" | "environmental" | "none",
  "confidence": 0-100,
  "severity": "mild" | "moderate" | "severe" | "critical",
  "symptoms": ["..."],
  "causes": ["..."],
  "prognosis": "...",
  "treatmentSteps": [{"stepNumber": 1, "title": "...", "instruction": "...", "frequency": "..."}],
  "organicRemedies": ["..."],
  "chemicalRemedies": [{"name": "...", "activeIngredient": "...", "approximateCost": "...", "instructions": "..."}],
  "preventativeMeasures": ["..."],
  "boundingBoxes": [{"x": 10, "y": 20, "width": 30, "height": 40, "label": "..."}]
}
Respond with JSON only.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Diagnose this plant. Hint: ${input.plantSpeciesHint || 'Unknown'}. Notes: ${input.notes || 'None'}`,
              },
              {
                type: 'image_url',
                image_url: { url: input.mediaUrl },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      ...parsed,
      aiProviderUsed: `openai-${this.model}`,
    };
  }

  async identifyPlant(input: IdentifyInput): Promise<IdentifyOutput> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Identify plant species. Return JSON with species, commonName, family, confidence, sunlightNeeds, wateringFrequencyDays, difficulty, careSummary, toxicityAlert.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify this plant species.' },
              { type: 'image_url', image_url: { url: input.imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content);
    return {
      ...parsed,
      aiProviderUsed: `openai-${this.model}`,
    };
  }

  async chatWithDoctor(input: ChatInput): Promise<ChatOutput> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const systemPrompt = `You are Dr. Flora, the AI Plant Doctor in Plantinia. Be warm, accurate, and concise.`;
    const messages = [
      { role: 'system', content: systemPrompt },
      ...input.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Chat error: ${response.status}`);
    }

    const data = await response.json();
    return {
      response: data.choices?.[0]?.message?.content || '',
      suggestedFollowUps: ['What should I prune next?', 'How do I optimize watering?'],
      aiProviderUsed: `openai-${this.model}`,
    };
  }
}
