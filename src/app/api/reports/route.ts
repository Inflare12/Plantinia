import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plants = await db.plants.listByUser(user.id);
    const diagnoses = await db.diagnoses.listByUser(user.id);
    const careTasks = await db.careTasks.listByUser(user.id);

    const healthyCount = plants.filter((p) => p.healthStatus === 'healthy').length;
    const warningCount = plants.filter((p) => p.healthStatus === 'warning').length;
    const criticalCount = plants.filter((p) => p.healthStatus === 'critical').length;
    const overallScore = plants.length > 0 ? Math.round((healthyCount / plants.length) * 100) : 100;

    const report = {
      reportId: `REP-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      owner: {
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
      },
      gardenSummary: {
        totalPlants: plants.length,
        healthScorePercentage: overallScore,
        statusCounts: {
          healthy: healthyCount,
          attentionRequired: warningCount,
          criticalIntervention: criticalCount,
        },
      },
      plants: plants.map((p) => ({
        id: p.id,
        name: p.name,
        species: p.species,
        location: p.location,
        healthStatus: p.healthStatus,
        recentDiagnoses: diagnoses
          .filter((d) => d.plantId === p.id)
          .slice(0, 3)
          .map((d) => ({
            disease: d.diseaseName,
            confidence: `${d.confidence}%`,
            severity: d.severity,
            date: d.createdAt,
          })),
      })),
      actionableProtocols: diagnoses.slice(0, 5).map((d) => ({
        disease: d.diseaseName,
        organicWhatToMake: d.organicRemedies,
        chemicalWhatToBuy: d.chemicalRemedies,
        preventative: d.preventativeMeasures,
      })),
    };

    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
