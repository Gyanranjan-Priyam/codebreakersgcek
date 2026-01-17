# Mobile App Setup with Capacitor

This guide explains how to build and run the CodeBreakers Dashboard as a mobile application using Capacitor.

## 📱 What's Included

The mobile app setup includes:

- ✅ **Status Bar Management**: Proper status bar visibility showing time, network, and battery
- ✅ **Safe Area Insets**: Automatic handling of notches and rounded corners
- ✅ **Navigation Bar Optimization**: Bottom navigation bar properly configured
- ✅ **Keyboard Handling**: Automatic UI adjustment when keyboard appears
- ✅ **Splash Screen**: Professional app loading experience
- ✅ **iOS & Android Support**: Full support for both platforms

## 🚀 Quick Start

### Prerequisites

1. **For Android Development:**
   - Install [Android Studio](https://developer.android.com/studio)
   - Install Android SDK (API level 22 or higher)
   - Set up ANDROID_HOME environment variable

2. **For iOS Development (macOS only):**
   - Install [Xcode](https://developer.apple.com/xcode/)
   - Install Xcode Command Line Tools: `xcode-select --install`
   - Install CocoaPods: `sudo gem install cocoapods`

### Building the Mobile App

#### 1. Configure and Sync Capacitor

```bash
# Sync Capacitor configuration
npm run cap:sync
```

**Note:** This app uses a **server-based approach** where the mobile app loads your website from a server URL (configured in `capacitor.config.ts`). This allows all API routes and server-side features to work properly.

The app can point to:
- **Production:** `https://www.codebreakersgcek.tech` (default)
- **Development:** `http://localhost:3000` (for local development)

#### 2. Open in Native IDE

**For Android:**
```bash
npm run cap:open:android
```

**For iOS:**
```bash
npm run cap:open:ios
```

#### 3. Run on Device/Emulator

**For Android:**
```bash
npm run cap:run:android
```

**For iOS:**
```bash
npm run cap:run:ios
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build:mobile` | Build the app for mobile platforms |
| `npm run cap:sync` | Sync web assets with native projects |
| `npm run cap:open:android` | Open Android Studio |
| `npm run cap:open:ios` | Open Xcode |
| `npm run cap:run:android` | Build and run on Android |
| `npm run cap:run:ios` | Build and run on iOS |
| `npm run mobile:dev` | Build and run on Android in one command |

## 🎨 Mobile-Specific Features

### 1. Safe Area Support

Use the `SafeArea` component to handle notches and rounded corners:

```tsx
import { SafeArea } from '@/components/ui/safe-area';

function MyPage() {
  return (
    <SafeArea>
      <div>Your content here</div>
    </SafeArea>
  );
}
```

### 2. Status Bar Spacer

Add spacing at the top for the status bar:

```tsx
import { StatusBarSpacer } from '@/components/ui/safe-area';

function MyPage() {
  return (
    <>
      <StatusBarSpacer />
      <div>Your content here</div>
    </>
  );
}
```

### 3. Navigation Bar Spacer

Add spacing at the bottom for the navigation bar:

```tsx
import { NavigationBarSpacer } from '@/components/ui/safe-area';

function MyPage() {
  return (
    <>
      <div>Your content here</div>
      <NavigationBarSpacer />
    </>
  );
}
```

### 4. Capacitor Hooks

#### useCapacitor

Control status bar and detect platform:

```tsx
import { useCapacitor } from '@/hooks/use-capacitor';

function MyComponent() {
  const { isNative, platform, setStatusBarStyle, setStatusBarColor } = useCapacitor();

  // Check if running in native app
  if (isNative) {
    // Mobile-specific logic
    setStatusBarStyle('dark');
    setStatusBarColor('#000000');
  }

  return <div>Platform: {platform}</div>;
}
```

#### useIsNative

Simple hook to detect native environment:

```tsx
import { useIsNative } from '@/hooks/use-native';

function MyComponent() {
  const { isNative, platform } = useIsNative();

  return (
    <div>
      {isNative ? 'Running in mobile app' : 'Running in browser'}
    </div>
  );
}
```

#### useSafeArea

Get safe area inset values:

```tsx
import { useSafeArea } from '@/hooks/use-native';

function MyComponent() {
  const { top, bottom, left, right } = useSafeArea();

  return (
    <div style={{ paddingTop: top }}>
      Content with dynamic safe area padding
    </div>
  );
}
```

## ⚙️ Configuration

### Capacitor Config

The main configuration is in `capacitor.config.ts`:

```typescript
{
  appId: 'com.gcek.codebreakers',
  appName: 'CodeBreakers',
  webDir: 'out',
  plugins: {
    StatusBar: {
      style: 'light',
      backgroundColor: '#000000',
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: true,
    },
  },
  server: {
    url: 'https://www.codebreakersgcek.tech',
    cleartext: false,
  },
}
```

### Customizing Status Bar

You can customize the status bar style in your components:

```tsx
const { setStatusBarStyle, setStatusBarColor } = useCapacitor();

// Light style (dark icons)
await setStatusBarStyle('light');

// Dark style (light icons)
await setStatusBarStyle('dark');

// Change background color (Android only)
await setStatusBarColor('#FF0000');
```

## 📱 Platform-Specific Styling

The app automatically adds CSS classes to the body element:

```css
/* Applied when running in Capacitor */
body.capacitor {
  /* Your styles */
}

/* iOS-specific styles */
body.platform-ios {
  /* Your iOS styles */
}

/* Android-specific styles */
body.platform-android {
  /* Your Android styles */
}
```

## 🔧 Troubleshooting

### Build Issues

**Problem:** `out` directory not found
```bash
# Solution: Build the Next.js app first
BUILD_MODE=mobile npm run build
npx cap sync
```

**Problem:** Android SDK not found
```bash
# Solution: Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk  # Windows
```

### Status Bar Issues

**Problem:** Status bar not visible

Check `capacitor.config.ts`:
```typescript
StatusBar: {
  overlaysWebView: false,  // Should be false
}
```

**Problem:** Content hidden behind status bar

Add safe area padding to your layout:
```tsx
<SafeArea top>
  <YourContent />
</SafeArea>
```

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Status Bar Plugin](https://capacitorjs.com/docs/apis/status-bar)
- [Capacitor Keyboard Plugin](https://capacitorjs.com/docs/apis/keyboard)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## 🎯 Best Practices

1. **Always test on real devices** - Emulators may not accurately represent safe areas
2. **Use SafeArea components** - Wrap your content in SafeArea for consistent spacing
3. **Test both orientations** - Ensure your app works in portrait and landscape
4. **Handle keyboard events** - Use the keyboard hooks to adjust UI when keyboard appears
5. **Customize splash screen** - Update icons and splash screens in the native projects

## 🔄 Updating the Mobile App

### For Web Changes

Since the app loads from your server URL:
1. Deploy your changes to production
2. The mobile app will automatically use the updated version
3. No rebuild needed!

### For Local Development

1. Update `capacitor.config.ts` to point to localhost:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:3000', // e.g., http://192.168.1.100:3000
     cleartext: true,
   }
   ```

2. Run your Next.js dev server:
   ```bash
   npm run dev
   ```

3. Sync and run the app:
   ```bash
   npm run cap:sync
   npm run cap:run:android
   ```

### For Native Changes (icons, splash screens, permissions):

1. Open the native project:
   ```bash
   npm run cap:open:android  # or cap:open:ios
   ```

2. Make changes in Android Studio or Xcode
3. Rebuild from the IDE

## 📝 Notes

- The app uses a **server-based approach** - it loads your website from a configured URL
- All server-side features (API routes, authentication, database) work normally
- The mobile app is essentially a native wrapper around your web app
- Safe area insets are automatically applied via CSS variables
- Status bar color and style can be changed dynamically at runtime
- For production, ensure your server URL is accessible and HTTPS is configured
