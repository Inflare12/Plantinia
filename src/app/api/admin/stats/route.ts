import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';
import { getPlan } from '@/lib/payments/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const allUsers = await db.users.listAll();
    const allDiagnoses = await db.diagnoses.listAll();
    const allModels = await db.models.listAll();

    const paidUsers = allUsers.filter((u) => u.subscriptionTier !== 'free' && u.subscriptionStatus === 'active');
    const estimatedMRR = paidUsers.reduce((sum, u) => sum + getPlan(u.subscriptionTier).priceINR, 0);

    const accurateCount = allDiagnoses.filter((d) => d.adminAccuracyFeedback === 'accurate').length;
    const inaccurateCount = allDiagnoses.filter((d) => d.adminAccuracyFeedback === 'inaccurate').length;
    const totalReviewed = accurateCount + inaccurateCount;
    const accuracyRate = totalReviewed > 0 ? Number(((accurateCount / totalReviewed) * 100).toFixed(1)) : null;

    const activeModel = allModels.find((m) => m.status === 'active');

    return NextResponse.json({
      stats: {
        totalScans: allDiagnoses.length,
        totalUsers: allUsers.length,
        activeSubscribers: paidUsers.length,
        monthlyRecurringRevenueINR: estimatedMRR,
        overallAccuracyRate: accuracyRate === null ? null : `${accuracyRate}%`,
        reviewedDiagnoses: totalReviewed,
        activeModel: activeModel?.name || null,
      },
      recentDiagnoses: allDiagnoses.slice(0, 10),
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
