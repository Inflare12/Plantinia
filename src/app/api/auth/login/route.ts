import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/adapter';
import { verifyPassword, dummyVerifyPassword } from '@/lib/auth/session';
import { signJWT } from '@/lib/auth/jwt';
import { env } from '@/lib/env';
import { checkRateLimit, getClientIp, resetRateLimit } from '@/lib/auth/rate-limit';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(254, 'Email too long').transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required').max(128, 'Password must not exceed 128 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Rate limiting: brute-force mitigation per IP and per account
    const ipRateCheck = checkRateLimit(`login-ip:${ip}`, 15, 900000);
    const emailRateCheck = checkRateLimit(`login-email:${email}`, 5, 900000);

    if (!ipRateCheck.allowed || !emailRateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    const user = await db.users.findByEmail(email);

    if (!user) {
      // Execute constant-time dummy verification to protect against account enumeration via timing
      await dummyVerifyPassword();
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          error: 'Please verify your email before signing in',
          requiresEmailVerification: true,
        },
        { status: 403 }
      );
    }

    // Reset rate limits on successful authentication
    resetRateLimit(`login-email:${email}`);
    resetRateLimit(`login-ip:${ip}`);

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        creditsRemaining: user.creditsRemaining,
        isEmailVerified: user.isEmailVerified,
        avatarUrl: user.avatarUrl,
      },
      token,
    });

    response.cookies.set('plantinia_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    const errorMessage = env.NODE_ENV === 'production'
      ? 'An unexpected error occurred during login.'
      : (error.message || 'Internal server error');
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
