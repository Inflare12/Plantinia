import { env } from '../env';

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']);

export interface IStorageProvider {
  uploadFile(fileBuffer: Buffer | Uint8Array, filename: string, mimeType: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

function validateFile(fileBuffer: Buffer | Uint8Array, filename: string, mimeType: string) {
  if (fileBuffer.byteLength <= 0 || fileBuffer.byteLength > MAX_FILE_BYTES) throw new Error('Media file must be between 1 byte and 8 MB');
  if (!ALLOWED_MIME.has(mimeType.toLowerCase())) throw new Error('Unsupported media type');
  if (!filename || filename.length > 180 || /[\\/]/.test(filename)) throw new Error('Invalid storage filename');
}

class LocalStorageProvider implements IStorageProvider {
  async uploadFile(fileBuffer: Buffer | Uint8Array, filename: string, mimeType: string): Promise<string> {
    validateFile(fileBuffer, filename, mimeType);
    return `data:${mimeType};base64,${Buffer.from(fileBuffer).toString('base64')}`;
  }
  async deleteFile(_fileUrl: string): Promise<void> {}
}

class S3CompatibleStorageProvider implements IStorageProvider {
  async uploadFile(fileBuffer: Buffer | Uint8Array, filename: string, mimeType: string): Promise<string> {
    validateFile(fileBuffer, filename, mimeType);
    if (!env.S3_ENDPOINT || !env.S3_BUCKET) throw new Error('S3/R2 storage is not configured');
    const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const uploadUrl = `${env.S3_ENDPOINT.replace(/\/$/, '')}/${encodeURIComponent(env.S3_BUCKET)}/${encodeURIComponent(cleanFilename)}`;
    const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': mimeType }, body: new Uint8Array(fileBuffer) });
    if (!res.ok) throw new Error(`Storage upload failed: ${res.status}`);
    return env.NEXT_PUBLIC_STORAGE_PUBLIC_URL ? `${env.NEXT_PUBLIC_STORAGE_PUBLIC_URL.replace(/\/$/, '')}/${encodeURIComponent(cleanFilename)}` : uploadUrl;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!env.S3_ENDPOINT) return;
    try {
      const target = new URL(fileUrl);
      const endpoint = new URL(env.S3_ENDPOINT);
      if (target.origin !== endpoint.origin) throw new Error('Refusing to delete a file outside configured storage');
      await fetch(target, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete file from storage', e);
    }
  }
}

class SupabaseStorageProvider implements IStorageProvider {
  async uploadFile(fileBuffer: Buffer | Uint8Array, filename: string, mimeType: string): Promise<string> {
    validateFile(fileBuffer, filename, mimeType);
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase storage is not configured');
    const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const bucket = encodeURIComponent(env.SUPABASE_STORAGE_BUCKET);
    const objectPath = encodeURIComponent(cleanFilename);
    const response = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${bucket}/${objectPath}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': mimeType, 'x-upsert': 'false' },
      body: new Uint8Array(fileBuffer),
    });
    if (!response.ok) throw new Error(`Supabase storage upload failed: ${response.status}`);
    return `${env.NEXT_PUBLIC_STORAGE_PUBLIC_URL?.replace(/\/$/, '') || `${env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}`}/${objectPath}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;
    try {
      const target = new URL(fileUrl);
      const base = new URL(env.SUPABASE_URL);
      if (target.origin !== base.origin) throw new Error('Refusing to delete a file outside configured Supabase storage');
      const marker = '/storage/v1/object/';
      const index = target.pathname.indexOf(marker);
      if (index < 0) return;
      const objectPath = target.pathname.slice(index + marker.length);
      await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${objectPath}`, { method: 'DELETE', headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY } });
    } catch (e) {
      console.error('Failed to delete Supabase object', e);
    }
  }
}

export function getStorageProvider(): IStorageProvider {
  if (env.STORAGE_PROVIDER === 'supabase') return new SupabaseStorageProvider();
  if (env.STORAGE_PROVIDER === 's3' || env.STORAGE_PROVIDER === 'r2') return new S3CompatibleStorageProvider();
  return new LocalStorageProvider();
}
