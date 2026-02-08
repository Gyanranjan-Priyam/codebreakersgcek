"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsNative } from '@/hooks/use-native';

/**
 * MobileRedirect component
 * Redirects mobile users away from removed homepage sections to login
 * Note: Homepage routes have been removed, this component is kept for potential future use
 */
export function MobileRedirect() {
  const { isNative } = useIsNative();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isNative) return;

    // Redirect root path to login (homepage has been removed)
    if (pathname === '/') {
      router.replace('/login');
    }
  }, [isNative, pathname, router]);

  return null;
}

