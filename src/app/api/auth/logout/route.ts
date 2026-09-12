import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('plantinia_token', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
