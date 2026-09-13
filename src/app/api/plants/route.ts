import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';
import { checkPlantTrackingEntitlement } from '@/lib/payments/entitlements';

const plantSchema = z.object({
  name: z.string().trim().min(1).max(100),
  species: z.string().trim().max(150).optional(),
  commonName: z.string().trim().max(150).optional(),
  imageUrl: z.string().url().max(2000).refine((v) => v.startsWith('https://'), 'Image must use HTTPS').optional(),
  location: z.enum(['indoor', 'outdoor', 'balcony', 'greenhouse']).optional(),
  sunlightNeeds: z.enum(['direct', 'indirect', 'low', 'shade']).optional(),
  wateringFrequencyDays: z.coerce.number().int().min(1).max(365).optional(),
  notes: z.string().max(2000).optional(),
});

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ plants: await db.plants.listByUser(user.id) });
  } catch (error) {
    console.error('Plants GET error:', error);
    return NextResponse.json({ error: 'Unable to load plants' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const quotaCheck = await checkPlantTrackingEntitlement(user);
    if (!quotaCheck.allowed) return NextResponse.json({ error: quotaCheck.reason }, { status: 403 });

    const parsed = plantSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid plant details', details: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    const wateringDays = data.wateringFrequencyDays ?? 7;
    const now = new Date();

    const newPlant = await db.plants.create({
      userId: user.id,
      name: data.name,
      species: data.species || 'Unknown botanical species',
      commonName: data.commonName || data.name,
      imageUrl: data.imageUrl || DEFAULT_IMAGE,
      location: data.location || 'indoor',
      healthStatus: 'healthy',
      sunlightNeeds: data.sunlightNeeds || 'indirect',
      wateringFrequencyDays: wateringDays,
      lastWateredDate: now.toISOString(),
      nextWateringDate: new Date(now.getTime() + wateringDays * 24 * 3600 * 1000).toISOString(),
      notes: data.notes || '',
    });

    try {
      await db.timeline.create({
        plantId: newPlant.id,
        userId: user.id,
        eventType: 'note',
        title: `Added ${newPlant.name} to Garden`,
        description: `Welcome to the collection! Initial watering schedule set to every ${newPlant.wateringFrequencyDays} days.`,
        imageUrl: newPlant.imageUrl,
      });
      await db.careTasks.create({
        userId: user.id,
        plantId: newPlant.id,
        plantName: newPlant.name,
        title: `Water ${newPlant.name}`,
        category: 'water',
        dueDate: newPlant.nextWateringDate?.split('T')[0] || now.toISOString().split('T')[0],
        isCompleted: false,
      });
    } catch (secondaryError) {
      // The plant itself is valid and persisted; surface the failure instead of pretending
      // the entire operation was atomic. A later repair job can rebuild derived records.
      console.error('Failed to create initial plant timeline/task:', secondaryError);
    }

    return NextResponse.json({ plant: newPlant }, { status: 201 });
  } catch (error) {
    console.error('Plants POST error:', error);
    return NextResponse.json({ error: 'Unable to create plant' }, { status: 500 });
  }
}
