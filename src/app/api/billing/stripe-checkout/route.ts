import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/payments/types';
import { createStripeCheckoutSession } from '@/lib/payments/stripe';
import { env } from '@/lib/env';
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const rate = checkRateLimit(`stripe-checkout:${user.id}:${getClientIp(req)}`, 10, 60_000);
    if (!rate.allowed) return NextResponse.json({ error: 'Too many payment attempts. Please wait before trying again.' }, { status: 429 });

    const body = await req.json();
    const tier = body.tier as SubscriptionTier;
    const plan = SUBSCRIPTION_PLANS[tier];
    if (!plan || plan.priceUSD <= 0) return NextResponse.json({ error: 'This plan is not configured for Stripe payments.' }, { status: 400 });

    const appUrl = env.NEXT_PUBLIC_APP_URL;
    const session = await createStripeCheckoutSession({ userId: user.id, userEmail: user.email, tier: plan.id, planName: plan.name, amountUSD: plan.priceUSD, successUrl: `${appUrl}/billing?status=success&tier=${plan.id}`, cancelUrl: `${appUrl}/billing?status=cancelled` });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Unable to create Stripe checkout session' }, { status: 500 });
  }
}
