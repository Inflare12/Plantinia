import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    // In production, verify rawBody with STRIPE_WEBHOOK_SECRET
    console.log('[Stripe Webhook Received]', { length: rawBody.length, hasSignature: !!signature });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
