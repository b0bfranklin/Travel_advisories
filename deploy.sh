#!/usr/bin/env bash
set -euo pipefail

echo "=== EK Trip Dashboard — Ubuntu 24.04 setup ==="

# Install Docker
echo "[1/4] Installing Docker..."
sudo apt-get update -qq
sudo apt-get install -y -qq docker.io docker-compose-plugin git curl
sudo systemctl enable --now docker
# Allow current user to run docker without sudo (re-login required)
sudo usermod -aG docker "$USER"

# Set up .env if not already present
echo "[2/4] Checking environment config..."
if [ ! -f .env ]; then
  if [ -f .env.local.example ]; then
    cp .env.local.example .env
    echo ""
    echo "  *** Edit .env with your API keys before continuing ***"
    echo "  Minimum required: nothing — the app runs without keys using static data."
    echo "  Recommended:      OPENWEATHERMAP_API_KEY (free at openweathermap.org)"
    echo "                    AVIATIONSTACK_API_KEY  (free tier at aviationstack.com)"
    echo ""
    read -r -p "Press Enter when .env is ready (or Ctrl+C to edit it now)..."
  fi
fi

# Build
echo "[3/4] Building Docker image (this takes ~2 minutes first time)..."
docker compose build

# Start
echo "[4/4] Starting dashboard..."
docker compose up -d

echo ""
echo "✓ Dashboard is running at http://localhost:3000"
echo "  If accessing from another device on the same network, use this machine's IP address."
echo ""
echo "Useful commands:"
echo "  docker compose logs -f       # view logs"
echo "  docker compose restart       # restart after .env changes"
echo "  docker compose down          # stop"
