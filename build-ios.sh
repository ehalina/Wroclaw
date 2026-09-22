#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_FILE="$ROOT/ios/App/App.xcodeproj/project.pbxproj"
ARCHIVE_DIR="$ROOT/artifacts/native/ios"
LOG_FILE="$ARCHIVE_DIR/build-ios.log"
BUILD_NUMBER="${IOS_BUILD_NUMBER:-}"
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=1 ;;
    *) echo 'Usage: make ios-archive [BUILD_ARGS=--dry-run] [IOS_BUILD_NUMBER=N]' >&2; exit 1 ;;
  esac
done

current_build_number() {
  awk -F ' = |;' '/CURRENT_PROJECT_VERSION = [0-9]+;/{ print $2; exit }' "$PROJECT_FILE"
}

marketing_version() {
  awk -F ' = |;' '/MARKETING_VERSION = /{ print $2; exit }' "$PROJECT_FILE"
}

set_build_number() {
  local next="$1"
  perl -0pi -e "s/CURRENT_PROJECT_VERSION = [0-9]+;/CURRENT_PROJECT_VERSION = $next;/g" "$PROJECT_FILE"
}

log_line() {
  printf '%s\n' "$*" | tee -a "$LOG_FILE"
}

run_logged() {
  set +e
  "$@" 2>&1 | tee -a "$LOG_FILE"
  local status=${PIPESTATUS[0]}
  set -e
  return "$status"
}

if [ -n "$BUILD_NUMBER" ] && ! [[ "$BUILD_NUMBER" =~ ^[1-9][0-9]*$ ]]; then
  echo 'IOS_BUILD_NUMBER must be a positive integer.' >&2; exit 1
fi

CURRENT_BUILD_NUMBER="$(current_build_number)"
if [ -z "$CURRENT_BUILD_NUMBER" ]; then
  echo "Could not read CURRENT_PROJECT_VERSION from $PROJECT_FILE" >&2
  exit 1
fi

if [ -z "$BUILD_NUMBER" ]; then
  BUILD_NUMBER=$((CURRENT_BUILD_NUMBER + 1))
fi

MARKETING_VERSION="$(marketing_version)"
if [ -z "$MARKETING_VERSION" ]; then
  echo "Could not read MARKETING_VERSION from $PROJECT_FILE" >&2
  exit 1
fi

ARCHIVE="$ARCHIVE_DIR/App-$MARKETING_VERSION-$BUILD_NUMBER.xcarchive"

cd "$ROOT"
mkdir -p "$ARCHIVE_DIR"
log_line ""
log_line "[$(date '+%Y-%m-%d %H:%M:%S %z')] iOS archive build"
log_line "Log: $LOG_FILE"
log_line "Version: $MARKETING_VERSION"
log_line "Build number: $CURRENT_BUILD_NUMBER -> $BUILD_NUMBER"
log_line "Archive: $ARCHIVE"
trap 'status=$?; if [ "$status" -ne 0 ]; then printf "%s\n" "[$(date "+%Y-%m-%d %H:%M:%S %z")] iOS archive build failed with status $status" | tee -a "$LOG_FILE"; fi' EXIT

if [ "$DRY_RUN" -eq 1 ]; then
  log_line "Would generate iOS icons from resources/icon-source.png"
  log_line "Would set iOS build number: $CURRENT_BUILD_NUMBER -> $BUILD_NUMBER"
  log_line "Would sync Capacitor and archive iOS Release to $ARCHIVE"
  exit 0
fi

if [ -e "$ARCHIVE" ]; then
  log_line "Archive already exists; move it before building again: $ARCHIVE"
  exit 1
fi

run_logged bash _iconBuilder/ios-icons.sh
set_build_number "$BUILD_NUMBER"
run_logged make cap-sync
xcode_args=(archive -project ios/App/App.xcodeproj -scheme App
  -configuration Release -destination 'generic/platform=iOS'
  -archivePath "$ARCHIVE" -allowProvisioningUpdates CODE_SIGN_STYLE=Automatic)
run_logged xcodebuild "${xcode_args[@]}"
log_line "iOS archive: $ARCHIVE"
log_line "[$(date '+%Y-%m-%d %H:%M:%S %z')] iOS archive build completed"
