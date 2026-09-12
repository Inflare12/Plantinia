import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await db.careTasks.listByUser(user.id);
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, dueDate, plantId, plantName, notes } = body;

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    let verifiedPlantId: string | undefined = undefined;
    let verifiedPlantName: string | undefined = plantName || undefined;
    if (plantId) {
      const plant = await db.plants.findById(plantId);
      if (plant && (plant.userId === user.id || user.role === 'admin')) {
        verifiedPlantId = plant.id;
        verifiedPlantName = plant.name;
      }
    }

    const task = await db.careTasks.create({
      userId: user.id,
      plantId: verifiedPlantId,
      plantName: verifiedPlantName,
      title: String(title).slice(0, 200),
      category: category || 'water',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      isCompleted: false,
      notes: notes ? String(notes).slice(0, 1000) : '',
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
