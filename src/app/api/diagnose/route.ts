import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAIEngine } from '@/lib/ai';
import { checkAndDeductDiagnosisEntitlement } from '@/lib/payments/entitlements';
import { db } from '@/lib/db/adapter';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Please login or create a free account to diagnose plants' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { mediaUrl, mediaType = 'image', plantId, plantSpeciesHint, notes } = body;

    if (!mediaUrl) {
      return NextResponse.json({ error: 'Plant image or video media is required' }, { status: 400 });
    }

    // Check user plan entitlements & deduct credits if on Free tier
    const entitlement = await checkAndDeductDiagnosisEntitlement(user, mediaType);
    if (!entitlement.allowed) {
      return NextResponse.json(
        { error: entitlement.reason, remainingCredits: entitlement.remainingCredits },
        { status: 403 }
      );
    }

    // Run AI diagnosis through configured modular provider (external to Vercel compute)
    const aiEngine = getAIEngine();
    const diagnosisResult = await aiEngine.diagnosePlant({
      mediaUrl,
      mediaType,
      plantSpeciesHint,
      notes,
    });

    // Verify plant ownership if plantId provided
    let verifiedPlant: any = null;
    if (plantId) {
      const plant = await db.plants.findById(plantId);
      if (plant && (plant.userId === user.id || user.role === 'admin')) {
        verifiedPlant = plant;
      }
    }

    // Save diagnosis record to database
    const newDiagnosis = await db.diagnoses.create({
      userId: user.id,
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

    // If linked to a verified garden plant, update plant health and add timeline entry
    if (verifiedPlant) {
      const plant = verifiedPlant;
      const newStatus =
          diagnosisResult.severity === 'critical'
            ? 'critical'
            : diagnosisResult.severity === 'severe' || diagnosisResult.severity === 'moderate'
            ? 'warning'
            : 'healthy';

        await db.plants.update(plant.id, { healthStatus: newStatus });

        await db.timeline.create({
          plantId: plant.id,
          userId: user.id,
          eventType: 'diagnosis',
          title: `AI Diagnosis: ${diagnosisResult.diseaseName}`,
          description: `Severity: ${diagnosisResult.severity.toUpperCase()} (${diagnosisResult.confidence}% confidence). ${diagnosisResult.prognosis}`,
          imageUrl: mediaUrl,
        });

        // Add treatment step tasks to the care plan checklist
        for (const step of diagnosisResult.treatmentSteps) {
          await db.careTasks.create({
            userId: user.id,
            plantId: plant.id,
            plantName: plant.name,
            title: `${step.title}: ${step.instruction.substring(0, 70)}...`,
            category: 'spray',
            dueDate: new Date().toISOString().split('T')[0],
            isCompleted: false,
            notes: step.frequency,
          });
        }
      }
    }

    return NextResponse.json({
      diagnosis: newDiagnosis,
      remainingCredits: entitlement.remainingCredits,
    });
  } catch (error: any) {
    console.error('Diagnosis API error:', error);
    return NextResponse.json(
      { error: error.message || 'Diagnosis failed. Please try again with a clearer photo.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const diagnoses = await db.diagnoses.listByUser(user.id);
    return NextResponse.json({ diagnoses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
