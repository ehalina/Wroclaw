#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVE="$ROOT/artifacts/native/ios/App.xcarchive"
BUILD_NUMBER="${IOS_BUILD_NUMBER:-}"

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      echo "Would sync Capacitor and archive iOS Release to $ARCHIVE"
      echo "Build number: ${BUILD_NUMBER:-from Xcode project}"
      exit 0 ;;
    *) echo 'Usage: make ios-archive [BUILD_ARGS=--dry-run] [IOS_BUILD_NUMBER=N]' >&2; exit 1 ;;
  esac
done
if [ -n "$BUILD_NUMBER" ] && ! [[ "$BUILD_NUMBER" =~ ^[1-9][0-9]*$ ]]; then
  echo 'IOS_BUILD_NUMBER must be a positive integer.' >&2; exit 1
fi
cd "$ROOT"
make cap-sync
mkdir -p "$(dirname "$ARCHIVE")"
if [ -e "$ARCHIVE" ]; then
  echo "Archive already exists; move it before building again: $ARCHIVE" >&2
  exit 1
fi
xcode_args=(archive -project ios/App/App.xcodeproj -scheme App
  -configuration Release -destination 'generic/platform=iOS'
  -archivePath "$ARCHIVE" -allowProvisioningUpdates CODE_SIGN_STYLE=Automatic)
if [ -n "$BUILD_NUMBER" ]; then xcode_args+=("CURRENT_PROJECT_VERSION=$BUILD_NUMBER"); fi
xcodebuild "${xcode_args[@]}"
echo "iOS archive: $ARCHIVE"
