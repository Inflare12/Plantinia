import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { SUBSCRIPTION_PLANS, SubscriptionTier, getPlan } from '@/lib/payments/types';
import { db } from '@/lib/db/adapter';
import { env } from '@/lib/env';

function isValidTier(value: unknown): value is SubscriptionTier {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, value) && value !== 'free';
}

async function fetchRazorpayOrder(orderId: string): Promise<any | null> {
  const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || orderId.startsWith('order_mock_')) return null;

  const auth = btoa(`${keyId}:${keySecret}`);
  const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}

async function fetchStripeSession(sessionId: string): Promise<any | null> {
  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey || sessionId.startsWith('mock_cs_')) return null;

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const provider = body.provider === 'stripe' ? 'stripe' : 'razorpay';
    const tier = body.tier;

    if (!isValidTier(tier)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }
    const plan = getPlan(tier);

    let paymentRef = '';
    let subscriptionId = '';

    if (provider === 'razorpay') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Razorpay payment details are required' }, { status: 400 });
      }

      if (!(await verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))) {
        return NextResponse.json({ error: 'Invalid payment signature verification' }, { status: 400 });
      }

      const order = await fetchRazorpayOrder(razorpay_order_id);
      if (order) {
        const expectedAmount = Math.round(plan.priceINR * 100);
        const notes = order.notes || {};
        if (order.amount !== expectedAmount || order.currency !== 'INR' || notes.userId !== user.id || notes.tier !== tier) {
          return NextResponse.json({ error: 'Payment does not match the selected account or plan' }, { status: 400 });
        }
      } else if (env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unable to verify Razorpay order with the payment provider' }, { status: 502 });
      }

      paymentRef = razorpay_payment_id;
      subscriptionId = razorpay_order_id;
    } else {
      const { stripe_session_id } = body;
      if (!stripe_session_id) return NextResponse.json({ error: 'Stripe session ID is required' }, { status: 400 });

      const session = await fetchStripeSession(stripe_session_id);
      if (!session) {
        if (env.NODE_ENV === 'production') {
          return NextResponse.json({ error: 'Unable to verify Stripe checkout session' }, { status: 502 });
        }
      } else {
        const metadata = session.metadata || {};
        const paid = session.payment_status === 'paid' || session.status === 'complete';
        const expectedAmount = Math.round(plan.priceUSD * 100);
        const actualAmount = session.amount_total;
        if (!paid || session.mode !== 'subscription' || session.client_reference_id !== user.id || metadata.userId !== user.id || metadata.tier !== tier || actualAmount !== expectedAmount) {
          return NextResponse.json({ error: 'Stripe payment does not match the selected account or plan' }, { status: 400 });
        }
        subscriptionId = session.subscription || stripe_session_id;
      }

      paymentRef = stripe_session_id;
    }

    const invoice = {
      userId: user.id,
      amount: provider === 'stripe' ? plan.priceUSD : plan.priceINR,
      currency: provider === 'stripe' ? 'USD' : 'INR',
      provider,
      providerPaymentId: paymentRef,
      status: 'paid' as const,
      plan: plan.name,
      receiptUrl: `#receipt-${paymentRef}`,
    };

    // Claim the provider payment before granting credits. The database unique constraint
    // on (provider, providerPaymentId) makes repeated webhook/client callbacks idempotent.
    try {
      await db.invoices.create(invoice);
    } catch (error: any) {
      const message = String(error?.message || '').toLowerCase();
      if (message.includes('unique') || message.includes('duplicate')) {
        const currentUser = await db.users.findById(user.id);
        return NextResponse.json({ success: true, message: 'Payment was already processed.', user: currentUser });
      }
      throw error;
    }

    const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const creditsToSet = plan.creditsPerMonth === 'unlimited' ? 9999 : plan.creditsPerMonth;
    const videoCreditsToSet = plan.videoCreditsPerMonth === 'unlimited' ? 9999 : plan.videoCreditsPerMonth;

    const updatedUser = await db.users.update(user.id, {
      subscriptionTier: plan.id,
      subscriptionStatus: 'active',
      subscriptionCurrentPeriodEnd: periodEnd,
      paymentProvider: provider,
      subscriptionId,
      creditsRemaining: creditsToSet,
      videoCreditsRemaining: videoCreditsToSet,
    });

    if (!updatedUser) return NextResponse.json({ error: 'User account could not be updated' }, { status: 500 });

    return NextResponse.json({
      success: true,
      message: `Upgraded to ${plan.name} successfully!`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: env.NODE_ENV === 'production' ? 'Payment verification failed' : error.message }, { status: 500 });
  }
}
