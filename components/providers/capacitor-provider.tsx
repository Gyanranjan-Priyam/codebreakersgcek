"use client";

import { useEffect } from 'react';
import { useCapacitor } from '@/hooks/use-capacitor';

export default function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const { isNative, platform } = useCapacitor();

  useEffect(() => {
    if (isNative) {
      // Add platform class to body
      document.body.classList.add('capacitor');
      document.body.classList.add(`platform-${platform}`);
      
      // Add safe area insets CSS variables
      const updateSafeAreaInsets = () => {
        const safeAreaInsets = {
          top: 'env(safe-area-inset-top, 0px)',
          right: 'env(safe-area-inset-right, 0px)',
          bottom: 'env(safe-area-inset-bottom, 0px)',
          left: 'env(safe-area-inset-left, 0px)',
        };
        
        Object.entries(safeAreaInsets).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--safe-area-inset-${key}`, value);
        });
      };
      
      updateSafeAreaInsets();
      
      // Update on orientation change
      window.addEventListener('resize', updateSafeAreaInsets);
      
      return () => {
        window.removeEventListener('resize', updateSafeAreaInsets);
        document.body.classList.remove('capacitor');
        document.body.classList.remove(`platform-${platform}`);
      };
    }
  }, [isNative, platform]);

  return <>{children}</>;
}
