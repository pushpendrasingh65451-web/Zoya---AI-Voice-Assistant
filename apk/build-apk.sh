#!/usr/bin/env bash

# ==========================================================
# Zoya AI Assistant - APK Automated Builder Script
# Developer: Pushpendra
# ==========================================================

set -e

echo "🚀 Starting APK Build Process for Zoya AI Assistant..."

# 1. Check if node and npm exist
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js."
    exit 1
fi

echo "📦 Step 1: Building Web Production Assets..."
npm run build

echo "📱 Step 2: Setting up Capacitor Android configuration..."
if [ ! -f "capacitor.config.json" ]; then
    cp apk/capacitor.config.json capacitor.config.json
fi

# 3. Install Capacitor packages if not present
if [ ! -d "node_modules/@capacitor" ]; then
    echo "📥 Installing Capacitor dependencies..."
    npm install --save-dev @capacitor/core @capacitor/cli @capacitor/android
fi

# 4. Initialize and sync Android folder
if [ ! -d "android" ]; then
    echo "⚡ Initializing Android project directory..."
    npx cap add android
fi

echo "🔄 Syncing dist assets with Android..."
npx cap sync android

# 5. Copy configured Manifest
if [ -d "android/app/src/main" ]; then
    cp apk/AndroidManifest.xml android/app/src/main/AndroidManifest.xml
fi

echo "🔨 Step 3: Compiling APK with Gradle..."
if [ -f "android/gradlew" ]; then
    cd android
    chmod +x gradlew
    ./gradlew assembleDebug
    cd ..
    
    echo "🎉 SUCCESS! Your APK is ready at:"
    echo "👉 android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "ℹ️ Android project synced! You can now open it in Android Studio with:"
    echo "👉 npx cap open android"
fi
