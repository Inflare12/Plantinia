import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const plants = await db.plants.listByUser(user.id);
    const diagnoses = await db.diagnoses.listByUser(user.id);
    const careTasks = await db.careTasks.listByUser(user.id);

    const healthyCount = plants.filter((p) => p.healthStatus === 'healthy').length;
    const warningCount = plants.filter((p) => p.healthStatus === 'warning' || p.healthStatus === 'treating').length;
    const criticalCount = plants.filter((p) => p.healthStatus === 'critical').length;
    const overallScore = plants.length > 0 ? Math.round((healthyCount / plants.length) * 100) : null;

    const standaloneScans = diagnoses.filter((d) => !d.plantId);

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
        message: plants.length === 0 ? 'No plants are currently tracked in your garden.' : undefined,
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
      standaloneScans: standaloneScans.slice(0, 20).map((d) => ({
        id: d.id,
        species: d.identifiedSpecies,
        disease: d.diseaseName,
        confidence: d.confidence,
        severity: d.severity,
        mediaType: d.mediaType,
        date: d.createdAt,
      })),
      actionableProtocols: diagnoses.slice(0, 5).map((d) => ({
        diagnosisId: d.id,
        disease: d.diseaseName,
        organicWhatToMake: d.organicRemedies,
        chemicalWhatToBuy: d.chemicalRemedies,
        preventative: d.preventativeMeasures,
      })),
      careTasks: careTasks.slice(0, 20),
    };

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: error.message || 'Unable to generate report' }, { status: 500 });
  }
}
