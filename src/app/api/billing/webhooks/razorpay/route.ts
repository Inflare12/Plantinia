import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';
import { SUBSCRIPTION_PLANS, SubscriptionTier, getPlan } from '@/lib/payments/types';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    console.log('[Razorpay Webhook Received]', { length: rawBody.length, hasSignature: !!signature });

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

