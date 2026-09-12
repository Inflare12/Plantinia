import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAIEngine } from '@/lib/ai';
import { db } from '@/lib/db/adapter';
import { canAccessChat } from '@/lib/payments/entitlements';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatAccess = canAccessChat(user);

    const { messages, plantId } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    let plantContext: any = undefined;
    if (plantId) {
      const plant = await db.plants.findById(plantId);
      if (plant) {
        const diagnoses = await db.diagnoses.listByPlant(plant.id);
        plantContext = {
          name: plant.name,
          species: plant.species,
          healthStatus: plant.healthStatus,
          recentDiagnosis: diagnoses[0]?.diseaseName,
        };
      }
    }

    const aiEngine = getAIEngine();
    const chatResult = await aiEngine.chatWithDoctor({
      messages,
      plantContext,
    });

    // Persist messages if user is logged in
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg && lastUserMsg.role === 'user') {
      await db.chatMessages.create({
        userId: user.id,
        plantId: plantId || undefined,
        role: 'user',
        content: lastUserMsg.content,
      });
    }

    await db.chatMessages.create({
      userId: user.id,
      plantId: plantId || undefined,
      role: 'assistant',
      content: chatResult.response,
    });

    return NextResponse.json({
      response: chatResult.response,
      suggestedFollowUps: chatResult.suggestedFollowUps,
      aiProviderUsed: chatResult.aiProviderUsed,
      chatMode: chatAccess.mode,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plantId = req.nextUrl.searchParams.get('plantId') || undefined;
    const history = await db.chatMessages.listByUser(user.id, plantId);
    return NextResponse.json({ messages: history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
