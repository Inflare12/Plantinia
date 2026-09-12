import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // In production, verify rawBody with RAZORPAY_WEBHOOK_SECRET
    console.log('[Razorpay Webhook Received]', { length: rawBody.length, hasSignature: !!signature });

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
