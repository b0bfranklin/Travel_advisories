#!/usr/bin/env bash
# ==============================================================================
# EK Trip Dashboard — deploy script for Ubuntu 24.04 (bare metal, VM, or LXC)
# Uses Node.js + PM2 directly — no Docker required.
#
# HOW TO USE ON A FRESH SERVER:
#   1.  apt-get update && apt-get install -y git curl
#   2.  git clone https://github.com/b0bfranklin/Travel_advisories.git tripwatch
#   3.  cd tripwatch && git checkout claude/travel-disruption-phase-1-Pf1gd
#   4.  bash deploy.sh
#
# To run as a non-root user, prefix commands with sudo where indicated.
# ==============================================================================
set -euo pipefail

echo "=== EK Trip Dashboard — Ubuntu 24.04 setup ==="

# ── 1. Node.js 20 ─────────────────────────────────────────────────────────────
echo "[1/5] Installing Node.js 20..."
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg

NODE_MAJOR=20
if ! command -v node &>/dev/null || [[ $(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v') -lt $NODE_MAJOR ]]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - 2>&1 | grep -v "^$" | tail -3
  apt-get install -y -qq nodejs
fi
echo "  ✓ Node $(node -v)  npm $(npm -v)"

# ── 2. Environment config ──────────────────────────────────────────────────────
echo "[2/5] Checking environment config..."
if [ ! -f .env ]; then
  cp .env.local.example .env
  echo ""
  echo "  .env created from template. Optional API keys you can add now or later:"
  echo ""
  echo "    OPENWEATHERMAP_API_KEY   free tier — openweathermap.org/api  (weather)"
  echo "    AVIATIONSTACK_API_KEY    free tier — aviationstack.com       (live flight status)"
  echo ""
  echo "  The app works without keys — shows scheduled times + static advisories."
  echo "  Edit .env then re-run 'pm2 restart ek-trip' to apply changes."
  echo ""
  read -r -p "  Press Enter to continue (Ctrl+C to edit .env first)..."
fi

# ── 3. Install dependencies ────────────────────────────────────────────────────
echo "[3/5] Installing dependencies..."
npm ci --legacy-peer-deps --silent

# ── 4. Build ───────────────────────────────────────────────────────────────────
echo "[4/5] Building Next.js app..."
npm run build

# ── 5. Start with PM2 ─────────────────────────────────────────────────────────
echo "[5/5] Starting with PM2..."
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2 --silent
fi

# Stop any existing instance cleanly
pm2 stop ek-trip  2>/dev/null || true
pm2 delete ek-trip 2>/dev/null || true

# Start production server
# Next.js reads .env automatically in production
PORT=3000 pm2 start npm --name "ek-trip" -- start
pm2 save

# Configure PM2 to restart on server reboot
# (writes a startup script appropriate for this system's init)
pm2 startup --no-daemon 2>/dev/null | grep "sudo\|systemctl\|init" | head -1 | bash 2>/dev/null \
  || echo "  ℹ  Run 'pm2 startup' manually to enable auto-start on reboot."

# ── Done ───────────────────────────────────────────────────────────────────────
LAN_IP=$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}' || echo "your-server-ip")

echo ""
echo "✓  Dashboard is running"
echo ""
echo "   http://localhost:3000"
echo "   http://${LAN_IP}:3000   ← use this on your phone / other devices"
echo ""
echo "Useful commands:"
echo "   pm2 logs ek-trip          tail live logs"
echo "   pm2 restart ek-trip       restart (e.g. after editing .env)"
echo "   pm2 stop ek-trip          stop"
echo "   pm2 status                show all processes"
echo ""
echo "To update later:"
echo "   git pull && npm ci --legacy-peer-deps && npm run build && pm2 restart ek-trip"
