#!/usr/bin/env bash
# ponytail: jalankan .sql di migrations/ yang belum pernah diterapkan.
# Tracking via migrations/.applied (nama file per baris). Idempoten: aman dijalankan berulang.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIG_DIR="$APP_DIR/migrations"
APPLIED="$MIG_DIR/.applied"
cd "$APP_DIR"

if [ ! -d "$MIG_DIR" ]; then
  echo "!! folder migrations/ tidak ada, lewati migrasi"
  exit 0
fi

[ -f "$APPLIED" ] || touch "$APPLIED"

# ponytail: baca kredensial dari .env.local (sama yang dipakai aplikasi)
load_env() { [ -f .env.local ] && set -a && . ./.env.local && set +a; }
load_env

if [ -z "${DB_HOST:-}" ] || [ -z "${DB_NAME:-}" ]; then
  echo "!! DB_* tidak ditemukan di .env.local, lewati migrasi"
  exit 0
fi

shopt -s nullglob
files=("$MIG_DIR"/*.sql)
if [ ${#files[@]} -eq 0 ]; then
  echo "==> tidak ada migrasi baru"
  exit 0
fi

for f in "${files[@]}"; do
  name="$(basename "$f")"
  if grep -qxF "$name" "$APPLIED"; then
    continue
  fi
  echo "==> apply $name"
  mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" < "$f" \
    && echo "$name" >> "$APPLIED" \
    || { echo "!! gagal apply $name — henti"; exit 1; }
done

echo "==> migrasi selesai"
