import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';
import { SubscriptionTier, getPlan } from '@/lib/payments/types';
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

  if (!signatureHeader) {
    return false;
  }

  try {
    const items = signatureHeader.split(',');
    let timestamp = '';
    const signatures: string[] = [];
    for (const item of items) {
      const [k, v] = item.split('=');
      if (k === 't') timestamp = v;
      if (k === 'v1') signatures.push(v);
    }

    if (!timestamp || signatures.length === 0) return false;

    // Check tolerance (5 minutes)
    const tolerance = 300;
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > tolerance) {
      return false;
    }

    const payloadToSign = `${timestamp}.${rawBody}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadToSign));
    const expectedHex = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return signatures.some((sig) => {
      if (sig.length !== expectedHex.length) return false;
      let diff = 0;
      for (let i = 0; i < sig.length; i++) {
        diff |= sig.charCodeAt(i) ^ expectedHex.charCodeAt(i);
      }
      return diff === 0;
    });
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    const isValid = await verifyStripeWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    let event: any = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object || {};
      const userId = session.client_reference_id;
      const metadata = session.metadata || {};
      const tier: SubscriptionTier = metadata.tier || 'pro';

      if (userId) {
        const user = await db.users.findById(userId);
        if (user) {
          const plan = getPlan(tier);
          const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
          const creditsToSet = plan.creditsPerMonth === 'unlimited' ? 9999 : plan.creditsPerMonth;
          const videoCreditsToSet =
            plan.videoCreditsPerMonth === 'unlimited' ? 9999 : plan.videoCreditsPerMonth;

          await db.users.update(user.id, {
            subscriptionTier: plan.id,
            subscriptionStatus: 'active',
            subscriptionCurrentPeriodEnd: periodEnd,
            paymentProvider: 'stripe',
            subscriptionId: session.subscription || session.id,
            creditsRemaining: creditsToSet,
            videoCreditsRemaining: videoCreditsToSet,
          });

          await db.invoices.create({
            userId: user.id,
            amount: plan.priceUSD,
            currency: 'USD',
            provider: 'stripe',
            providerPaymentId: session.id,
            status: 'paid',
            plan: plan.name,
            receiptUrl: session.customer_details?.receipt_url || `#receipt-${session.id}`,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

