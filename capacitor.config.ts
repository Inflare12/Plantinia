import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.plantinia.app',
  appName: 'Plantinia',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // In local development with emulator or physical device, uncomment url:
    // url: 'http://10.0.2.2:3000',
    cleartext: true
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
