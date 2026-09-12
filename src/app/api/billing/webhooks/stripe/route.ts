import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';
import { SUBSCRIPTION_PLANS, SubscriptionTier, getPlan } from '@/lib/payments/types';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log('[Stripe Webhook Received]', { length: rawBody.length, hasSignature: !!signature });

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

