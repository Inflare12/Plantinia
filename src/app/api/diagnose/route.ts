import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAIEngine } from '@/lib/ai';
import { checkAndDeductDiagnosisEntitlement } from '@/lib/payments/entitlements';
import { db } from '@/lib/db/adapter';
import { prisma } from '@/lib/db/prisma';

const MAX_TEXT_FIELD = 1000;
const MAX_MEDIA_URL = 12000000;

function validMediaUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_MEDIA_URL) return false;
  if (value.startsWith('data:image/') || value.startsWith('data:video/')) return /^data:(image|video)\/[a-z0-9.+-]+;base64,/i.test(value);
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let currentUser: Awaited<ReturnType<typeof getSessionUser>> = null;
  let mediaType: 'image' | 'video' = 'image';
  let deducted = false;
  let diagnosisCreated = false;

  try {
    currentUser = await getSessionUser(req);
    if (!currentUser) return NextResponse.json({ error: 'Please login or create a free account to diagnose plants' }, { status: 401 });

    const body = await req.json();
    const { mediaUrl, plantId } = body;
    mediaType = body.mediaType || 'image';
    const plantSpeciesHint = typeof body.plantSpeciesHint === 'string' ? body.plantSpeciesHint.trim().slice(0, MAX_TEXT_FIELD) : undefined;
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, MAX_TEXT_FIELD) : undefined;

    if (!validMediaUrl(mediaUrl)) return NextResponse.json({ error: 'Invalid media. Use an HTTPS media URL or a valid base64 image/video.' }, { status: 400 });
    if (mediaType !== 'image' && mediaType !== 'video') return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    if (plantId !== undefined && (typeof plantId !== 'string' || plantId.length > 100)) return NextResponse.json({ error: 'Invalid plant ID' }, { status: 400 });

    let verifiedPlant: any = null;
    if (plantId) {
      const plant = await db.plants.findById(plantId);
      if (!plant || (plant.userId !== currentUser.id && currentUser.role !== 'admin')) {
        return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
      }
      verifiedPlant = plant;
    }

    const entitlement = await checkAndDeductDiagnosisEntitlement(currentUser, mediaType);
    if (!entitlement.allowed) {
      return NextResponse.json({ error: entitlement.reason, remainingCredits: entitlement.remainingCredits, remainingVideoCredits: entitlement.remainingVideoCredits }, { status: 403 });
    }
    deducted = mediaType === 'video' ? entitlement.remainingVideoCredits !== undefined : entitlement.remainingCredits !== undefined;

    const diagnosisResult = await getAIEngine().diagnosePlant({ mediaUrl, mediaType, plantSpeciesHint, notes });

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
    diagnosisCreated = true;

    if (verifiedPlant) {
      const newStatus = diagnosisResult.severity === 'critical' ? 'critical' : diagnosisResult.severity === 'severe' || diagnosisResult.severity === 'moderate' ? 'warning' : 'healthy';
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
          title: `${step.title}: ${step.instruction.substring(0, 70)}${step.instruction.length > 70 ? '...' : ''}`,
          category: 'spray',
          dueDate: new Date().toISOString().split('T')[0],
          isCompleted: false,
          notes: step.frequency,
        });
      }
    }

    const refreshedUser = await db.users.findById(currentUser.id);
    return NextResponse.json({ diagnosis: newDiagnosis, remainingCredits: refreshedUser?.creditsRemaining, remainingVideoCredits: refreshedUser?.videoCreditsRemaining });
  } catch (error) {
    // Only refund if no diagnosis was persisted. Increment rather than restoring a stale
    // snapshot so concurrent requests cannot overwrite each other's newer credit balance.
    if (currentUser && deducted && !diagnosisCreated) {
      try {
        if (mediaType === 'video') {
          await prisma.user.updateMany({ where: { id: currentUser.id }, data: { videoCreditsRemaining: { increment: 1 } } });
        } else {
          await prisma.user.updateMany({ where: { id: currentUser.id }, data: { creditsRemaining: { increment: 1 } } });
        }
      } catch (refundError) {
        console.error('Failed to refund diagnosis entitlement:', refundError);
      }
    }
    console.error('Diagnosis API error:', error);
    return NextResponse.json({ error: 'Diagnosis failed. Please try again with a clearer photo or video.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const diagnoses = await db.diagnoses.listByUser(user.id);
    return NextResponse.json({ diagnoses });
  } catch (error) {
    console.error('Diagnosis history error:', error);
    return NextResponse.json({ error: 'Unable to load diagnosis history' }, { status: 500 });
  }
}
