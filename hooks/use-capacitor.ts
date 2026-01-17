"use client";

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';

export function useCapacitor() {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    const currentPlatform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
    
    setIsNative(native);
    setPlatform(currentPlatform);

    if (native) {
      // Initialize native features
      initializeStatusBar();
      initializeSplashScreen();
      initializeBackButton();
    }
  }, []);

  const initializeStatusBar = async () => {
    try {
      // Set status bar style
      await StatusBar.setStyle({ style: Style.Light });
      
      // Set status bar background color (Android only)
      if (platform === 'android') {
        await StatusBar.setBackgroundColor({ color: '#000000' });
      }
      
      // Show status bar
      await StatusBar.show();
      
      // Make status bar not overlay the WebView
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (error) {
      console.error('Error initializing status bar:', error);
    }
  };

  const initializeSplashScreen = async () => {
    try {
      // Hide splash screen after app is ready
      await SplashScreen.hide();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  };

  const initializeBackButton = () => {
    try {
      // Handle Android back button
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          // If can't go back, minimize app instead of exit
          App.minimizeApp();
        } else {
          window.history.back();
        }
      });
    } catch (error) {
      console.error('Error initializing back button:', error);
    }
  };

  const setStatusBarStyle = async (style: 'light' | 'dark') => {
    if (!isNative) return;
    
    try {
      await StatusBar.setStyle({ 
        style: style === 'light' ? Style.Light : Style.Dark 
      });
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  };

  const setStatusBarColor = async (color: string) => {
    if (!isNative || platform !== 'android') return;
    
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Error setting status bar color:', error);
    }
  };

  const hideStatusBar = async () => {
    if (!isNative) return;
    
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Error hiding status bar:', error);
    }
  };

  const showStatusBar = async () => {
    if (!isNative) return;
    
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Error showing status bar:', error);
    }
  };

  return {
    isNative,
    platform,
    setStatusBarStyle,
    setStatusBarColor,
    hideStatusBar,
    showStatusBar,
  };
}
