import { env } from '../env';

const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
const ALLOWED_HOSTS = [
  'images.unsplash.com',
  'res.cloudinary.com',
  'r2.cloudflarestorage.com',
  'supabase.co',
];

function hostAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) return true;

  if (env.NEXT_PUBLIC_STORAGE_PUBLIC_URL) {
    try {
      return new URL(env.NEXT_PUBLIC_STORAGE_PUBLIC_URL).hostname.toLowerCase() === host;
    } catch {
      return false;
    }
  }
  return false;
}

function dataUriToPart(value: string) {
  const match = value.match(/^data:(image\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+);base64,([a-z0-9+/=\r\n]+)$/i);
  if (!match) throw new Error('Unsupported media data URI');

  const data = match[2].replace(/\s/g, '');
  const bytes = Buffer.from(data, 'base64');
  if (bytes.byteLength > MAX_MEDIA_BYTES) throw new Error('Media file is too large for AI analysis');
  return { inlineData: { mimeType: match[1], data } };
}

export async function toGeminiMediaPart(mediaUrl: string) {
  if (mediaUrl.startsWith('data:')) return dataUriToPart(mediaUrl);

  let url: URL;
  try { url = new URL(mediaUrl); } catch { throw new Error('Invalid media URL'); }
  if (url.protocol !== 'https:' || !hostAllowed(url.hostname)) {
    throw new Error('Media URL is not from an approved HTTPS storage host');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'error', cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to fetch media (${response.status})`);

    const contentType = response.headers.get('content-type')?.split(';')[0].toLowerCase() || '';
    if (!contentType.startsWith('image/') && !contentType.startsWith('video/')) throw new Error('Stored media is not an image or video');

    const declaredLength = Number(response.headers.get('content-length') || 0);
    if (declaredLength > MAX_MEDIA_BYTES) throw new Error('Media file is too large for AI analysis');

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_MEDIA_BYTES) throw new Error('Media file is too large for AI analysis');
    return { inlineData: { mimeType: contentType, data: Buffer.from(bytes).toString('base64') } };
  } finally {
    clearTimeout(timeout);
  }
}
