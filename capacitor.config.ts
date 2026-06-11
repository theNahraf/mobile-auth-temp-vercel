import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aakash.aggregators',
  appName: 'Aakash Aggregators',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
