import { User } from '../db/schema';
import { db } from '../db/adapter';
import { SUBSCRIPTION_PLANS, SubscriptionTier, getPlan } from './types';
import { prisma } from '../db/prisma';

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  remainingCredits?: number;
  remainingVideoCredits?: number;
}

function effectiveTier(user: User): SubscriptionTier {
  const tier = (user.subscriptionTier as SubscriptionTier) || 'free';
  if (tier === 'free') return 'free';

  // A paid tier is effective only while its paid period is still valid. Canceled
  // subscriptions may continue until period end; an expired one cannot grant access.
  if (!user.subscriptionCurrentPeriodEnd) return 'free';
  if (new Date(user.subscriptionCurrentPeriodEnd).getTime() <= Date.now()) return 'free';
  if (!['active', 'trialing', 'canceled'].includes(user.subscriptionStatus)) return 'free';
  return tier;
}

export async function checkAndDeductDiagnosisEntitlement(
  user: User,
  mediaType: 'image' | 'video' = 'image'
): Promise<EntitlementCheckResult> {
  const tier = effectiveTier(user);
  const plan = getPlan(tier);

  if (plan.creditsPerMonth === 'unlimited') return { allowed: true };

  if (mediaType === 'video') {
    if (plan.videoCreditsPerMonth === 0) {
      return {
        allowed: false,
        reason: `AI Video Diagnosis is exclusive to Plant Doctor (10 scans/mo), Pro, and Commercial plans. Upgrade from ${plan.name} to analyze plant videos.`,
      };
    }

    // Atomic decrement prevents two concurrent requests from spending the same credit.
    const result = await prisma.user.updateMany({
      where: { id: user.id, videoCreditsRemaining: { gt: 0 } },
      data: { videoCreditsRemaining: { decrement: 1 } },
    });

    if (result.count !== 1) {
      return {
        allowed: false,
        reason: `You have used all ${plan.videoCreditsPerMonth} monthly video scans included in ${plan.name}. Upgrade to Pro Plant Doctor for unlimited video diagnoses.`,
        remainingVideoCredits: 0,
      };
    }

    const updated = await db.users.findById(user.id);
    return { allowed: true, remainingVideoCredits: updated?.videoCreditsRemaining ?? Math.max(0, (user.videoCreditsRemaining ?? 1) - 1) };
  }

  const result = await prisma.user.updateMany({
    where: { id: user.id, creditsRemaining: { gt: 0 } },
    data: { creditsRemaining: { decrement: 1 } },
  });

  if (result.count !== 1) {
    let upgradeSuggestion = 'Upgrade to Plant Care (₹49) or Plant Doctor (₹139) for more scans.';
    if (tier === 'care') upgradeSuggestion = 'Upgrade to Plant Doctor (₹139) for 60 scans or Pro (₹399) for unlimited scans.';
    else if (tier === 'doctor') upgradeSuggestion = 'Upgrade to Pro Plant Doctor (₹399) for unlimited scans.';

    return {
      allowed: false,
      reason: `You have used all ${plan.creditsPerMonth} monthly AI diagnosis scans on the ${plan.name} plan. ${upgradeSuggestion}`,
      remainingCredits: 0,
    };
  }

  const updated = await db.users.findById(user.id);
  return { allowed: true, remainingCredits: updated?.creditsRemaining ?? Math.max(0, user.creditsRemaining - 1) };
}

export async function checkPlantTrackingEntitlement(user: User): Promise<EntitlementCheckResult> {
  const tier = effectiveTier(user);
  const plan = getPlan(tier);

  if (plan.maxTrackedPlants === 'unlimited') return { allowed: true };

  const existingPlants = await db.plants.listByUser(user.id);
  if (existingPlants.length >= plan.maxTrackedPlants) {
    let nextPlanAdvice = 'Plant Care (₹49/mo, up to 10 plants)';
    if (tier === 'care') nextPlanAdvice = 'Plant Doctor (₹139/mo, up to 30 plants)';
    else if (tier === 'doctor') nextPlanAdvice = 'Pro Plant Doctor (₹399/mo, unlimited plants)';

    return {
      allowed: false,
      reason: `You have reached your garden capacity limit of ${plan.maxTrackedPlants} plants for ${plan.name}. Upgrade to ${nextPlanAdvice} to track more specimens.`,
    };
  }

  return { allowed: true };
}

export function canAccessChat(user: User): { allowed: boolean; mode: 'basic' | 'advanced'; reason?: string } {
  const tier = effectiveTier(user);
  return { allowed: true, mode: tier === 'doctor' || tier === 'pro' || tier === 'farm' ? 'advanced' : 'basic' };
}

export function canExportPdfReport(user: User): boolean {
  const tier = effectiveTier(user);
  return tier === 'doctor' || tier === 'pro' || tier === 'farm';
}

export function canAccessAdmin(user: User): boolean {
  return user.role === 'admin';
}
