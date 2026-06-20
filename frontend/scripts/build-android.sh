#!/bin/bash

set -e

echo "🔨 Building LocalKart for Android..."

# Check for required environment variables
if [ -z "$KEYSTORE_PASSWORD" ] || [ -z "$KEYSTORE_ALIAS" ] || [ -z "$KEYSTORE_ALIAS_PASSWORD" ]; then
  echo "❌ Error: Required environment variables not set"
  echo "Required: KEYSTORE_PASSWORD, KEYSTORE_ALIAS, KEYSTORE_ALIAS_PASSWORD"
  exit 1
fi

# Build frontend
echo "📦 Building React frontend..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Build Android App Bundle
echo "📱 Building Android App Bundle..."
cd android
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file=../release.keystore \
  -Pandroid.injected.signing.store.password=$KEYSTORE_PASSWORD \
  -Pandroid.injected.signing.key.alias=$KEYSTORE_ALIAS \
  -Pandroid.injected.signing.key.password=$KEYSTORE_ALIAS_PASSWORD

echo "✅ Build complete!"
echo "📍 AAB location: android/app/build/outputs/bundle/release/app-release.aab"
echo "📊 Size: $(du -h android/app/build/outputs/bundle/release/app-release.aab | cut -f1)"
echo ""
echo "Next steps:"
echo "1. Upload to Play Store Console"
echo "2. Test in internal testing track"
echo "3. Promote to beta/production after QA"
