import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAIEngine } from '@/lib/ai';
import { db } from '@/lib/db/adapter';
import { canAccessChat } from '@/lib/payments/entitlements';
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit';

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONTEXT_LENGTH = 16000;

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const chatAccess = canAccessChat(user);
    if (!chatAccess.allowed) return NextResponse.json({ error: chatAccess.reason || 'Chat is not available on your plan' }, { status: 403 });

    const ip = getClientIp(req);
    const rate = checkRateLimit(`chat:${user.id}:${ip}`, 30, 60_000);
    if (!rate.allowed) return NextResponse.json({ error: 'Too many chat requests. Please try again shortly.' }, { status: 429 });

    const body = await req.json();
    const { messages, plantId } = body;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: `Messages must contain 1-${MAX_MESSAGES} items` }, { status: 400 });
    }

    const validMessages = messages.every(
      (message: any) =>
        message &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0 &&
        message.content.length <= MAX_MESSAGE_LENGTH
    );
    if (!validMessages) return NextResponse.json({ error: 'Each message must have a valid role and be 1-4000 characters' }, { status: 400 });

    const totalContextLength = messages.reduce((sum: number, message: any) => sum + message.content.length, 0);
    if (totalContextLength > MAX_CONTEXT_LENGTH) {
      return NextResponse.json({ error: 'Conversation context is too large. Start a new chat or shorten the messages.' }, { status: 400 });
    }

    if (plantId !== undefined && (typeof plantId !== 'string' || plantId.length > 100)) {
      return NextResponse.json({ error: 'Invalid plant ID' }, { status: 400 });
    }

    let plantContext: any = undefined;
    if (plantId) {
      const plant = await db.plants.findById(plantId);
      if (!plant || plant.userId !== user.id) {
        return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
      }

      const diagnoses = await db.diagnoses.listByPlant(plant.id);
      plantContext = {
        name: plant.name,
        species: plant.species,
        healthStatus: plant.healthStatus,
        recentDiagnosis: diagnoses[0]?.diseaseName,
      };
    }

    const aiEngine = getAIEngine();
    const chatResult = await aiEngine.chatWithDoctor({ messages, plantContext });

    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg.role === 'user') {
      await db.chatMessages.create({ userId: user.id, plantId: plantId || undefined, role: 'user', content: lastUserMsg.content.trim() });
    }

    await db.chatMessages.create({ userId: user.id, plantId: plantId || undefined, role: 'assistant', content: chatResult.response });

    return NextResponse.json({
      response: chatResult.response,
      suggestedFollowUps: chatResult.suggestedFollowUps,
      aiProviderUsed: chatResult.aiProviderUsed,
      chatMode: chatAccess.mode,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Unable to process chat request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const plantId = req.nextUrl.searchParams.get('plantId') || undefined;
    if (plantId) {
      const plant = await db.plants.findById(plantId);
      if (!plant || plant.userId !== user.id) return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    const history = await db.chatMessages.listByUser(user.id, plantId);
    return NextResponse.json({ messages: history });
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json({ error: 'Unable to load chat history' }, { status: 500 });
  }
}
