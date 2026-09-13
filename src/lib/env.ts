import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32),
  DATABASE_URL: z.string().min(1),
  AI_PROVIDER: z.enum(['gemini', 'openai', 'custom', 'mock']).default('mock'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  CUSTOM_INFERENCE_URL: z.string().url().optional(),
  CUSTOM_INFERENCE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STORAGE_PROVIDER: z.enum(['local', 's3', 'r2', 'supabase']).default('local'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default('plantinia-media'),
  NEXT_PUBLIC_STORAGE_PUBLIC_URL: z.string().url().optional(),
  EMAIL_PROVIDER: z.enum(['mock', 'resend', 'smtp']).default('mock'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Plantinia Doctor <notifications@plantinia.app>'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default('mailto:support@plantinia.app'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const raw = { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' };
  const result = envSchema.safeParse(raw);
  if (result.success) {
    const value = result.data;
    if (value.NODE_ENV === 'production') {
      if (value.AI_PROVIDER === 'mock') throw new Error('AI_PROVIDER=mock is not allowed in production');
      if (value.AI_PROVIDER === 'gemini' && !value.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is required when AI_PROVIDER=gemini');
      if (value.AI_PROVIDER === 'openai' && !value.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai');
      if (value.AI_PROVIDER === 'custom' && !value.CUSTOM_INFERENCE_URL) throw new Error('CUSTOM_INFERENCE_URL is required when AI_PROVIDER=custom');
      if (value.EMAIL_PROVIDER === 'mock') throw new Error('EMAIL_PROVIDER=mock is not allowed in production');
      if (value.EMAIL_PROVIDER === 'smtp' && (!value.SMTP_HOST || !value.SMTP_USER || !value.SMTP_PASSWORD)) throw new Error('SMTP configuration is required in production');
      if (value.EMAIL_PROVIDER === 'resend' && !value.RESEND_API_KEY) throw new Error('RESEND_API_KEY is required in production');
      if (value.STORAGE_PROVIDER === 'local') throw new Error('STORAGE_PROVIDER=local is not allowed in production; use S3, R2, or Supabase storage');
      if (value.STORAGE_PROVIDER === 'supabase' && (!value.SUPABASE_URL || !value.SUPABASE_SERVICE_ROLE_KEY)) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase storage');
      if ((value.STORAGE_PROVIDER === 's3' || value.STORAGE_PROVIDER === 'r2') && (!value.S3_ENDPOINT || !value.S3_BUCKET)) throw new Error('S3_ENDPOINT and S3_BUCKET are required for S3/R2 storage');
      if (value.NEXT_PUBLIC_RAZORPAY_KEY_ID && (!value.RAZORPAY_KEY_SECRET || !value.RAZORPAY_WEBHOOK_SECRET)) throw new Error('Razorpay secret and webhook secret are required when Razorpay is enabled');
      if (value.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (!value.STRIPE_SECRET_KEY || !value.STRIPE_WEBHOOK_SECRET)) throw new Error('Stripe secret and webhook secret are required when Stripe is enabled');
    }
    return value;
  }
  if (process.env.NODE_ENV === 'production') throw new Error(`Invalid production environment configuration: ${result.error.message}`);
  return envSchema.parse({ ...raw, JWT_SECRET: process.env.JWT_SECRET || 'plantinia-local-development-secret-change-me-32', DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db' });
}

export const env = validateEnv();
