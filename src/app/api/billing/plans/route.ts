import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { SUBSCRIPTION_PLANS } from '@/lib/payments/types';
import { db } from '@/lib/db/adapter';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const plans = Object.values(SUBSCRIPTION_PLANS);

    if (!user) {
      return NextResponse.json({
        plans,
        currentTier: 'free',
        creditsRemaining: 5,
        invoices: [],
      });
    }

    const invoices = await db.invoices.listByUser(user.id);

    return NextResponse.json({
      plans,
      currentTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      creditsRemaining: user.creditsRemaining,
      invoices,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
