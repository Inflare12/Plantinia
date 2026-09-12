import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32),
  DATABASE_URL: z.string().min(1),
  AI_PROVIDER: z.enum(["gemini", "openai", "custom", "mock"]).default("mock"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  CUSTOM_INFERENCE_URL: z.string().optional(),
  CUSTOM_INFERENCE_API_KEY: z.string().optional(),

  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  STORAGE_PROVIDER: z.enum(["local", "s3", "r2", "supabase"]).default("local"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STORAGE_PUBLIC_URL: z.string().optional(),

  EMAIL_PROVIDER: z.enum(["mock", "resend", "smtp"]).default("mock"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Plantinia Doctor <notifications@plantinia.app>"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default("mailto:support@plantinia.app"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const raw = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || "development",
  };

  const result = envSchema.safeParse(raw);
  if (result.success) {
    const value = result.data;
    if (value.NODE_ENV === "production" && value.AI_PROVIDER === "mock") {
      throw new Error("AI_PROVIDER=mock is not allowed in production");
    }
    return value;
  }

  // Keep local development convenient, but never silently hide a production
  // configuration error behind development defaults.
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Invalid production environment configuration: ${result.error.message}`);
  }

  const development = envSchema.parse({
    ...raw,
    JWT_SECRET: process.env.JWT_SECRET || "plantinia-local-development-secret-change-me-32",
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  });
  return development;
}

export const env = validateEnv();
