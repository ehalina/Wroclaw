#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SIGNING_DIR="$ROOT/___keys/android"
PROPERTIES="$SIGNING_DIR/signing.properties"
JAVA_HOME="${CAPACITOR_JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"

property() {
  awk -F= -v key="$1" '$1 == key { sub(/^[^=]*=/, ""); print; exit }' "$PROPERTIES"
}

check() {
  if [ ! -f "$PROPERTIES" ] || [ -L "$PROPERTIES" ]; then
    echo "Missing or unsafe signing configuration: $PROPERTIES" >&2
    return 1
  fi
  local key value store_file
  for key in storeFile storePassword keyAlias keyPassword; do
    value="$(property "$key")"
    if [ -z "$value" ]; then echo "Missing signing property: $key" >&2; return 1; fi
  done
  store_file="$(property storeFile)"
  if [[ "$store_file" != /* ]]; then store_file="$SIGNING_DIR/$store_file"; fi
  if [ ! -f "$store_file" ] || [ -L "$store_file" ]; then
    echo "Missing or unsafe keystore: $store_file" >&2
    return 1
  fi
  echo 'Android signing files are present; secrets were not printed.'
}

case "${1:-check}" in
  check) check ;;
  verify)
    bundle="${2:-}"
    if [ -z "$bundle" ] || [ ! -f "$bundle" ] || [ -L "$bundle" ]; then
      echo "Missing or unsafe AAB: ${bundle:-<unset>}" >&2; exit 1
    fi
    "$JAVA_HOME/bin/jarsigner" -verify -certs "$bundle" >/dev/null
    echo "AAB signature is valid: $bundle" ;;
  *) echo 'Usage: make android-signing-check | make android-signing-verify AAB_PATH=...' >&2; exit 1 ;;
esac
