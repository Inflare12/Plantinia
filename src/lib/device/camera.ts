export interface CapturedMedia {
  dataUrl: string;
  blob?: Blob;
  format: string;
  type: 'image' | 'video';
  file?: File;
}

const MAX_CLIENT_MEDIA_BYTES = 4 * 1024 * 1024;

function validMime(type: string): boolean {
  return /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime))$/i.test(type);
}

async function fileToMedia(file: File): Promise<CapturedMedia | null> {
  if (file.size <= 0 || file.size > MAX_CLIENT_MEDIA_BYTES || !validMime(file.type)) return null;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('Unable to read media'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  return { dataUrl, format: file.type, type: file.type.startsWith('video/') ? 'video' : 'image', file };
}

export async function captureFromCamera(): Promise<CapturedMedia | null> {
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isPluginAvailable('Camera')) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({ quality: 90, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Camera });
      if (photo.dataUrl) return { dataUrl: photo.dataUrl, format: photo.format, type: 'image' };
    } catch (err: any) {
      if (err.message !== 'User cancelled photos app') console.warn('Capacitor camera error, falling back to web picker:', err);
      else return null;
    }
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
    input.onchange = async () => { const file = input.files?.[0]; resolve(file ? await fileToMedia(file) : null); };
    input.click();
  });
}

export async function pickMediaFile(accept: string = 'image/*,video/*'): Promise<CapturedMedia | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = accept;
    input.onchange = async () => { const file = input.files?.[0]; resolve(file ? await fileToMedia(file) : null); };
    input.click();
  });
}
