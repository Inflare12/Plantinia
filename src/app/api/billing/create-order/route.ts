import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/payments/types';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { env } from '@/lib/env';
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const rate = checkRateLimit(`billing-order:${user.id}:${getClientIp(req)}`, 10, 60_000);
    if (!rate.allowed) return NextResponse.json({ error: 'Too many payment attempts. Please wait before trying again.' }, { status: 429 });

    const body = await req.json();
    const tier = body.tier as SubscriptionTier;
    const plan = SUBSCRIPTION_PLANS[tier];
    if (!plan || plan.priceINR <= 0) return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });

    const receipt = `rcpt_${user.id}_${tier}_${Date.now()}`;
    const order = await createRazorpayOrder(plan.priceINR, receipt, { userId: user.id, tier });
    return NextResponse.json({ order, keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_sample', plan });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return NextResponse.json({ error: 'Unable to create payment order' }, { status: 500 });
  }
}
