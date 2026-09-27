#!/usr/bin/env bash
# ponytail: one-command update for aapanel + PM2 self-hosted server.
# Jalankan di server: bash deploy.sh
set -euo pipefail

echo "==> Update dimulai..."

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

read_env() {
  [ -f .env.local ] || return 0
  grep -E "^$1=" .env.local | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'"
}

DEPLOY_MANAGER="${DEPLOY_MANAGER:-$(read_env DEPLOY_MANAGER)}"
DEPLOY_MANAGER="${DEPLOY_MANAGER:-pm2}"

echo "==> [1/5] Pull latest code"
git pull --ff-only

echo "==> [2/5] Install dependencies (clean)"
npm ci

echo "==> [3/5] Build"
npm run build

echo "==> [4/5] Apply pending DB migrations"
mkdir -p storage/uploads
bash scripts/db-migrate.sh || echo "!! migrasi dilewati (lihat pesan di atas)"
bash scripts/migrate-uploads.sh || echo "!! migrasi uploads dilewati (lihat pesan di atas)"

echo "==> [5/5] Restart app (manager: $DEPLOY_MANAGER)"
if [ "$DEPLOY_MANAGER" = "aapanel" ]; then
  echo "!! Mode aaPanel: proses PM2 dilewati."
  echo "!! Restart aplikasi dari panel: Website > Node Project > clone-rapor-next > Restart"
  echo "!! atau via CLI aaPanel sesuai versi yang terpasang."
elif [ -f ecosystem.config.js ]; then
  pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js
else
  pm2 reload clone-rapor-next || pm2 restart clone-rapor-next
fi

if [ "$DEPLOY_MANAGER" = "aapanel" ]; then
  echo "==> Selesai. Restart Node Project di aaPanel untuk menerapkan build baru."
else
  echo "==> Selesai. Cek: pm2 status"
fi
