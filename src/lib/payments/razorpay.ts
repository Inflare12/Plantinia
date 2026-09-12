import { env } from '../env';

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export async function createRazorpayOrder(
  amountInINR: number,
  receiptId: string,
  notes: Record<string, string> = {}
): Promise<RazorpayOrderResponse> {
  const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'rzp_test_sample') {
    // Return mock order for seamless sandbox testing
    return {
      id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: amountInINR * 100, // paise
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
    };
  }

  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: Math.round(amountInINR * 100), // in paise
      currency: 'INR',
      receipt: receiptId,
      notes,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Razorpay Order creation failed: ${errorText}`);
  }

  return await res.json();
}

export async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keySecret || keySecret === 'sample_secret') {
    // Sandbox auto-pass for test mock orders
    return true;
  }

  const body = `${orderId}|${paymentId}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(keySecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const hex = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hex === signature;
}
