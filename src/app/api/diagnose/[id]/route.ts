import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const diagnosis = await db.diagnoses.findById(id);
    if (!diagnosis || (diagnosis.userId !== user.id && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
    }

    return NextResponse.json({ diagnosis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
