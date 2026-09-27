#!/usr/bin/env bash
# Pindahkan uploads dari public/uploads (disajikan statis) ke storage/uploads.
# Idempoten: lewati bila public/uploads sudah tidak ada.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$APP_DIR/public/uploads"
DST="$APP_DIR/storage/uploads"

if [ ! -d "$SRC" ]; then
  echo "==> uploads: tidak ada public/uploads, lewati"
  exit 0
fi

mkdir -p "$DST"
STAMP="$(date +%Y%m%d-%H%M%S)"
tar -czf "$DST/uploads-backup-$STAMP.tgz" -C "$SRC" . 2>/dev/null || true

cp -a "$SRC/." "$DST/"

SRC_COUNT=$(find "$SRC" -type f | wc -l | tr -d ' ')
DST_COUNT=$(find "$DST" -type f -not -name 'uploads-backup-*' | wc -l | tr -d ' ')

if [ "$SRC_COUNT" != "$DST_COUNT" ]; then
  echo "!! jumlah file tidak sama (sumber=$SRC_COUNT tujuan=$DST_COUNT), public/uploads TIDAK dihapus"
  exit 1
fi

rm -rf "$SRC"
echo "==> uploads dipindahkan ke storage/uploads ($DST_COUNT file)"
