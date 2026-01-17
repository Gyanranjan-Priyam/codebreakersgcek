# Quick Start Guide for Windows Users

This is a simplified guide for Windows users to build and run the mobile app.

## 📋 Prerequisites Setup

### 1. Install Android Studio

1. Download [Android Studio](https://developer.android.com/studio)
2. Install Android Studio with default settings
3. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device

### 2. Set Environment Variables

1. Open System Properties (Win + Pause/Break)
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Add new System Variables:

```
Variable name: ANDROID_HOME
Variable value: C:\Users\YourUsername\AppData\Local\Android\Sdk
```

```
Variable name: JAVA_HOME
Variable value: C:\Program Files\Android\Android Studio\jbr
```

5. Edit the "Path" variable and add:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

### 3. Install Java JDK (if not already installed)

Android Studio usually installs JDK, but if needed:
1. Download [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
2. Install and set JAVA_HOME to installation directory

## 🚀 Building the Mobile App

### Step 1: Build the Project

Open PowerShell in your project directory and run:

```powershell
# For Windows PowerShell, use this syntax:
$env:BUILD_MODE="mobile"; npm run build
npx cap sync
```

OR use the npm script (recommended):

```powershell
npm run build:mobile
```

### Step 2: Open Android Studio

```powershell
npm run cap:open:android
```

This will open your project in Android Studio.

### Step 3: Run the App

**Option A: From Android Studio**
1. Wait for Gradle sync to complete
2. Click the green "Run" button (▶️)
3. Select a device or create a new virtual device
4. App will install and run

**Option B: From Command Line**
```powershell
npm run cap:run:android
```

## 🔧 Common Issues on Windows

### Issue 1: "ANDROID_HOME not set"

**Solution:**
```powershell
# Set temporarily in current session
$env:ANDROID_HOME="C:\Users\YourUsername\AppData\Local\Android\Sdk"

# Verify
echo $env:ANDROID_HOME
```

### Issue 2: "Gradle sync failed"

**Solution:**
1. Open Android Studio
2. Go to File → Invalidate Caches / Restart
3. Click "Invalidate and Restart"

### Issue 3: "Build failed: command not found"

**Solution:**
Make sure you're using PowerShell (not CMD) or use cross-env:

```powershell
npm install -g cross-env
cross-env BUILD_MODE=mobile npm run build
```

### Issue 4: Port already in use

**Solution:**
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

## 📱 Testing on Real Device

### Enable USB Debugging on Android:

1. Go to Settings → About Phone
2. Tap "Build Number" 7 times to enable Developer Options
3. Go to Settings → Developer Options
4. Enable "USB Debugging"
5. Connect your phone to PC via USB
6. Accept the debugging prompt on your phone

### Run on Device:

```powershell
npm run cap:run:android
```

Android Studio will detect your device automatically.

## 🎯 Quick Commands Reference

```powershell
# Build for mobile
npm run build:mobile

# Sync changes
npm run cap:sync

# Open in Android Studio
npm run cap:open:android

# Run on device/emulator
npm run cap:run:android

# One-command build and run
npm run mobile:dev
```

## 💡 Pro Tips

1. **Use PowerShell, not CMD** - PowerShell has better support for environment variables
2. **Keep Android Studio updated** - Update via Help → Check for Updates
3. **Use physical device for testing** - Emulators can be slow on some PCs
4. **Enable Developer Mode** - Speeds up builds in Android Studio
5. **Close other apps** - Android builds are resource-intensive

## 🆘 Still Having Issues?

1. Check the detailed guide: [MOBILE_SETUP.md](./MOBILE_SETUP.md)
2. Verify environment variables:
   ```powershell
   echo $env:ANDROID_HOME
   echo $env:JAVA_HOME
   echo $env:PATH
   ```
3. Restart your computer after setting environment variables
4. Try running Android Studio as Administrator

## 📚 Next Steps

After successfully running the app:

1. Read [MOBILE_SETUP.md](./MOBILE_SETUP.md) for detailed features
2. Check [mobile-example.tsx](./components/examples/mobile-example.tsx) for usage examples
3. Customize the app icon and splash screen in Android Studio
4. Test on different Android versions and screen sizes
