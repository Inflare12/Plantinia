import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';
import { checkPlantTrackingEntitlement } from '@/lib/payments/entitlements';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plants = await db.plants.listByUser(user.id);
    return NextResponse.json({ plants });
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

    // Enforce server-side plant tracking quota
    const quotaCheck = await checkPlantTrackingEntitlement(user);
    if (!quotaCheck.allowed) {
      return NextResponse.json({ error: quotaCheck.reason }, { status: 403 });
    }

    const body = await req.json();
    const { name, species, commonName, imageUrl, location, sunlightNeeds, wateringFrequencyDays, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Plant nickname is required' }, { status: 400 });
    }

    const newPlant = await db.plants.create({
      userId: user.id,
      name,
      species: species || 'Unknown botanical species',
      commonName: commonName || name,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80',
      location: location || 'indoor',
      healthStatus: 'healthy',
      sunlightNeeds: sunlightNeeds || 'indirect',
      wateringFrequencyDays: Number(wateringFrequencyDays) || 7,
      lastWateredDate: new Date().toISOString(),
      nextWateringDate: new Date(Date.now() + (Number(wateringFrequencyDays) || 7) * 24 * 3600 * 1000).toISOString(),
      notes: notes || '',
    });

    // Automatically create initial timeline entry
    await db.timeline.create({
      plantId: newPlant.id,
      userId: user.id,
      eventType: 'note',
      title: `Added ${newPlant.name} to Garden`,
      description: `Welcome to the collection! Initial watering schedule set to every ${newPlant.wateringFrequencyDays} days.`,
      imageUrl: newPlant.imageUrl,
    });

    // Schedule initial care task
    await db.careTasks.create({
      userId: user.id,
      plantId: newPlant.id,
      plantName: newPlant.name,
      title: `Water ${newPlant.name}`,
      category: 'water',
      dueDate: newPlant.nextWateringDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      isCompleted: false,
    });

    return NextResponse.json({ plant: newPlant }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
