"use client";

import { useCapacitor } from '@/hooks/use-capacitor';
import { useIsNative } from '@/hooks/use-native';
import { useSafeArea } from '@/hooks/use-native';
import { SafeArea, StatusBarSpacer, NavigationBarSpacer } from '@/components/ui/safe-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example component demonstrating mobile-specific features
 * This shows how to properly handle:
 * - Status bar visibility
 * - Safe area insets
 * - Navigation bar spacing
 * - Platform detection
 */
export function MobileExample() {
  const { isNative, platform, setStatusBarStyle, setStatusBarColor, hideStatusBar, showStatusBar } = useCapacitor();
  const { isNative: isNativeSimple } = useIsNative();
  const safeArea = useSafeArea();

  return (
    <div className="min-h-screen bg-background">
      {/* Status bar spacer - pushes content below the status bar */}
      <StatusBarSpacer />

      <SafeArea className="container py-8">
        <div className="space-y-6">
          {/* Platform Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>
                Current platform and environment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>Is Native:</strong> {isNative ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Platform:</strong> {platform}
              </div>
              <div>
                <strong>Simple Native Check:</strong> {isNativeSimple ? 'Yes' : 'No'}
              </div>
            </CardContent>
          </Card>

          {/* Safe Area Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Safe Area Insets</CardTitle>
              <CardDescription>
                Current safe area padding values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>Top:</strong> {safeArea.top}px
              </div>
              <div>
                <strong>Right:</strong> {safeArea.right}px
              </div>
              <div>
                <strong>Bottom:</strong> {safeArea.bottom}px
              </div>
              <div>
                <strong>Left:</strong> {safeArea.left}px
              </div>
            </CardContent>
          </Card>

          {/* Status Bar Controls (only shown in native) */}
          {isNative && (
            <Card>
              <CardHeader>
                <CardTitle>Status Bar Controls</CardTitle>
                <CardDescription>
                  Control the status bar appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setStatusBarStyle('light')}
                    variant="outline"
                  >
                    Light Style
                  </Button>
                  <Button
                    onClick={() => setStatusBarStyle('dark')}
                    variant="outline"
                  >
                    Dark Style
                  </Button>
                </div>

                {platform === 'android' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setStatusBarColor('#000000')}
                      variant="outline"
                    >
                      Black Background
                    </Button>
                    <Button
                      onClick={() => setStatusBarColor('#ffffff')}
                      variant="outline"
                    >
                      White Background
                    </Button>
                    <Button
                      onClick={() => setStatusBarColor('#6366f1')}
                      variant="outline"
                    >
                      Indigo Background
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => hideStatusBar()}
                    variant="destructive"
                  >
                    Hide Status Bar
                  </Button>
                  <Button
                    onClick={() => showStatusBar()}
                    variant="default"
                  >
                    Show Status Bar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Example Content */}
          <Card>
            <CardHeader>
              <CardTitle>Example Content</CardTitle>
              <CardDescription>
                This content is properly padded with safe areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is an example of content that respects safe areas.
                On devices with notches or rounded corners, the content
                will automatically adjust to avoid being hidden.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                The SafeArea component wraps this content and adds the
                appropriate padding based on the device's safe area insets.
              </p>
            </CardContent>
          </Card>
        </div>
      </SafeArea>

      {/* Navigation bar spacer - adds space at the bottom */}
      <NavigationBarSpacer />
    </div>
  );
}

/**
 * Example of a fixed header that respects safe areas
 */
export function MobileHeader() {
  const { isNative } = useIsNative();

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-background border-b z-50"
      style={{
        paddingTop: isNative ? 'var(--safe-area-inset-top)' : '0',
      }}
    >
      <div className="container flex items-center justify-between h-16 px-4">
        <h1 className="text-xl font-bold">My App</h1>
        <Button variant="ghost">Menu</Button>
      </div>
    </header>
  );
}

/**
 * Example of a fixed footer that respects safe areas
 */
export function MobileFooter() {
  const { isNative } = useIsNative();

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 bg-background border-t"
      style={{
        paddingBottom: isNative ? 'var(--safe-area-inset-bottom)' : '0',
      }}
    >
      <div className="container flex items-center justify-around h-16 px-4">
        <Button variant="ghost" size="sm">Home</Button>
        <Button variant="ghost" size="sm">Search</Button>
        <Button variant="ghost" size="sm">Profile</Button>
      </div>
    </footer>
  );
}
