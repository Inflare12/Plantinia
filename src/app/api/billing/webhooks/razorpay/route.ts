import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';
import { SubscriptionTier, getPlan } from '@/lib/payments/types';
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

  if (!signature) {
    return false;
  }

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
    const hex = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (hex.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < hex.length; i++) {
      diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const isValid = await verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    let event: any = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity || {};
      const notes = paymentEntity.notes || {};
      const userId = notes.userId;
      const tier: SubscriptionTier = notes.tier || 'pro';

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
            paymentProvider: 'razorpay',
            subscriptionId: paymentEntity.order_id || paymentEntity.id,
            creditsRemaining: creditsToSet,
            videoCreditsRemaining: videoCreditsToSet,
          });

          await db.invoices.create({
            userId: user.id,
            amount: plan.priceINR,
            currency: 'INR',
            provider: 'razorpay',
            providerPaymentId: paymentEntity.id || `pay_${Date.now()}`,
            status: 'paid',
            plan: plan.name,
            receiptUrl: `#receipt-${paymentEntity.id}`,
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

