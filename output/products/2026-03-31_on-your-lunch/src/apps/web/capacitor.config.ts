import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onyourmark.onyourlunch',
  appName: '온유어런치',
  webDir: 'out',
  server: {
    url: 'https://on-your-lunch-web-lee-sang-woons-projects.vercel.app',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#FFFFFF',
  },
};

export default config;
