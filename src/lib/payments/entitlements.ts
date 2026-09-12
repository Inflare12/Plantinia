import { User } from '../db/schema';
import { db } from '../db/adapter';

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  remainingCredits?: number;
}

export async function checkAndDeductDiagnosisEntitlement(
  user: User,
  mediaType: 'image' | 'video' = 'image'
): Promise<EntitlementCheckResult> {
  // Farm & Pro tiers have unlimited diagnoses
  if (user.subscriptionTier === 'pro' || user.subscriptionTier === 'farm') {
    return { allowed: true };
  }

  // Free tier restrictions
  if (mediaType === 'video') {
    return {
      allowed: false,
      reason: 'AI Video Diagnosis is an exclusive Pro & Commercial tier feature. Upgrade to analyze plant videos.',
    };
  }

  if (user.creditsRemaining <= 0) {
    return {
      allowed: false,
      reason: 'You have used all 5 free monthly diagnosis credits. Upgrade to Pro for unlimited scans or wait until next month.',
      remainingCredits: 0,
    };
  }

  // Deduct 1 credit for Free tier
  const updatedCredits = user.creditsRemaining - 1;
  await db.users.update(user.id, { creditsRemaining: updatedCredits });

  return {
    allowed: true,
    remainingCredits: updatedCredits,
  };
}

export function canAccessChat(user: User): boolean {
  // Pro and Farm get 24/7 AI Doctor chat; Free gets 3 trial questions
  return true;
}

export function canAccessAdmin(user: User): boolean {
  return user.role === 'admin';
}
