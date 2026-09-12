import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/payments/types';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();
    const plan = SUBSCRIPTION_PLANS[tier as SubscriptionTier];

    if (!plan || plan.priceINR <= 0) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const receipt = `rcpt_${user.id}_${tier}_${Date.now()}`;
    const order = await createRazorpayOrder(plan.priceINR, receipt, {
      userId: user.id,
      tier,
    });

    return NextResponse.json({
      order,
      keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_sample',
      plan,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
