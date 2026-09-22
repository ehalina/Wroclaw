#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JAVA_HOME="${CAPACITOR_JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
AAB="$ROOT/android/app/build/outputs/bundle/release/app-release.aab"

if [ "${1:-}" = '--dry-run' ]; then
  echo 'Would validate signing, sync Capacitor, build release AAB/APK, and verify the AAB signature.'
  echo "AAB: $AAB"
  exit 0
fi
if [ "$#" -ne 0 ]; then echo 'Usage: make android-bundle [BUILD_ARGS=--dry-run]' >&2; exit 1; fi
if [ -n "${ANDROID_VERSION_CODE:-}" ] && ! [[ "$ANDROID_VERSION_CODE" =~ ^[1-9][0-9]*$ ]]; then
  echo 'ANDROID_VERSION_CODE must be a positive integer.' >&2; exit 1
fi
if [ -n "${ANDROID_VERSION_NAME:-}" ] && ! [[ "$ANDROID_VERSION_NAME" =~ ^[0-9]+(\.[0-9]+){1,3}$ ]]; then
  echo 'ANDROID_VERSION_NAME must look like 1.0 or 1.0.1.' >&2; exit 1
fi
if [ ! -x "$JAVA_HOME/bin/java" ]; then echo "JDK 21 not found: $JAVA_HOME" >&2; exit 1; fi
cd "$ROOT"
make android-signing-check
make cap-sync
gradle_args=(bundleRelease assembleRelease)
if [ -n "${ANDROID_VERSION_CODE:-}" ]; then gradle_args+=("-PANDROID_VERSION_CODE=$ANDROID_VERSION_CODE"); fi
if [ -n "${ANDROID_VERSION_NAME:-}" ]; then gradle_args+=("-PANDROID_VERSION_NAME=$ANDROID_VERSION_NAME"); fi
(cd android && JAVA_HOME="$JAVA_HOME" ./gradlew "${gradle_args[@]}")
make android-signing-verify AAB_PATH="$AAB"
echo "Release AAB: $AAB"
echo "Release APK: $ROOT/android/app/build/outputs/apk/release/wroclaw_release.apk"
