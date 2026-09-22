#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
case "${1:-}" in
  '') exec make icons-android ;;
  --dry-run) exec node scripts/generate-icons.mjs --android --dry-run ;;
  *) echo 'Usage: _iconBuilder/android-icons.sh [--dry-run]' >&2; exit 1 ;;
esac
