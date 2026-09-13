import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';

const updatePlantSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(), species: z.string().trim().max(150).optional(), commonName: z.string().trim().max(150).optional(),
  imageUrl: z.string().url().max(2000).refine((v) => v.startsWith('https://'), 'Image must use HTTPS').optional(),
  location: z.enum(['indoor','outdoor','balcony','greenhouse']).optional(), healthStatus: z.enum(['healthy','warning','critical','treating']).optional(),
  sunlightNeeds: z.enum(['direct','indirect','low','shade']).optional(), wateringFrequencyDays: z.coerce.number().int().min(1).max(365).optional(),
  lastWateredDate: z.string().datetime().optional().nullable(), nextWateringDate: z.string().datetime().optional().nullable(), notes: z.string().max(2000).optional(),
}).strict();

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user=await getSessionUser(req); if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
    const { id } = await params;
    const plant=await db.plants.findById(id);
    if(!plant||(plant.userId!==user.id&&user.role!=='admin'))return NextResponse.json({error:'Plant not found'},{status:404});
    const [diagnoses,timeline]=await Promise.all([db.diagnoses.listByPlant(plant.id),db.timeline.listByPlant(plant.id)]);
    return NextResponse.json({plant,diagnoses,timeline});
  } catch(error){ console.error('Plant GET error:',error); return NextResponse.json({error:'Unable to load plant'},{status:500}); }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const user=await getSessionUser(req); if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
    const { id } = await params;
    const plant=await db.plants.findById(id);
    if(!plant||(plant.userId!==user.id&&user.role!=='admin'))return NextResponse.json({error:'Plant not found'},{status:404});
    const parsed=updatePlantSchema.safeParse(await req.json());
    if(!parsed.success)return NextResponse.json({error:'Invalid plant update',details:parsed.error.flatten()},{status:400});
    const data={...parsed.data,lastWateredDate:parsed.data.lastWateredDate===null?undefined:parsed.data.lastWateredDate,nextWateringDate:parsed.data.nextWateringDate===null?undefined:parsed.data.nextWateringDate};
    const updated=await db.plants.update(id,data); return NextResponse.json({plant:updated});
  } catch(error){ console.error('Plant PATCH error:',error); return NextResponse.json({error:'Unable to update plant'},{status:500}); }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const user=await getSessionUser(req); if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
    const { id } = await params;
    const plant=await db.plants.findById(id);
    if(!plant||(plant.userId!==user.id&&user.role!=='admin'))return NextResponse.json({error:'Plant not found'},{status:404});
    await db.plants.delete(id); return NextResponse.json({success:true});
  } catch(error){ console.error('Plant DELETE error:',error); return NextResponse.json({error:'Unable to delete plant'},{status:500}); }
}
