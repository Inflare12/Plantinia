import { env } from '../env';

export async function createStripeCheckoutSession(params: {
  userId: string;
  userEmail: string;
  tier: 'pro' | 'farm';
  amountUSD: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const secretKey = env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey === 'sk_test_sample') {
    // Return mock session URL for sandbox testing
    return {
      url: `${params.successUrl}?session_id=mock_cs_${Date.now()}`,
      sessionId: `mock_cs_${Date.now()}`,
    };
  }

  const formData = new URLSearchParams();
  formData.append('mode', 'subscription');
  formData.append('customer_email', params.userEmail);
  formData.append('client_reference_id', params.userId);
  formData.append('success_url', params.successUrl);
  formData.append('cancel_url', params.cancelUrl);
  formData.append('line_items[0][price_data][currency]', 'usd');
  formData.append('line_items[0][price_data][product_data][name]', `Plantinia ${params.tier.toUpperCase()} Plan`);
  formData.append('line_items[0][price_data][unit_amount]', Math.round(params.amountUSD * 100).toString());
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
  return {
    url: data.url,
    sessionId: data.id,
  };
}
