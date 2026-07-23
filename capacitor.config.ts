import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fogofwar.app',
  appName: 'Fog of War',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
