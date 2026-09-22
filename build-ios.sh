#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_FILE="$ROOT/ios/App/App.xcodeproj/project.pbxproj"
ARCHIVE_DIR="$ROOT/artifacts/native/ios"
LOG_FILE="$ARCHIVE_DIR/build-ios.log"
BUILD_NUMBER="${IOS_BUILD_NUMBER:-}"
DRY_RUN=0
UPLOAD=1
SKIP_ARCHIVE=0

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=1 ;;
    --no-upload)
      UPLOAD=0 ;;
    *) echo 'Usage: make ios-archive [BUILD_ARGS="--dry-run|--no-upload"] [IOS_BUILD_NUMBER=N]' >&2; exit 1 ;;
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

dotenv_value() {
  local file="$1"
  local name="$2"
  if [ ! -f "$file" ]; then return 0; fi
  awk -F= -v key="$name" '
    $0 !~ /^[[:space:]]*#/ && $1 == key {
      value = substr($0, index($0, "=") + 1)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
      gsub(/^"|"$/, "", value)
      gsub(/^'\''|'\''$/, "", value)
      print value
      exit
    }
  ' "$file"
}

env_or_secret_file() {
  local name="$1"
  local value="${!name:-}"
  if [ -n "$value" ]; then
    printf '%s\n' "$value"
    return 0
  fi
  value="$(dotenv_value "$ROOT/.env" "$name")"
  if [ -n "$value" ]; then
    printf '%s\n' "$value"
    return 0
  fi
  dotenv_value "$ROOT/___keys/ios/asc.env" "$name"
}

issuer_id_value() {
  local value
  value="$(env_or_secret_file ASC_ISSUER_ID)"
  if [ -n "$value" ]; then
    printf '%s\n' "$value"
    return 0
  fi
  if [ -f "$ROOT/___keys/ios/issuer-id.txt" ]; then
    awk 'NF && $0 !~ /^[[:space:]]*#/ { gsub(/^[[:space:]]+|[[:space:]]+$/, ""); print; exit }' "$ROOT/___keys/ios/issuer-id.txt"
  fi
}

default_asc_key_path() {
  local keys=("$ROOT"/___keys/ios/AuthKey_*.p8)
  if [ ! -e "${keys[0]}" ] || [ "${#keys[@]}" -ne 1 ]; then return 0; fi
  printf '%s\n' "${keys[0]}"
}

key_id_from_path() {
  local path="$1"
  local file="${path##*/}"
  file="${file#AuthKey_}"
  printf '%s\n' "${file%.p8}"
}

resolve_authentication() {
  ASC_KEY_PATH_RESOLVED="$(env_or_secret_file ASC_KEY_PATH)"
  if [ -z "$ASC_KEY_PATH_RESOLVED" ]; then
    ASC_KEY_PATH_RESOLVED="$(default_asc_key_path)"
  elif [[ "$ASC_KEY_PATH_RESOLVED" != /* ]]; then
    ASC_KEY_PATH_RESOLVED="$ROOT/$ASC_KEY_PATH_RESOLVED"
  fi

  ASC_KEY_ID_RESOLVED="$(env_or_secret_file ASC_KEY_ID)"
  if [ -z "$ASC_KEY_ID_RESOLVED" ] && [ -n "$ASC_KEY_PATH_RESOLVED" ]; then
    ASC_KEY_ID_RESOLVED="$(key_id_from_path "$ASC_KEY_PATH_RESOLVED")"
  fi

  ASC_ISSUER_ID_RESOLVED="$(issuer_id_value)"

  if [ -z "$ASC_KEY_PATH_RESOLVED" ] || [ -z "$ASC_KEY_ID_RESOLVED" ] || [ -z "$ASC_ISSUER_ID_RESOLVED" ]; then
    log_line "Missing App Store Connect upload settings."
    log_line "Set ASC_ISSUER_ID in ___keys/ios/asc.env, ___keys/ios/issuer-id.txt, .env, or the shell."
    log_line "Optional overrides: ASC_KEY_ID, ASC_KEY_PATH."
    return 1
  fi
  if [[ "$ASC_KEY_PATH_RESOLVED" != *.p8 ]] || [ ! -f "$ASC_KEY_PATH_RESOLVED" ] || [ -L "$ASC_KEY_PATH_RESOLVED" ]; then
    log_line "ASC_KEY_PATH must point to a regular .p8 file: $ASC_KEY_PATH_RESOLVED"
    return 1
  fi
}

write_export_options() {
  cat > "$EXPORT_OPTIONS" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>destination</key>
  <string>upload</string>
  <key>manageAppVersionAndBuildNumber</key>
  <true/>
  <key>method</key>
  <string>app-store-connect</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>teamID</key>
  <string>AB8LFY64PF</string>
  <key>uploadSymbols</key>
  <true/>
</dict>
</plist>
EOF
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
EXPORT_DIR="$ARCHIVE_DIR/App-$MARKETING_VERSION-$BUILD_NUMBER-export"
EXPORT_OPTIONS="$ARCHIVE_DIR/App-$MARKETING_VERSION-$BUILD_NUMBER-export-options.plist"

cd "$ROOT"
mkdir -p "$ARCHIVE_DIR"
log_line ""
log_line "[$(date '+%Y-%m-%d %H:%M:%S %z')] iOS archive build"
log_line "Log: $LOG_FILE"
log_line "Version: $MARKETING_VERSION"
log_line "Build number: $CURRENT_BUILD_NUMBER -> $BUILD_NUMBER"
log_line "Archive: $ARCHIVE"
if [ "$UPLOAD" -eq 1 ]; then
  log_line "Upload: enabled"
  log_line "Export: $EXPORT_DIR"
else
  log_line "Upload: disabled (--no-upload)"
fi
trap 'status=$?; if [ "$status" -ne 0 ]; then printf "%s\n" "[$(date "+%Y-%m-%d %H:%M:%S %z")] iOS archive build failed with status $status" | tee -a "$LOG_FILE"; fi' EXIT

if [ "$DRY_RUN" -eq 1 ]; then
  if [ -e "$ARCHIVE" ] && [ "$UPLOAD" -eq 1 ]; then
    log_line "Would skip archive build and upload existing archive: $ARCHIVE"
  else
    log_line "Would generate iOS icons from resources/icon-source.png"
    log_line "Would set iOS build number: $CURRENT_BUILD_NUMBER -> $BUILD_NUMBER"
    log_line "Would sync Capacitor and archive iOS Release to $ARCHIVE"
  fi
  if [ "$UPLOAD" -eq 1 ]; then
    log_line "Would export and upload the archive to App Store Connect/TestFlight"
  fi
  exit 0
fi

if [ "$UPLOAD" -eq 1 ]; then
  resolve_authentication
  log_line "Authentication: App Store Connect API key $ASC_KEY_ID_RESOLVED"
fi

if [ -e "$ARCHIVE" ]; then
  if [ "$UPLOAD" -eq 1 ]; then
    SKIP_ARCHIVE=1
    log_line "Archive already exists; skipping archive build and uploading existing archive: $ARCHIVE"
  else
    log_line "Archive already exists; move it before building again: $ARCHIVE"
    exit 1
  fi
fi

if [ "$SKIP_ARCHIVE" -eq 0 ]; then
  run_logged bash _iconBuilder/ios-icons.sh
  set_build_number "$BUILD_NUMBER"
  run_logged make cap-sync
  xcode_args=(archive -project ios/App/App.xcodeproj -scheme App
    -configuration Release -destination 'generic/platform=iOS'
    -archivePath "$ARCHIVE" -allowProvisioningUpdates CODE_SIGN_STYLE=Automatic)
  run_logged xcodebuild "${xcode_args[@]}"
  log_line "iOS archive: $ARCHIVE"
fi
if [ "$UPLOAD" -eq 1 ]; then
  rm -rf "$EXPORT_DIR"
  mkdir -p "$EXPORT_DIR"
  write_export_options
  export_args=(-exportArchive
    -archivePath "$ARCHIVE"
    -exportPath "$EXPORT_DIR"
    -exportOptionsPlist "$EXPORT_OPTIONS"
    -allowProvisioningUpdates
    -authenticationKeyPath "$ASC_KEY_PATH_RESOLVED"
    -authenticationKeyID "$ASC_KEY_ID_RESOLVED"
    -authenticationKeyIssuerID "$ASC_ISSUER_ID_RESOLVED")
  run_logged xcodebuild "${export_args[@]}"
  log_line "iOS upload submitted to App Store Connect/TestFlight"
  log_line "iOS export artifacts: $EXPORT_DIR"
fi
log_line "[$(date '+%Y-%m-%d %H:%M:%S %z')] iOS archive build completed"
