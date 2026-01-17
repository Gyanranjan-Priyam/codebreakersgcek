import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gcek.codebreakers',
  appName: 'CodeBreakers',
  webDir: 'out',
  
  // Server configuration for development
  server: {
    // URL for development server (optional, for live reload)
    // url: 'http://192.168.1.100:3000',
    // cleartext: true
  },
  
  // iOS specific configuration
  ios: {
    contentInset: 'always',
    // Handles the safe area insets automatically
  },
  
  // Android specific configuration
  android: {
    // Allows the app to use the full screen
    allowMixedContent: true,
    captureInput: true,
  },
  
  // Plugins configuration
  plugins: {
    // Status Bar configuration
    StatusBar: {
      style: 'light', // 'light' | 'dark'
      backgroundColor: '#000000', // Android only
      overlaysWebView: false, // Make status bar visible
    },
    
    // Splash Screen configuration
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: true,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
    },
  },
};

export default config;
