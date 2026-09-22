#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "${1:-}" = '--dry-run' ]; then
  echo 'Would run: make cap-sync && make android-debug'
  exit 0
fi
if [ "$#" -ne 0 ]; then echo 'Usage: make android-build [BUILD_ARGS=--dry-run]' >&2; exit 1; fi
cd "$ROOT"
make cap-sync
make android-debug
echo "Debug APK: $ROOT/android/app/build/outputs/apk/debug/wroclaw_debug.apk"
