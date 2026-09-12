import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomInt } from 'crypto';
import { db } from '@/lib/db/adapter';
import { hashPassword } from '@/lib/auth/session';
import { signJWT } from '@/lib/auth/jwt';
import { getEmailProvider, generateVerificationEmailHtml } from '@/lib/email';
import { env } from '@/lib/env';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
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
        subject: 'Verify your Plantinia Account ??',
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
        message: 'A new verification code has been sent.',
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
      subject: 'Verify your Plantinia Account ??',
      html: generateVerificationEmailHtml(name, verificationCode),
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: 'We could not send the verification email. Please try again later.' },
        { status: 503 }
      );
    }

    const token = await signJWT({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      subscriptionTier: newUser.subscriptionTier,
    });

    const response = NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subscriptionTier: newUser.subscriptionTier,
        creditsRemaining: newUser.creditsRemaining,
        isEmailVerified: newUser.isEmailVerified,
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
