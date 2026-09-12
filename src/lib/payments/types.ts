export type SubscriptionTier = 'free' | 'pro' | 'farm';

export interface PlanPricing {
  id: SubscriptionTier;
  name: string;
  badge?: string;
  priceINR: number;
  priceUSD: number;
  period: 'month' | 'year';
  description: string;
  creditsPerMonth: number | 'unlimited';
  features: string[];
  razorpayPlanId?: string;
  stripePriceId?: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, PlanPricing> = {
  free: {
    id: 'free',
    name: 'Starter Gardener',
    priceINR: 0,
    priceUSD: 0,
    period: 'month',
    description: 'Essential AI diagnosis for home plant lovers.',
    creditsPerMonth: 5,
    features: [
      '5 AI plant disease scans / month',
      'Basic treatment protocols & home recipes',
      'Track up to 4 garden plants',
      'Access to public disease library',
      'Basic watering schedule reminders',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Plant Doctor',
    badge: 'Most Popular',
    priceINR: 399,
    priceUSD: 4.99,
    period: 'month',
    description: 'Comprehensive health monitoring & 24/7 AI agronomist doctor.',
    creditsPerMonth: 'unlimited',
    features: [
      'Unlimited AI image & video diagnoses',
      '24/7 Dr. Flora AI Doctor interactive chat',
      'Track unlimited indoor & outdoor plants',
      'Complete "What to Buy & Make" chemical & organic schedules',
      'Microclimate weather alerts & frost warnings',
      'Printable nursery health reports (PDF)',
      'Priority inference speed (<1.5s)',
    ],
  },
  farm: {
    id: 'farm',
    name: 'Commercial & Nursery',
    badge: 'Enterprise',
    priceINR: 1999,
    priceUSD: 24.99,
    period: 'month',
    description: 'For greenhouse managers, agronomists, and commercial nurseries.',
    creditsPerMonth: 'unlimited',
    features: [
      'All Pro Plan features included',
      'Multi-acre plot and nursery batch scanning',
      'REST API Access Keys for automated scanning',
      'Dataset curation & custom model training center',
      'Download annotated COCO / YOLO datasets',
      'Dedicated agronomist support escalation',
      'Team multi-seat collaboration',
    ],
  },
};
