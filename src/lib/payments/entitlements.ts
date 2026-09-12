import { User } from '../db/schema';
import { db } from '../db/adapter';
import { SUBSCRIPTION_PLANS, SubscriptionTier, getPlan } from './types';

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  remainingCredits?: number;
  remainingVideoCredits?: number;
}

export async function checkAndDeductDiagnosisEntitlement(
  user: User,
  mediaType: 'image' | 'video' = 'image'
): Promise<EntitlementCheckResult> {
  const tier: SubscriptionTier = (user.subscriptionTier as SubscriptionTier) || 'free';
  const plan = getPlan(tier);

  // Pro & Farm have unlimited image & video diagnoses
  if (plan.creditsPerMonth === 'unlimited') {
    return { allowed: true };
  }

  // Video Diagnosis Quota Checks
  if (mediaType === 'video') {
    if (plan.videoCreditsPerMonth === 0) {
      return {
        allowed: false,
        reason: `AI Video Diagnosis is exclusive to Plant Doctor (10 scans/mo), Pro, and Commercial plans. Upgrade from ${plan.name} to analyze plant videos.`,
      };
    }

    // Plant Doctor has 10 video scans per month
    const videoCredits = user.videoCreditsRemaining ?? (typeof plan.videoCreditsPerMonth === 'number' ? plan.videoCreditsPerMonth : 0);
    if (videoCredits <= 0) {
      return {
        allowed: false,
        reason: `You have used all ${plan.videoCreditsPerMonth} monthly video scans included in ${plan.name}. Upgrade to Pro Plant Doctor for unlimited video diagnoses.`,
        remainingVideoCredits: 0,
      };
    }

    const updatedVideoCredits = videoCredits - 1;
    await db.users.update(user.id, { videoCreditsRemaining: updatedVideoCredits });

    return {
      allowed: true,
      remainingVideoCredits: updatedVideoCredits,
    };
  }

  // Leaf / Image Diagnosis Quota Checks
  if (user.creditsRemaining <= 0) {
    let upgradeSuggestion = 'Upgrade to Plant Care (₹49) or Plant Doctor (₹139) for more scans.';
    if (tier === 'care') {
      upgradeSuggestion = 'Upgrade to Plant Doctor (₹139) for 60 scans or Pro (₹399) for unlimited scans.';
    } else if (tier === 'doctor') {
      upgradeSuggestion = 'Upgrade to Pro Plant Doctor (₹399) for unlimited scans.';
    }

    return {
      allowed: false,
      reason: `You have used all ${plan.creditsPerMonth} monthly AI diagnosis scans on the ${plan.name} plan. ${upgradeSuggestion}`,
      remainingCredits: 0,
    };
  }

  // Deduct 1 credit for metered tiers (free, care, doctor)
  const updatedCredits = user.creditsRemaining - 1;
  await db.users.update(user.id, { creditsRemaining: updatedCredits });

  return {
    allowed: true,
    remainingCredits: updatedCredits,
  };
}

export async function checkPlantTrackingEntitlement(user: User): Promise<EntitlementCheckResult> {
  const tier: SubscriptionTier = (user.subscriptionTier as SubscriptionTier) || 'free';
  const plan = getPlan(tier);

  if (plan.maxTrackedPlants === 'unlimited') {
    return { allowed: true };
  }

  const existingPlants = await db.plants.listByUser(user.id);
  if (existingPlants.length >= plan.maxTrackedPlants) {
    let nextPlanAdvice = 'Plant Care (₹49/mo, up to 10 plants)';
    if (tier === 'care') {
      nextPlanAdvice = 'Plant Doctor (₹139/mo, up to 30 plants)';
    } else if (tier === 'doctor') {
      nextPlanAdvice = 'Pro Plant Doctor (₹399/mo, unlimited plants)';
    }

    return {
      allowed: false,
      reason: `You have reached your garden capacity limit of ${plan.maxTrackedPlants} plants for ${plan.name}. Upgrade to ${nextPlanAdvice} to track more specimens.`,
    };
  }

  return { allowed: true };
}

export function canAccessChat(user: User): { allowed: boolean; mode: 'basic' | 'advanced'; reason?: string } {
  const tier: SubscriptionTier = (user.subscriptionTier as SubscriptionTier) || 'free';
  if (tier === 'free') {
    return {
      allowed: true,
      mode: 'basic',
    };
  }
  if (tier === 'care') {
    return {
      allowed: true,
      mode: 'basic',
    };
  }
  return {
    allowed: true,
    mode: 'advanced',
  };
}

export function canExportPdfReport(user: User): boolean {
  const tier: SubscriptionTier = (user.subscriptionTier as SubscriptionTier) || 'free';
  return tier === 'doctor' || tier === 'pro' || tier === 'farm';
}

export function canAccessAdmin(user: User): boolean {
  return user.role === 'admin';
}

