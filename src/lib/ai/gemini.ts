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

export class GeminiAIEngine implements IAIEngine {
  name = 'gemini-vision-engine';

  private get apiKey(): string {
    return env.GEMINI_API_KEY || '';
  }

  private get model(): string {
    return env.GEMINI_MODEL || 'gemini-3.5-flash';
  }

  async diagnosePlant(input: DiagnosisInput): Promise<DiagnosisOutput> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert plant pathologist and AI plant doctor.
Analyze the provided plant media/image/video and return a strict JSON object with these exact keys:
{
  "identifiedSpecies": "Scientific name and Common name",
  "diseaseName": "Specific disease name or 'Healthy Plant'",
  "pathogenType": "fungal" | "bacterial" | "viral" | "pest" | "environmental" | "none",
  "confidence": number from 0 to 100,
  "severity": "mild" | "moderate" | "severe" | "critical",
  "symptoms": ["list of observable symptoms"],
  "causes": ["biological or environmental factors causing this"],
  "prognosis": "short prognosis paragraph",
  "treatmentSteps": [{"stepNumber": 1, "title": "...", "instruction": "...", "frequency": "..."}],
  "organicRemedies": ["What to make at home (recipes, natural sprays)"],
  "chemicalRemedies": [{"name": "Product Name", "activeIngredient": "Ingredient", "approximateCost": "₹ or $ range", "instructions": "How to apply"}],
  "preventativeMeasures": ["steps to prevent recurrence"],
  "boundingBoxes": [{"x": 10, "y": 20, "width": 30, "height": 40, "label": "Affected Area"}]
}
User notes: "${input.notes || 'None'}". Plant hint: "${input.plantSpeciesHint || 'None'}". Location: "${input.userLocation || 'Global'}".
Respond ONLY with valid JSON. Do not include markdown code block backticks.`;

    const parts: any[] = [{ text: systemPrompt }];

    // If media is a data URI or URL
    if (input.mediaUrl.startsWith('data:')) {
      const match = input.mediaUrl.match(/^data:(image\/\w+|video\/\w+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    } else {
      parts.push({
        text: `Image media URL to inspect: ${input.mediaUrl}`,
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsed = JSON.parse(candidateText.replace(/```json/g, '').replace(/```/g, '').trim());
    return {
      ...parsed,
      aiProviderUsed: `gemini-${this.model}`,
    };
  }

  async identifyPlant(input: IdentifyInput): Promise<IdentifyOutput> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = `Identify this plant species. Return JSON with keys:
{
  "species": "Botanical species name",
  "commonName": "Common popular name",
  "family": "Botanical family name",
  "confidence": 0-100,
  "sunlightNeeds": "direct" | "indirect" | "low" | "shade",
  "wateringFrequencyDays": number of days between waterings,
  "difficulty": "easy" | "moderate" | "expert",
  "careSummary": "Comprehensive summary of care routine",
  "toxicityAlert": "Toxicity warning for cats/dogs/children or null"
}
Respond with raw JSON only.`;

    const parts: any[] = [{ text: prompt }];

    if (input.imageUrl.startsWith('data:')) {
      const match = input.imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: { mimeType: match[1], data: match[2] },
        });
      }
    } else {
      parts.push({ text: `Image URL: ${input.imageUrl}` });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());

    return {
      ...parsed,
      aiProviderUsed: `gemini-${this.model}`,
    };
  }

  async chatWithDoctor(input: ChatInput): Promise<ChatOutput> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const context = `You are Dr. Flora, the world's most supportive and scientifically precise AI Plant Doctor for the Plantinia app.
Context:
${input.plantContext ? `Plant: ${input.plantContext.name} (${input.plantContext.species}), Status: ${input.plantContext.healthStatus}, Last Diag: ${input.plantContext.recentDiagnosis || 'None'}` : 'No specific plant selected.'}
${input.weatherContext ? `Weather: ${input.weatherContext.tempC}°C, Humidity: ${input.weatherContext.humidity}%, Condition: ${input.weatherContext.condition}` : ''}
Provide direct, actionable, compassionate care advice. Mention safe home remedies and timing.`;

    const contents = input.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Prepend context to the first user message or system instruction
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: context }] },
        contents,
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini Chat error: ${response.status}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      response: replyText,
      suggestedFollowUps: [
        'How often should I fertilize this season?',
        'Can I prune dead leaves right now?',
        'What pest repellent can I make at home?',
      ],
      aiProviderUsed: `gemini-${this.model}`,
    };
  }
}
