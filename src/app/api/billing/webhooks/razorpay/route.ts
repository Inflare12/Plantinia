import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';
import { SubscriptionTier, getPlan, SUBSCRIPTION_PLANS } from '@/lib/payments/types';
import { env } from '@/lib/env';

async function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null): Promise<boolean> {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;
  if (!webhookSecret || webhookSecret === 'sample_secret') {
    if (env.NODE_ENV === 'production') {
      console.error('CRITICAL: Razorpay webhook secret is not configured in production');
      return false;
    }
    return true;
  }
  if (!signature) return false;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(webhookSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
    const expected = Array.from(new Uint8Array(sigBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}

function validTier(value: unknown): value is SubscriptionTier {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, value) && value !== 'free';
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (!(await verifyRazorpayWebhookSignature(rawBody, req.headers.get('x-razorpay-signature')))) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    let event: any;
    try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 }); }

    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity || {};
      const notes = paymentEntity.notes || {};
      const userId = notes.userId;
      const tierValue = notes.tier;

      if (!userId || !validTier(tierValue)) {
        return NextResponse.json({ error: 'Webhook is missing valid account or plan metadata' }, { status: 400 });
      }

      const tier = tierValue as SubscriptionTier;
      const plan = getPlan(tier);
      const expectedAmount = Math.round(plan.priceINR * 100);
      if (paymentEntity.amount !== expectedAmount || paymentEntity.currency !== 'INR' || paymentEntity.status !== 'captured') {
        return NextResponse.json({ error: 'Webhook payment does not match the configured plan' }, { status: 400 });
      }

      const user = await db.users.findById(userId);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const paymentRef = String(paymentEntity.id || '');
      if (!paymentRef) return NextResponse.json({ error: 'Missing Razorpay payment ID' }, { status: 400 });

      try {
        await db.invoices.create({
          userId: user.id,
          amount: plan.priceINR,
          currency: 'INR',
          provider: 'razorpay',
          providerPaymentId: paymentRef,
          status: 'paid',
          plan: plan.name,
          receiptUrl: `#receipt-${paymentRef}`,
        });
      } catch (error: any) {
        const message = String(error?.message || '').toLowerCase();
        if (message.includes('unique') || message.includes('duplicate')) return NextResponse.json({ status: 'ok', duplicate: true });
        throw error;
      }

      await db.users.update(user.id, {
        subscriptionTier: plan.id,
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        paymentProvider: 'razorpay',
        subscriptionId: paymentEntity.order_id || paymentEntity.id,
        creditsRemaining: plan.creditsPerMonth === 'unlimited' ? 9999 : plan.creditsPerMonth,
        videoCreditsRemaining: plan.videoCreditsPerMonth === 'unlimited' ? 9999 : plan.videoCreditsPerMonth,
      });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: env.NODE_ENV === 'production' ? 'Webhook processing failed' : error.message }, { status: 400 });
  }
}
