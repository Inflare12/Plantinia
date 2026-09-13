import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const activated = await db.models.setActive(id);
    if (!activated) {
      return NextResponse.json({ error: 'Model version not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Model ${activated.name} (v${activated.version}) is now active in production`,
      model: activated,
    });
  } catch (error) {
    console.error('Model activation error:', error);
    return NextResponse.json({ error: 'Unable to activate model' }, { status: 500 });
  }
}
