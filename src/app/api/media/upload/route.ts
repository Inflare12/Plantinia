import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getStorageProvider } from '@/lib/storage';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']);

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Media file is required' }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: 'Media must be between 1 byte and 4 MB' }, { status: 413 });
    if (!ALLOWED_MIME.has(file.type.toLowerCase())) return NextResponse.json({ error: 'Unsupported media type' }, { status: 415 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-160);
    const url = await getStorageProvider().uploadFile(buffer, safeName, file.type.toLowerCase());
    return NextResponse.json({ url, mediaType: file.type.startsWith('video/') ? 'video' : 'image' });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Unable to upload media' }, { status: 500 });
  }
}
