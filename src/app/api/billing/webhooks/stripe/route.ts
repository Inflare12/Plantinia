import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';
import { prisma } from '@/lib/db/prisma';
import { SubscriptionTier, getPlan, SUBSCRIPTION_PLANS } from '@/lib/payments/types';
import { env } from '@/lib/env';

async function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !signatureHeader) return false;
  try {
    let timestamp = ''; const signatures: string[] = [];
    for (const item of signatureHeader.split(',')) { const [key, value] = item.split('='); if (key === 't') timestamp = value; if (key === 'v1' && value) signatures.push(value); }
    const timestampNumber = Number(timestamp);
    if (!timestamp || !Number.isFinite(timestampNumber) || Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > 300) return false;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(webhookSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
    const expected = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
    return signatures.some((candidate) => candidate.length === expected.length && candidate.split('').every((c, i) => c.charCodeAt(0) === expected.charCodeAt(i)));
  } catch { return false; }
}

function validTier(value: unknown): value is SubscriptionTier { return typeof value === 'string' && Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, value) && value !== 'free'; }

async function applyPaidState(userId: string, tier: SubscriptionTier, periodEnd?: number | null, providerSubscriptionId?: string) {
  const plan = getPlan(tier);
  const videoCredits = plan.videoCreditsPerMonth === 'unlimited' ? 9999 : plan.videoCreditsPerMonth;
  const updated = await db.users.update(userId, {
    subscriptionTier: plan.id,
    subscriptionStatus: 'active',
    subscriptionCurrentPeriodEnd: new Date((periodEnd || Math.floor(Date.now() / 1000) + 30 * 24 * 3600) * 1000).toISOString(),
    paymentProvider: 'stripe',
    subscriptionId: providerSubscriptionId,
    creditsRemaining: plan.creditsPerMonth === 'unlimited' ? 9999 : plan.creditsPerMonth,
  });
  if (!updated) return false;
  if (/^postgres(?:ql)?:\/\//i.test(process.env.DATABASE_URL || '')) await prisma.user.update({ where: { id: userId }, data: { videoCreditsRemaining: videoCredits } });
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (!(await verifyStripeWebhookSignature(rawBody, req.headers.get('stripe-signature')))) return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    let event: any; try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 }); }

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object || {}; const metadata = session.metadata || {};
      const userId = session.client_reference_id; const tierValue = metadata.tier;
      if (!userId || metadata.userId !== userId || !validTier(tierValue)) return NextResponse.json({ error: 'Webhook is missing valid account or plan metadata' }, { status: 400 });
      const plan = getPlan(tierValue as SubscriptionTier);
      if (session.mode !== 'subscription' || session.payment_status !== 'paid' || session.amount_total !== Math.round(plan.priceUSD * 100)) return NextResponse.json({ error: 'Webhook payment does not match the configured plan' }, { status: 400 });
      const user = await db.users.findById(userId); if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const paymentRef = String(session.id || ''); if (!paymentRef) return NextResponse.json({ error: 'Missing Stripe session ID' }, { status: 400 });
      let duplicate = false;
      try { await db.invoices.create({ userId: user.id, amount: plan.priceUSD, currency: 'USD', provider: 'stripe', providerPaymentId: paymentRef, status: 'paid', plan: plan.name, receiptUrl: `#receipt-${paymentRef}` }); }
      catch (error: any) { const message = String(error?.message || '').toLowerCase(); if (message.includes('unique') || message.includes('duplicate')) duplicate = true; else throw error; }
      const ok = await applyPaidState(user.id, tierValue as SubscriptionTier, null, session.subscription || session.id);
      if (!ok) return NextResponse.json({ error: 'Unable to update subscriber account' }, { status: 500 });
      return NextResponse.json({ received: true, duplicate });
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data?.object || {};
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
      if (subscriptionId) {
        const user = await prisma.user.findFirst({ where: { subscriptionId } });
        if (user) {
          const tier = user.subscriptionTier as SubscriptionTier;
          await applyPaidState(user.id, tier, invoice.lines?.data?.[0]?.period?.end || invoice.period_end, subscriptionId);
        }
      }
      return NextResponse.json({ received: true });
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data?.object || {};
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
      if (subscriptionId) await prisma.user.updateMany({ where: { subscriptionId }, data: { subscriptionStatus: 'PAST_DUE' } });
      return NextResponse.json({ received: true });
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data?.object || {};
      const subscriptionId = String(subscription.id || '');
      if (subscriptionId) {
        const status = event.type === 'customer.subscription.deleted' ? 'CANCELED' : subscription.status === 'past_due' ? 'PAST_DUE' : subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE';
        await prisma.user.updateMany({ where: { subscriptionId }, data: { subscriptionStatus: status, subscriptionCurrentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined } });
      }
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) { console.error('Stripe webhook error:', error); return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 }); }
}
