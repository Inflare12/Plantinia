import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';
import { SubscriptionTier, getPlan, SUBSCRIPTION_PLANS } from '@/lib/payments/types';
import { env } from '@/lib/env';

async function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    if (env.NODE_ENV === 'production') {
      console.error('CRITICAL: Stripe webhook secret is not configured in production');
      return false;
    }
    return true;
  }
  if (!signatureHeader) return false;

  try {
    let timestamp = '';
    const signatures: string[] = [];
    for (const item of signatureHeader.split(',')) {
      const [key, value] = item.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1' && value) signatures.push(value);
    }
    const timestampNumber = Number(timestamp);
    if (!timestamp || !Number.isFinite(timestampNumber) || Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > 300) return false;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(webhookSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(`${timestamp}.${rawBody}`));
    const expectedHex = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');

    return signatures.some((candidate) => {
      if (candidate.length !== expectedHex.length) return false;
      let diff = 0;
      for (let i = 0; i < candidate.length; i++) diff |= candidate.charCodeAt(i) ^ expectedHex.charCodeAt(i);
      return diff === 0;
    });
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
    if (!(await verifyStripeWebhookSignature(rawBody, req.headers.get('stripe-signature')))) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    let event: any;
    try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 }); }

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object || {};
      const metadata = session.metadata || {};
      const userId = session.client_reference_id;
      const tierValue = metadata.tier;

      if (!userId || metadata.userId !== userId || !validTier(tierValue)) {
        return NextResponse.json({ error: 'Webhook is missing valid account or plan metadata' }, { status: 400 });
      }

      const tier = tierValue as SubscriptionTier;
      const plan = getPlan(tier);
      const expectedAmount = Math.round(plan.priceUSD * 100);
      if (session.mode !== 'subscription' || session.payment_status !== 'paid' || session.amount_total !== expectedAmount) {
        return NextResponse.json({ error: 'Webhook payment does not match the configured plan' }, { status: 400 });
      }

      const user = await db.users.findById(userId);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const paymentRef = String(session.id || '');
      if (!paymentRef) return NextResponse.json({ error: 'Missing Stripe session ID' }, { status: 400 });

      try {
        await db.invoices.create({
          userId: user.id,
          amount: plan.priceUSD,
          currency: 'USD',
          provider: 'stripe',
          providerPaymentId: paymentRef,
          status: 'paid',
          plan: plan.name,
          receiptUrl: session.customer_details?.receipt_url || `#receipt-${paymentRef}`,
        });
      } catch (error: any) {
        const message = String(error?.message || '').toLowerCase();
        if (message.includes('unique') || message.includes('duplicate')) return NextResponse.json({ received: true, duplicate: true });
        throw error;
      }

      await db.users.update(user.id, {
        subscriptionTier: plan.id,
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        paymentProvider: 'stripe',
        subscriptionId: session.subscription || session.id,
        creditsRemaining: plan.creditsPerMonth === 'unlimited' ? 9999 : plan.creditsPerMonth,
        videoCreditsRemaining: plan.videoCreditsPerMonth === 'unlimited' ? 9999 : plan.videoCreditsPerMonth,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: env.NODE_ENV === 'production' ? 'Webhook processing failed' : error.message }, { status: 400 });
  }
}
