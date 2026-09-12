import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/payments/types';
import { db } from '@/lib/db/adapter';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = await req.json();

    const isValid = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature verification' }, { status: 400 });
    }

    const plan = SUBSCRIPTION_PLANS[tier as SubscriptionTier] || SUBSCRIPTION_PLANS.pro;

    const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    const updatedUser = await db.users.update(user.id, {
      subscriptionTier: plan.id,
      subscriptionStatus: 'active',
      subscriptionCurrentPeriodEnd: periodEnd,
      paymentProvider: 'razorpay',
      subscriptionId: razorpay_order_id,
      creditsRemaining: plan.id === 'free' ? 5 : 9999,
    });

    // Generate invoice record
    await db.invoices.create({
      userId: user.id,
      amount: plan.priceINR,
      currency: 'INR',
      provider: 'razorpay',
      providerPaymentId: razorpay_payment_id,
      status: 'paid',
      plan: plan.name,
      receiptUrl: `#receipt-${razorpay_payment_id}`,
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
