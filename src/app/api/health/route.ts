import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV,
    aiProvider: env.AI_PROVIDER,
    storageProvider: env.STORAGE_PROVIDER,
    emailProvider: env.EMAIL_PROVIDER,
    uptimeSeconds: process.uptime ? Math.floor(process.uptime()) : 0,
  });
}
