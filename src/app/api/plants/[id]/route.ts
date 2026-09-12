import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plant = await db.plants.findById(params.id);
    if (!plant || (plant.userId !== user.id && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    const diagnoses = await db.diagnoses.listByPlant(plant.id);
    const timeline = await db.timeline.listByPlant(plant.id);

    return NextResponse.json({ plant, diagnoses, timeline });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plant = await db.plants.findById(params.id);
    if (!plant || (plant.userId !== user.id && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    const body = await req.json();
    const allowedFields = [
      'name',
      'species',
      'commonName',
      'imageUrl',
      'location',
      'healthStatus',
      'sunlightNeeds',
      'wateringFrequencyDays',
      'lastWateredDate',
      'nextWateringDate',
      'notes',
    ];
    const safeUpdates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        safeUpdates[key] = body[key];
      }
    }

    const updated = await db.plants.update(params.id, safeUpdates);

    return NextResponse.json({ plant: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plant = await db.plants.findById(params.id);
    if (!plant || (plant.userId !== user.id && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    await db.plants.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
