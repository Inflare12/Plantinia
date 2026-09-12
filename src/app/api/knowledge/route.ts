import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/adapter';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (q) {
      const items = await db.knowledge.search(q);
      return NextResponse.json({ items });
    }

    const items = await db.knowledge.listAll();
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
