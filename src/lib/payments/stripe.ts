import { env } from '../env';
import { SubscriptionTier, getPlan } from './types';

export async function createStripeCheckoutSession(params: {
  userId: string;
  userEmail: string;
  tier: SubscriptionTier;
  amountUSD: number;
  planName?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const secretKey = env.STRIPE_SECRET_KEY;
  const plan = getPlan(params.tier);
  const displayName = params.planName || plan.name;

  // Mock checkout is allowed only outside production. Production must use Stripe.
  if (!secretKey || secretKey === 'sk_test_sample') {
    if (env.NODE_ENV === 'production') {
      throw new Error('Stripe is not configured for production');
    }
    const sep = params.successUrl.includes('?') ? '&' : '?';
    const sessionId = `mock_cs_${params.tier}_${Date.now()}`;
    return {
      url: `${params.successUrl}${sep}session_id=${sessionId}`,
      sessionId,
    };
  }

  const formData = new URLSearchParams();
  formData.append('mode', 'subscription');
  formData.append('customer_email', params.userEmail);
  formData.append('client_reference_id', params.userId);
  formData.append('success_url', params.successUrl);
  formData.append('cancel_url', params.cancelUrl);
  formData.append('metadata[userId]', params.userId);
  formData.append('metadata[tier]', plan.id);
  formData.append('metadata[priceUSD]', plan.priceUSD.toString());
  formData.append('subscription_data[metadata][userId]', params.userId);
  formData.append('subscription_data[metadata][tier]', plan.id);
  formData.append('line_items[0][price_data][currency]', 'usd');
  formData.append('line_items[0][price_data][product_data][name]', `Plantinia ${displayName}`);
  formData.append('line_items[0][price_data][unit_amount]', Math.round(plan.priceUSD * 100).toString());
  formData.append('line_items[0][price_data][recurring][interval]', 'month');
  formData.append('line_items[0][quantity]', '1');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Stripe session creation failed: ${errorText}`);
  }

  const data = await res.json();
  if (!data.id || !data.url) {
    throw new Error('Stripe returned an invalid checkout session');
  }

  return {
    url: data.url,
    sessionId: data.id,
  };
}
