#!/usr/bin/env bash
set -euo pipefail
umask 077

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SIGNING_DIR="$ROOT/___keys/android"
KEYSTORE="$SIGNING_DIR/upload-keystore.jks"
PROPERTIES="$SIGNING_DIR/signing.properties"
KEY_ALIAS="${ANDROID_KEY_ALIAS:-upload}"
KEY_DNAME="${ANDROID_KEY_DNAME:-CN=Wroclaw Storywalk Upload}"
JAVA_HOME="${CAPACITOR_JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
KEYTOOL="$JAVA_HOME/bin/keytool"

case "${1:-}" in
  --dry-run)
    printf 'Keystore: %s\nProperties: %s\nAlias: %s\nSubject: %s\n' "$KEYSTORE" "$PROPERTIES" "$KEY_ALIAS" "$KEY_DNAME"
    exit 0 ;;
  --confirm-create) ;;
  *) printf 'Usage: make android-signing-create SIGNING_ARGS="--dry-run|--confirm-create"\n' >&2; exit 1 ;;
esac
if [ "$#" -ne 1 ]; then echo 'Exactly one argument is required.' >&2; exit 1; fi
if [ -e "$KEYSTORE" ] || [ -e "$PROPERTIES" ]; then
  echo 'Signing files already exist. They will not be overwritten.' >&2
  exit 1
fi
if [ ! -x "$KEYTOOL" ]; then echo "JDK 21 keytool not found: $KEYTOOL" >&2; exit 1; fi
if ! command -v openssl >/dev/null; then echo 'openssl is required.' >&2; exit 1; fi
mkdir -p "$SIGNING_DIR"
password="$(openssl rand -hex 24)"
"$KEYTOOL" -genkeypair -keystore "$KEYSTORE" -alias "$KEY_ALIAS" \
  -keyalg RSA -keysize 3072 -validity 10000 -storepass "$password" \
  -keypass "$password" -dname "$KEY_DNAME"
cat > "$PROPERTIES" <<EOF
storeFile=upload-keystore.jks
storePassword=$password
keyAlias=$KEY_ALIAS
keyPassword=$password
EOF
chmod 600 "$KEYSTORE" "$PROPERTIES"
echo "Upload key created under $SIGNING_DIR. Back up both files securely before Play upload."
