import { IAIEngine } from './types';
import { GeminiAIEngine } from './gemini';
import { OpenAIAIEngine } from './openai';
import { CustomInferenceAIEngine } from './custom';
import { MockAIEngine } from './mock';
import { env } from '../env';

export function getAIEngine(): IAIEngine {
  const provider = env.AI_PROVIDER;

  if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    return new GeminiAIEngine();
  }
  if (provider === 'openai') {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
    return new OpenAIAIEngine();
  }
  if (provider === 'custom') {
    if (!env.CUSTOM_INFERENCE_URL) throw new Error('CUSTOM_INFERENCE_URL is not configured');
    return new CustomInferenceAIEngine();
  }
  if (provider === 'mock') return new MockAIEngine();

  throw new Error(`Unsupported AI provider: ${provider}`);
}

export * from './types';
