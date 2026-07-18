#!/usr/bin/env bash
# ponytail: one-command update for aapanel + PM2 self-hosted server.
# Jalankan di server: bash deploy.sh
set -euo pipefail

echo "==> Update dimulai..."

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo "==> [1/5] Pull latest code"
git pull --ff-only

echo "==> [2/5] Install dependencies (clean)"
npm ci

echo "==> [3/5] Build"
npm run build

echo "==> [4/5] Apply pending DB migrations"
bash scripts/db-migrate.sh || echo "!! migrasi dilewati (lihat pesan di atas)"

echo "==> [5/5] Restart app via PM2"
# ponytail: pakai ecosystem agar env dari .env.local terbawa; fallback ke reload by name
if [ -f ecosystem.config.js ]; then
  pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js
else
  pm2 reload clone-rapor-next || pm2 restart clone-rapor-next
fi

echo "==> Selesai. Cek: pm2 status"
