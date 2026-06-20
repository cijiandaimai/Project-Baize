# Android APK Build Notes

The Capacitor Android project has already been generated in:

```text
D:\11\baize\白泽ai桌面宠物\android
```

To avoid filling the system drive, install Android SDK to:

```text
D:\11\baize\android-sdk
```

## Current Status

Done:

- Node.js installed.
- JDK 21 installed. This project uses `D:\11\baize\jdk-21` by default.
- Android Studio installed.
- Capacitor Android project generated.
- Web assets synced to Android.
- Gradle mirror repositories configured.
- Windows non-ASCII path check disabled for this project.

Still needed:

- Android SDK Platform 36
- Android SDK Build-Tools
- Android SDK Platform-Tools

## Install SDK On D Drive

Open Android Studio:

```text
C:\Program Files\Android\Android Studio\bin\studio64.exe
```

Then open:

```text
Settings -> Languages & Frameworks -> Android SDK
```

Set Android SDK Location to:

```text
D:\11\baize\android-sdk
```

Install:

- Android SDK Platform 36
- Android SDK Build-Tools
- Android SDK Platform-Tools

## Build APK

After SDK installation:

```powershell
cd D:\11\baize\白泽ai桌面宠物
.\build-android-debug.ps1 -SdkDir "D:\11\baize\android-sdk"
```

APK output:

```text
D:\11\baize\白泽ai桌面宠物\android\app\build\outputs\apk\debug\app-debug.apk
```
