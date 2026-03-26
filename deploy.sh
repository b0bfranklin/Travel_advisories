#!/usr/bin/env bash
# ==============================================================================
# EK Trip Dashboard — deploy script for Ubuntu 24.04
#
# HOW TO USE ON A FRESH SERVER:
#   1.  sudo apt-get update && sudo apt-get install -y git
#   2.  git clone https://github.com/b0bfranklin/Travel_advisories.git tripwatch
#   3.  cd tripwatch && git checkout claude/travel-disruption-phase-1-Pf1gd
#   4.  bash deploy.sh
# ==============================================================================
set -euo pipefail

echo "=== EK Trip Dashboard — Ubuntu 24.04 setup ==="

# [1/4] Install Docker + compose plugin
echo "[1/4] Installing Docker..."
sudo apt-get update -qq
sudo apt-get install -y -qq docker.io docker-compose-plugin
sudo systemctl enable --now docker
# Add current user to docker group (takes effect on next login)
sudo usermod -aG docker "$USER" 2>/dev/null || true

# [2/4] Set up .env
echo "[2/4] Checking environment config..."
if [ ! -f .env ]; then
  cp .env.local.example .env
  echo ""
  echo "  .env created. You can optionally add API keys:"
  echo "    OPENWEATHERMAP_API_KEY  — live weather  (free: openweathermap.org)"
  echo "    AVIATIONSTACK_API_KEY   — live flight status (free: aviationstack.com)"
  echo "  The app works without keys — shows scheduled times + static advisories."
  echo ""
  read -r -p "  Press Enter to continue (Ctrl+C to edit .env first)..."
fi

# [3/4] Build — use sudo because usermod group change needs re-login to take effect
echo "[3/4] Building Docker image (~2 min first time)..."
sudo docker compose build

# [4/4] Start
echo "[4/4] Starting dashboard..."
sudo docker compose up -d

# Grab the server's LAN IP for easy access from other devices
LAN_IP=$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}' || echo "your-server-ip")

echo ""
echo "✓  Dashboard running at:"
echo "     http://localhost:3000        (on this machine)"
echo "     http://${LAN_IP}:3000   (from your phone / other devices on the same network)"
echo ""
echo "Useful commands:"
echo "  sudo docker compose logs -f        # tail logs"
echo "  sudo docker compose restart        # restart (e.g. after editing .env)"
echo "  sudo docker compose down           # stop"
echo ""
echo "After logging out and back in, you can drop 'sudo' from the docker commands."
