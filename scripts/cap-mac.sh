#!/usr/bin/env bash
# Run this ON YOUR MAC after copying the project.
# Usage:
#   chmod +x scripts/cap-mac.sh
#   ./scripts/cap-mac.sh https://your-app.vercel.app
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

URL="${1:-${CAP_SERVER_URL:-}}"
if [[ -z "${URL}" ]]; then
  echo "Usage: ./scripts/cap-mac.sh https://YOUR-LIVE-APP.vercel.app"
  echo "   or: export CAP_SERVER_URL=https://... && ./scripts/cap-mac.sh"
  exit 1
fi

# strip trailing slash
URL="${URL%/}"
export CAP_SERVER_URL="$URL"

echo "==> CAP_SERVER_URL=$CAP_SERVER_URL"
echo "==> npm install"
npm install

echo "==> prepare webDir (cap-www)"
npm run cap:prepare

if [[ ! -d ios/App ]]; then
  echo "==> first-time: cap add ios"
  npx cap add ios
fi

echo "==> cap sync ios"
npx cap sync ios

echo "==> open Xcode"
npx cap open ios

echo ""
echo "Next in Xcode:"
echo "  1. Signing & Capabilities → your Team"
echo "  2. Bundle ID: com.markclass.rvfax"
echo "  3. Product → Archive → Distribute → App Store Connect / TestFlight"
echo ""
