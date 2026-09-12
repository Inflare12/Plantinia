import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { SUBSCRIPTION_PLANS, SubscriptionTier, getPlan } from '@/lib/payments/types';
import { db } from '@/lib/db/adapter';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      provider = 'razorpay',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      stripe_session_id,
      tier,
    } = body;

    const plan = getPlan(tier as SubscriptionTier);

    if (provider === 'razorpay') {
      const isValid = await verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid payment signature verification' }, { status: 400 });
      }
    } else if (provider === 'stripe') {
      if (!stripe_session_id) {
        return NextResponse.json({ error: 'Stripe session ID is required' }, { status: 400 });
      }
    }

    const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const creditsToSet = plan.creditsPerMonth === 'unlimited' ? 9999 : plan.creditsPerMonth;
    const videoCreditsToSet =
      plan.videoCreditsPerMonth === 'unlimited' ? 9999 : plan.videoCreditsPerMonth;

    const paymentRef =
      provider === 'razorpay' ? razorpay_payment_id : stripe_session_id || `cs_${Date.now()}`;

    const updatedUser = await db.users.update(user.id, {
      subscriptionTier: plan.id,
      subscriptionStatus: 'active',
      subscriptionCurrentPeriodEnd: periodEnd,
      paymentProvider: provider,
      subscriptionId: provider === 'razorpay' ? razorpay_order_id : stripe_session_id,
      creditsRemaining: creditsToSet,
      videoCreditsRemaining: videoCreditsToSet,
    });

    // Generate invoice record
    await db.invoices.create({
      userId: user.id,
      amount: provider === 'stripe' ? plan.priceUSD : plan.priceINR,
      currency: provider === 'stripe' ? 'USD' : 'INR',
      provider,
      providerPaymentId: paymentRef,
      status: 'paid',
      plan: plan.name,
      receiptUrl: `#receipt-${paymentRef}`,
    });

    return NextResponse.json({
      success: true,
      message: `Upgraded to ${plan.name} successfully!`,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

