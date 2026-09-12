export interface CapturedMedia {
  dataUrl: string;
  blob?: Blob;
  format: string;
  type: 'image' | 'video';
  file?: File;
}

export async function captureFromCamera(): Promise<CapturedMedia | null> {
  // 1. Check if running inside Capacitor native Android container
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isPluginAvailable('Camera')) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (photo.dataUrl) {
        return {
          dataUrl: photo.dataUrl,
          format: photo.format,
          type: 'image',
        };
      }
    } catch (err: any) {
      if (err.message !== 'User cancelled photos app') {
        console.warn('Capacitor camera error, falling back to web file picker:', err);
      } else {
        return null;
      }
    }
  }

  // 2. Web fallback: HTML5 file input with camera capture attribute
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Triggers mobile rear camera

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          format: file.type,
          type: 'image',
          file,
        });
      };
      reader.readAsDataURL(file);
    };

    input.click();
  });
}

export async function pickMediaFile(accept: string = 'image/*,video/*'): Promise<CapturedMedia | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          format: file.type,
          type: isVideo ? 'video' : 'image',
          file,
        });
      };
      reader.readAsDataURL(file);
    };

    input.click();
  });
}
