# 📱 Zoya AI Assistant - Android APK Build Guide

Pushpendra ji, is project ko Android APK mein convert karne ke liye sabhi files is `apk/` folder mein setup kar di gayi hain.

---

## ⚡ Method 1: 1-Click Automated Script (Recommended)

Terminal / Command Prompt mein project ke root folder mein jakar ye command chalayein:

```bash
# 1. Project dependencies install & build karein
npm install
npm run build

# 2. APK builder script run karein
chmod +x apk/build-apk.sh
./apk/build-apk.sh
```

---

## 🛠️ Method 2: Capacitor ke dwara direct APK banana

### Step 1: Capacitor install karein (agar pehle se nahi hai)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Android platform add karein
```bash
npx cap init "Zoya AI Voice Assistant" "com.pushpendra.zoya" --web-dir "dist"
npx cap add android
```

### Step 3: Web app build karke Android mein sync karein
```bash
npm run build
npx cap sync android
```

### Step 4: APK generate karein
```bash
# Option A: Android Studio mein open karke (Build > Build APK)
npx cap open android

# Option B: Direct CLI se build (Debug APK)
cd android
./gradlew assembleDebug
```
Aapka ready APK yahan mil jayega:
📁 `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔑 Permissions Included (Microphone & Background Voice)
Zoya voice assistant ko mic, background voice listening, aur internet access chahiye, jiske liye `AndroidManifest.xml` mein ye permissions configured hain:
- `android.permission.RECORD_AUDIO` (Mic input ke liye)
- `android.permission.INTERNET` (AI Gemini API connection ke liye)
- `android.permission.MODIFY_AUDIO_SETTINGS` (Audio playback & speaker routing ke liye)
- `android.permission.WAKE_LOCK` (Background voice mode mein screen/CPU keepalive ke liye)
- `android.permission.FOREGROUND_SERVICE` (Background mein continuous audio processing ke liye)
- `android.permission.FOREGROUND_SERVICE_MICROPHONE` (Android 14+ background mic access ke liye)

---

## ⚙️ App Details:
- **App Name:** Zoya - AI Voice Assistant
- **Package ID:** `com.pushpendra.zoya`
- **Developer:** Pushpendra
- **Target OS:** Android 8.0+ (API 26 to API 34)
