import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getEffectiveSubscriptionTier } from '@/lib/payments/entitlements';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const effectiveTier = getEffectiveSubscriptionTier(user);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionTier: effectiveTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
        creditsRemaining: user.creditsRemaining,
        videoCreditsRemaining: user.videoCreditsRemaining,
        isEmailVerified: user.isEmailVerified,
        avatarUrl: user.avatarUrl,
        hasApiKey: Boolean(user.apiKey),
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Unable to load account' }, { status: 500 });
  }
}
