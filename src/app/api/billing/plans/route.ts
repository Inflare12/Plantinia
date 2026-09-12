import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_TIER_ORDER, SubscriptionTier } from '@/lib/payments/types';
import { db } from '@/lib/db/adapter';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const plans = SUBSCRIPTION_TIER_ORDER.map((tier) => SUBSCRIPTION_PLANS[tier]);

    if (!user) {
      return NextResponse.json({
        plans,
        currentTier: 'free',
        creditsRemaining: 5,
        videoCreditsRemaining: 0,
        plantsCount: 0,
        invoices: [],
      });
    }

    const invoices = await db.invoices.listByUser(user.id);
    const userPlants = await db.plants.listByUser(user.id);

    return NextResponse.json({
      plans,
      currentTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      creditsRemaining: user.creditsRemaining,
      videoCreditsRemaining:
        user.videoCreditsRemaining ??
        (user.subscriptionTier === 'doctor'
          ? 10
          : user.subscriptionTier === 'pro' || user.subscriptionTier === 'farm'
          ? 9999
          : 0),
      plantsCount: userPlants.length,
      invoices,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

