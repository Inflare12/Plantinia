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

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Plant nickname is required' }, { status: 400 });
    }

    const safeWateringDays = Math.max(1, Math.min(365, parseInt(String(wateringFrequencyDays), 10) || 7));

    const newPlant = await db.plants.create({
      userId: user.id,
      name: name.trim().slice(0, 100),
      species: species ? String(species).trim().slice(0, 150) : 'Unknown botanical species',
      commonName: commonName ? String(commonName).trim().slice(0, 150) : name.trim().slice(0, 100),
      imageUrl: imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')
        ? imageUrl.slice(0, 500)
        : 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80',
      location: location && typeof location === 'string' ? location.slice(0, 50) : 'indoor',
      healthStatus: 'healthy',
      sunlightNeeds: sunlightNeeds && typeof sunlightNeeds === 'string' ? sunlightNeeds.slice(0, 50) : 'indirect',
      wateringFrequencyDays: safeWateringDays,
      lastWateredDate: new Date().toISOString(),
      nextWateringDate: new Date(Date.now() + safeWateringDays * 24 * 3600 * 1000).toISOString(),
      notes: notes ? String(notes).slice(0, 2000) : '',
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
