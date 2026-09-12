import { IAIEngine } from './types';
import { GeminiAIEngine } from './gemini';
import { OpenAIAIEngine } from './openai';
import { CustomInferenceAIEngine } from './custom';
import { MockAIEngine } from './mock';
import { env } from '../env';

export function getAIEngine(): IAIEngine {
  const provider = env.AI_PROVIDER;

  // 1. Explicit Gemini configuration
  if (provider === 'gemini' && env.GEMINI_API_KEY) {
    return new GeminiAIEngine();
  }

  // 2. Explicit OpenAI configuration
  if (provider === 'openai' && env.OPENAI_API_KEY) {
    return new OpenAIAIEngine();
  }

  // 3. Custom external GPU cluster
  if (provider === 'custom' && env.CUSTOM_INFERENCE_URL) {
    return new CustomInferenceAIEngine();
  }

  // 4. Auto-detect if user has GEMINI_API_KEY set even if AI_PROVIDER wasn't toggled
  if (env.GEMINI_API_KEY) {
    return new GeminiAIEngine();
  }

  // 5. Default reliable mock botanic engine for offline, dev & zero-cost testing
  return new MockAIEngine();
}

export * from './types';
