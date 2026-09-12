import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAIEngine } from '@/lib/ai';
import { checkAndDeductDiagnosisEntitlement } from '@/lib/payments/entitlements';
import { db } from '@/lib/db/adapter';

export async function POST(req: NextRequest) {
  let entitlementDeducted = false;
  let originalImageCredits: number | undefined;
  let originalVideoCredits: number | undefined;
  let currentUser: Awaited<ReturnType<typeof getSessionUser>> = null;

  try {
    currentUser = await getSessionUser(req);
    if (!currentUser) return NextResponse.json({ error: 'Please login or create a free account to diagnose plants' }, { status: 401 });

    const body = await req.json();
    const { mediaUrl, mediaType = 'image', plantId, plantSpeciesHint, notes } = body;
    if (!mediaUrl) return NextResponse.json({ error: 'Plant image or video media is required' }, { status: 400 });
    if (mediaType !== 'image' && mediaType !== 'video') return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    if (typeof mediaUrl !== 'string' || mediaUrl.length > 4096) return NextResponse.json({ error: 'Invalid media URL' }, { status: 400 });

    originalImageCredits = currentUser.creditsRemaining;
    originalVideoCredits = currentUser.videoCreditsRemaining;

    const entitlement = await checkAndDeductDiagnosisEntitlement(currentUser, mediaType);
    if (!entitlement.allowed) {
      return NextResponse.json({ error: entitlement.reason, remainingCredits: entitlement.remainingCredits, remainingVideoCredits: entitlement.remainingVideoCredits }, { status: 403 });
    }
    entitlementDeducted = mediaType === 'video'
      ? entitlement.remainingVideoCredits !== undefined
      : entitlement.remainingCredits !== undefined;

    const aiEngine = getAIEngine();
    const diagnosisResult = await aiEngine.diagnosePlant({ mediaUrl, mediaType, plantSpeciesHint, notes });

    let verifiedPlant: any = null;
    if (plantId) {
      const plant = await db.plants.findById(plantId);
      if (plant && (plant.userId === currentUser.id || currentUser.role === 'admin')) verifiedPlant = plant;
    }

    const newDiagnosis = await db.diagnoses.create({
      userId: currentUser.id,
      plantId: verifiedPlant ? verifiedPlant.id : undefined,
      mediaType,
      mediaUrl,
      identifiedSpecies: diagnosisResult.identifiedSpecies,
      diseaseName: diagnosisResult.diseaseName,
      pathogenType: diagnosisResult.pathogenType,
      confidence: diagnosisResult.confidence,
      severity: diagnosisResult.severity,
      symptoms: diagnosisResult.symptoms,
      causes: diagnosisResult.causes,
      prognosis: diagnosisResult.prognosis,
      treatmentSteps: diagnosisResult.treatmentSteps,
      organicRemedies: diagnosisResult.organicRemedies,
      chemicalRemedies: diagnosisResult.chemicalRemedies,
      preventativeMeasures: diagnosisResult.preventativeMeasures,
      boundingBoxes: diagnosisResult.boundingBoxes,
      aiProviderUsed: diagnosisResult.aiProviderUsed,
      adminReviewed: false,
    });

    if (verifiedPlant) {
      const newStatus = diagnosisResult.severity === 'critical'
        ? 'critical'
        : diagnosisResult.severity === 'severe' || diagnosisResult.severity === 'moderate'
          ? 'warning'
          : 'healthy';

      await db.plants.update(verifiedPlant.id, { healthStatus: newStatus });
      await db.timeline.create({
        plantId: verifiedPlant.id,
        userId: currentUser.id,
        eventType: 'diagnosis',
        title: `AI Diagnosis: ${diagnosisResult.diseaseName}`,
        description: `Severity: ${diagnosisResult.severity.toUpperCase()} (${diagnosisResult.confidence}% confidence). ${diagnosisResult.prognosis}`,
        imageUrl: mediaUrl,
      });

      for (const step of diagnosisResult.treatmentSteps) {
        await db.careTasks.create({
          userId: currentUser.id,
          plantId: verifiedPlant.id,
          plantName: verifiedPlant.name,
          title: `${step.title}: ${step.instruction.substring(0, 70)}...`,
          category: 'spray',
          dueDate: new Date().toISOString().split('T')[0],
          isCompleted: false,
          notes: step.frequency,
        });
      }
    }

    return NextResponse.json({ diagnosis: newDiagnosis, remainingCredits: entitlement.remainingCredits, remainingVideoCredits: entitlement.remainingVideoCredits });
  } catch (error: any) {
    // A failed AI/database operation must not permanently consume a user's scan credit.
    if (currentUser && entitlementDeducted) {
      try {
        if (originalImageCredits !== undefined && originalImageCredits !== currentUser.creditsRemaining) {
          await db.users.update(currentUser.id, { creditsRemaining: originalImageCredits });
        }
        if (originalVideoCredits !== undefined && originalVideoCredits !== currentUser.videoCreditsRemaining) {
          await db.users.update(currentUser.id, { videoCreditsRemaining: originalVideoCredits });
        }
      } catch (refundError) {
        console.error('Failed to refund diagnosis entitlement:', refundError);
      }
    }
    console.error('Diagnosis API error:', error);
    return NextResponse.json({ error: error.message || 'Diagnosis failed. Please try again with a clearer photo.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const diagnoses = await db.diagnoses.listByUser(user.id);
    return NextResponse.json({ diagnoses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
