import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gcek.codebreakers',
  appName: 'CodeBreakers',
  webDir: 'out',
  
  // Server configuration - point to your deployed backend
  server: {
    // For development: Use your local development server
    // url: 'http://localhost:3000/login',
    // cleartext: true,
    
    // For production: Start at login page (skip homepage)
    url: 'https://www.codebreakersgcek.tech/login',
    cleartext: false,
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
