import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeline = await db.timeline.listByPlant(params.id);
    return NextResponse.json({ timeline });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plant = await db.plants.findById(params.id);
    if (!plant || plant.userId !== user.id) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    const body = await req.json();
    const { eventType, title, description, imageUrl } = body;

    const event = await db.timeline.create({
      plantId: plant.id,
      userId: user.id,
      eventType: eventType || 'note',
      title: title || 'Garden Update',
      description: description || '',
      imageUrl: imageUrl || undefined,
    });

    // If watering event, update plant lastWateredDate
    if (eventType === 'watering') {
      const now = new Date();
      const next = new Date(now.getTime() + plant.wateringFrequencyDays * 24 * 3600 * 1000);
      await db.plants.update(plant.id, {
        lastWateredDate: now.toISOString(),
        nextWateringDate: next.toISOString(),
      });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
