import { env } from '../env';

export interface IStorageProvider {
  uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    mimeType: string
  ): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

class LocalStorageProvider implements IStorageProvider {
  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    mimeType: string
  ): Promise<string> {
    const base64 = Buffer.from(fileBuffer).toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  async deleteFile(_fileUrl: string): Promise<void> {
    // No-op for in-memory data URIs
  }
}

class S3CompatibleStorageProvider implements IStorageProvider {
  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    mimeType: string
  ): Promise<string> {
    const bucket = env.S3_BUCKET || 'plantinia';
    const endpoint = env.S3_ENDPOINT;
    const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    if (!endpoint) {
      const base64 = Buffer.from(fileBuffer).toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }

    const uploadUrl = `${endpoint}/${bucket}/${cleanFilename}`;

    const body = new Uint8Array(fileBuffer);

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
      },
      body,
    });

    if (!res.ok) {
      throw new Error(`Storage upload failed: ${res.status}`);
    }

    return env.NEXT_PUBLIC_STORAGE_PUBLIC_URL
      ? `${env.NEXT_PUBLIC_STORAGE_PUBLIC_URL}/${cleanFilename}`
      : uploadUrl;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      await fetch(fileUrl, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete file from storage', e);
    }
  }
}

export function getStorageProvider(): IStorageProvider {
  if (env.STORAGE_PROVIDER === 's3' || env.STORAGE_PROVIDER === 'r2') {
    return new S3CompatibleStorageProvider();
  }

  return new LocalStorageProvider();
}
