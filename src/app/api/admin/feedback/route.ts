import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/lib/db/adapter';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { diagnosisId, feedback } = await req.json();
    if (!diagnosisId || !['accurate', 'inaccurate'].includes(feedback)) {
      return NextResponse.json({ error: 'Valid diagnosisId and feedback required' }, { status: 400 });
    }

    const updated = await db.diagnoses.update(diagnosisId, {
      adminReviewed: true,
      adminAccuracyFeedback: feedback,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, diagnosis: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
