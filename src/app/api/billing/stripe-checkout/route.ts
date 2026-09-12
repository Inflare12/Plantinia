import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/payments/types';
import { createStripeCheckoutSession } from '@/lib/payments/stripe';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();
    const plan = SUBSCRIPTION_PLANS[tier as SubscriptionTier];

    if (!plan || plan.priceUSD <= 0) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await createStripeCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      tier: plan.id as 'pro' | 'farm',
      amountUSD: plan.priceUSD,
      successUrl: `${appUrl}/billing?status=success`,
      cancelUrl: `${appUrl}/billing?status=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
