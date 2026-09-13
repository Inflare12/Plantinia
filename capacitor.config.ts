import type { CapacitorConfig } from '@capacitor/cli';

const hostedUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: 'com.plantinia.app',
  appName: 'Plantinia',
  // The Next.js app contains server APIs, so production Android builds should point
  // to the deployed HTTPS app rather than pretending the API can be statically bundled.
  webDir: 'out',
  server: {
    ...(hostedUrl ? { url: hostedUrl } : {}),
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    Camera: { presentationStyle: 'fullscreen' },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
  },
};

export default config;
