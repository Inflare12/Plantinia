import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';

const eventSchema = z.object({
  eventType: z.enum(['diagnosis', 'watering', 'fertilizing', 'pruning', 'repotting', 'note', 'photo']).default('note'),
  title: z.string().trim().min(1).max(200).default('Garden Update'),
  description: z.string().trim().max(4000).default(''),
  imageUrl: z.string().url().max(2000).refine((v) => v.startsWith('https://'), 'Image must use HTTPS').optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const plant = await db.plants.findById(id);
    if (!plant || (plant.userId !== user.id && user.role !== 'admin')) return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    return NextResponse.json({ timeline: await db.timeline.listByPlant(id) });
  } catch (error) {
    console.error('Timeline GET error:', error);
    return NextResponse.json({ error: 'Unable to load timeline' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const plant = await db.plants.findById(id);
    if (!plant || plant.userId !== user.id) return NextResponse.json({ error: 'Plant not found' }, { status: 404 });

    const parsed = eventSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid timeline event', details: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    const event = await db.timeline.create({ plantId: plant.id, userId: user.id, eventType: data.eventType, title: data.title, description: data.description, imageUrl: data.imageUrl });

    if (data.eventType === 'watering') {
      const now = new Date();
      const next = new Date(now.getTime() + plant.wateringFrequencyDays * 24 * 3600 * 1000);
      await db.plants.update(plant.id, { lastWateredDate: now.toISOString(), nextWateringDate: next.toISOString() });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Timeline POST error:', error);
    return NextResponse.json({ error: 'Unable to create timeline event' }, { status: 500 });
  }
}
