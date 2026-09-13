import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAIEngine } from '@/lib/ai';
import { checkAndDeductDiagnosisEntitlement } from '@/lib/payments/entitlements';
import { prisma } from '@/lib/db/prisma';

const MAX_MEDIA_URL = 12000000;

function validImage(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_MEDIA_URL) return false;
  if (value.startsWith('data:')) return /^data:image\/[a-z0-9.+-]+;base64,/i.test(value);
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

export async function POST(req: NextRequest) {
  let user: Awaited<ReturnType<typeof getSessionUser>> = null;
  let deducted = false;

  try {
    user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { imageUrl } = await req.json();
    if (!validImage(imageUrl)) return NextResponse.json({ error: 'A valid HTTPS image or base64 image is required' }, { status: 400 });

    const entitlement = await checkAndDeductDiagnosisEntitlement(user, 'image');
    if (!entitlement.allowed) return NextResponse.json({ error: entitlement.reason, remainingCredits: entitlement.remainingCredits }, { status: 403 });
    deducted = entitlement.remainingCredits !== undefined;

    const identification = await getAIEngine().identifyPlant({ imageUrl });
    return NextResponse.json({ identification, remainingCredits: entitlement.remainingCredits });
  } catch (error) {
    if (user && deducted) {
      try { await prisma.user.updateMany({ where: { id: user.id }, data: { creditsRemaining: { increment: 1 } } }); }
      catch (refundError) { console.error('Failed to refund identification credit:', refundError); }
    }
    console.error('Identification API error:', error);
    return NextResponse.json({ error: 'Plant identification failed. Please try again with a clearer image.' }, { status: 500 });
  }
}
