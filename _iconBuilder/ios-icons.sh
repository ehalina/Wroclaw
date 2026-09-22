#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
case "${1:-}" in
  '') exec make icons-ios ;;
  --dry-run) exec node scripts/generate-icons.mjs --ios --dry-run ;;
  *) echo 'Usage: _iconBuilder/ios-icons.sh [--dry-run]' >&2; exit 1 ;;
esac
