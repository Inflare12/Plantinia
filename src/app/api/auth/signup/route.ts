import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomInt } from 'crypto';
import { db } from '@/lib/db/adapter';
import { hashPassword } from '@/lib/auth/session';
import { getEmailProvider, generateVerificationEmailHtml } from '@/lib/email';
import { env } from '@/lib/env';
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit';

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  email: z.string().email('Invalid email address').max(254, 'Email must not exceed 254 characters').transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must not exceed 128 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`signup:${ip}`, 10, 3600000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const existingUser = await db.users.findByEmail(email);

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }

      const verificationCode = randomInt(100000, 1000000).toString();
      const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await db.users.update(existingUser.id, {
        name,
        passwordHash: await hashPassword(password),
        verificationCode,
        verificationCodeExpiresAt: verificationCodeExpiresAt.toISOString(),
      });

      const emailProvider = getEmailProvider();

      const emailSent = await emailProvider.sendEmail({
        to: email,
        subject: 'Verify your Plantinia Account 🌿',
        html: generateVerificationEmailHtml(name, verificationCode),
      });

      if (!emailSent) {
        return NextResponse.json(
          { error: 'We could not send the verification email. Please try again later.' },
          { status: 503 }
        );
      }

      return NextResponse.json({
        user: {
          id: existingUser.id,
          name,
          email: existingUser.email,
          isEmailVerified: false,
        },
        message: 'A new verification code has been sent to your email.',
        requiresEmailVerification: true,
      });
    }

    const passwordHash = await hashPassword(password);
    const verificationCode = randomInt(100000, 1000000).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await db.users.create({
      name,
      email,
      passwordHash,
      role: 'user',
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpiresAt: verificationCodeExpiresAt.toISOString(),
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      creditsRemaining: 5,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
    });

    const emailProvider = getEmailProvider();

    const emailSent = await emailProvider.sendEmail({
      to: email,
      subject: 'Verify your Plantinia Account 🌿',
      html: generateVerificationEmailHtml(name, verificationCode),
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: 'We could not send the verification email. Please try again later.' },
        { status: 503 }
      );
    }

    // Do NOT issue a full session token/cookie to unverified users.
    // The user must verify their email with the 6-digit code before session issuance.
    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          subscriptionTier: newUser.subscriptionTier,
          creditsRemaining: newUser.creditsRemaining,
          isEmailVerified: false,
        },
        message: 'Registration successful. Please verify your email with the 6-digit code sent to your inbox.',
        requiresEmailVerification: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    const errorMessage = env.NODE_ENV === 'production'
      ? 'An unexpected error occurred during registration.'
      : (error.message || 'Internal server error');
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
