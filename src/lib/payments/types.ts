export type SubscriptionTier = 'free' | 'care' | 'doctor' | 'pro' | 'farm';

export interface PlanPricing {
  id: SubscriptionTier; name: string; badge?: string; priceINR: number; priceUSD: number; period: 'month' | 'forever'; description: string; ctaText: string;
  creditsPerMonth: number | 'unlimited'; videoCreditsPerMonth: number | 'unlimited'; maxTrackedPlants: number | 'unlimited'; features: string[]; razorpayPlanId?: string; stripePriceId?: string;
}

export const SUBSCRIPTION_TIER_ORDER: SubscriptionTier[] = ['free', 'care', 'doctor', 'pro', 'farm'];

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, PlanPricing> = {
  free: { id: 'free', name: 'Starter Gardener', priceINR: 0, priceUSD: 0, period: 'forever', description: 'Essential diagnosis for houseplant hobbyists.', ctaText: 'Get Started Free', creditsPerMonth: 5, videoCreditsPerMonth: 0, maxTrackedPlants: 4, features: ['5 AI leaf scans every month', 'Basic organic & home recipes', 'Track up to 4 plants', 'Plant disease encyclopedia'] },
  care: { id: 'care', name: 'Plant Care', badge: 'Affordable Care', priceINR: 49, priceUSD: 0, period: 'month', description: 'Everyday AI-powered care for growing plant collections.', ctaText: 'Start Plant Care', creditsPerMonth: 20, videoCreditsPerMonth: 0, maxTrackedPlants: 10, features: ['20 AI leaf scans every month', 'Basic disease & pest identification', 'Basic AI plant-care chat', 'Track up to 10 plants', 'Organic & home remedies', 'Plant disease encyclopedia', 'Basic weather-aware recommendations'] },
  doctor: { id: 'doctor', name: 'Plant Doctor', badge: 'Best Value', priceINR: 139, priceUSD: 0, period: 'month', description: 'Advanced diagnosis and care for serious plant enthusiasts.', ctaText: 'Become a Plant Doctor', creditsPerMonth: 60, videoCreditsPerMonth: 10, maxTrackedPlants: 30, features: ['60 AI leaf scans every month', '10 AI video scans every month', 'Advanced Dr. Flora AI Doctor chat', 'Track up to 30 plants', 'Detailed AI diagnosis reports', 'Weather & microclimate insights', 'Care plans and reminders', 'Plant disease & pest encyclopedia', 'Printable PDF health reports'] },
  pro: { id: 'pro', name: 'Pro Plant Doctor', badge: 'Most Popular', priceINR: 399, priceUSD: 4.99, period: 'month', description: 'Unlimited AI diagnoses and 24/7 doctor chat.', ctaText: 'Upgrade to Pro', creditsPerMonth: 'unlimited', videoCreditsPerMonth: 'unlimited', maxTrackedPlants: 'unlimited', features: ['Unlimited AI leaf & video scans', '24/7 Dr. Flora AI Doctor chat', 'Unlimited plant collection tracking', 'Microclimate weather & frost warnings', 'Export printable health reports (PDF)'] },
  farm: { id: 'farm', name: 'Commercial Nursery', badge: 'Commercial', priceINR: 1999, priceUSD: 0, period: 'month', description: 'For greenhouses, nurseries, and agronomists.', ctaText: 'Choose Commercial', creditsPerMonth: 'unlimited', videoCreditsPerMonth: 'unlimited', maxTrackedPlants: 'unlimited', features: ['Everything in Pro included', 'REST API Access Keys for sensors', 'Multi-acre batch scanning & plots', 'Download annotated COCO / YOLO data'] },
};

export function getPlan(tier: string | undefined): PlanPricing { if (!tier || !(tier in SUBSCRIPTION_PLANS)) return SUBSCRIPTION_PLANS.free; return SUBSCRIPTION_PLANS[tier as SubscriptionTier]; }
