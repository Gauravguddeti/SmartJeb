import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartjeb.expensekeeper',
  appName: 'SmartJeb',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#0ea5e9",
      sound: "beep.wav",
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#0ea5e9'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
