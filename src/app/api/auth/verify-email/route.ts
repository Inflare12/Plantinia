import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const verificationCode = String(code).trim();

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
      return NextResponse.json({
        success: true,
        message: 'Email is already verified.',
      });
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

    await db.users.update(user.id, {
      isEmailVerified: true,
      verificationCode: undefined,
      verificationCodeExpiresAt: undefined,
      verificationToken: undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Email successfully verified! Welcome to Plantinia.',
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
