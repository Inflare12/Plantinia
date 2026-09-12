import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAIEngine } from '@/lib/ai';
import { checkAndDeductDiagnosisEntitlement } from '@/lib/payments/entitlements';
import { db } from '@/lib/db/adapter';

export async function POST(req: NextRequest) {
  let user: Awaited<ReturnType<typeof getSessionUser>> = null;
  let originalCredits: number | undefined;
  let deducted = false;

  try {
    user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { imageUrl } = await req.json();
    if (typeof imageUrl !== 'string' || !imageUrl || imageUrl.length > 4096) {
      return NextResponse.json({ error: 'A valid image URL is required' }, { status: 400 });
    }

    originalCredits = user.creditsRemaining;
    const entitlement = await checkAndDeductDiagnosisEntitlement(user, 'image');
    if (!entitlement.allowed) {
      return NextResponse.json({ error: entitlement.reason, remainingCredits: entitlement.remainingCredits }, { status: 403 });
    }
    deducted = entitlement.remainingCredits !== undefined;

    const identification = await getAIEngine().identifyPlant({ imageUrl });
    return NextResponse.json({ identification, remainingCredits: entitlement.remainingCredits });
  } catch (error: any) {
    if (user && deducted && originalCredits !== undefined) {
      try { await db.users.update(user.id, { creditsRemaining: originalCredits }); }
      catch (refundError) { console.error('Failed to refund identification credit:', refundError); }
    }
    console.error('Identification API error:', error);
    return NextResponse.json({ error: error.message || 'Plant identification failed' }, { status: 500 });
  }
}
