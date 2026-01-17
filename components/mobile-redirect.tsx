"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsNative } from '@/hooks/use-native';

/**
 * MobileRedirect component
 * Redirects mobile users away from homepage sections to login/dashboard
 */
export function MobileRedirect() {
  const { isNative } = useIsNative();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isNative) return;

    // List of homepage routes that should redirect to login in mobile app
    const homepageRoutes = [
      '/',
      '/announcement',
      '/blog',
      '/contact',
      '/events',
      '/gallery',
      '/leaderboard',
      '/projects',
      '/team',
    ];

    // Check if current path is a homepage route or starts with these paths
    const isHomepageRoute = homepageRoutes.some(route => 
      pathname === route || (route !== '/' && pathname.startsWith(route))
    );

    if (isHomepageRoute) {
      // Redirect to login page
      router.replace('/login');
    }
  }, [isNative, pathname, router]);

  return null;
}
