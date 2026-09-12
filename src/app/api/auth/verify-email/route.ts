import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';
import { signJWT } from '@/lib/auth/jwt';
import { env } from '@/lib/env';
import { checkRateLimit, getClientIp, resetRateLimit } from '@/lib/auth/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const verificationCode = String(code).trim();

    // Brute-force protection: max 5 code attempts per 10 minutes
    const rateCheck = checkRateLimit(`verify-email:${normalizedEmail}`, 5, 600000);
    const ipRateCheck = checkRateLimit(`verify-email-ip:${ip}`, 15, 600000);
    if (!rateCheck.allowed || !ipRateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many incorrect verification attempts. Please wait 10 minutes or request a new code.' },
        { status: 429 }
      );
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      return NextResponse.json(
        { error: 'Verification code must be 6 digits' },
        { status: 400 }
      );
    }

    const user = await db.users.findByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification request' },
        { status: 400 }
      );
    }

    if (user.isEmailVerified) {
      const token = await signJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Email is already verified.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          creditsRemaining: user.creditsRemaining,
          isEmailVerified: true,
          avatarUrl: user.avatarUrl,
        },
      });

      response.cookies.set('plantinia_token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    if (!user.verificationCode || !user.verificationCodeExpiresAt) {
      return NextResponse.json(
        { error: 'No active verification code. Please request a new code.' },
        { status: 400 }
      );
    }

    const expiresAt = new Date(user.verificationCodeExpiresAt);

    if (expiresAt.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    if (user.verificationCode !== verificationCode) {
      return NextResponse.json(
        { error: 'Incorrect verification code' },
        { status: 400 }
      );
    }

    // Reset rate limit on success
    resetRateLimit(`verify-email:${normalizedEmail}`);

    const updatedUser = await db.users.update(user.id, {
      isEmailVerified: true,
      verificationCode: undefined,
      verificationCodeExpiresAt: undefined,
      verificationToken: undefined,
    });

    const token = await signJWT({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      subscriptionTier: updatedUser.subscriptionTier,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Email successfully verified! Welcome to Plantinia.',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        subscriptionTier: updatedUser.subscriptionTier,
        creditsRemaining: updatedUser.creditsRemaining,
        isEmailVerified: true,
        avatarUrl: updatedUser.avatarUrl,
      },
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
    console.error('Email verification error:', error);
    const errorMessage = env.NODE_ENV === 'production'
      ? 'An unexpected error occurred during email verification.'
      : (error.message || 'Internal server error');
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
