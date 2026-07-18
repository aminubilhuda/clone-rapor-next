# Migrations

Taruh file `.sql` di folder ini untuk perubahan skema database.

Aturan:
- Nama file urut, contoh: `0001_add_kktp.sql`, `0002_fix_nilai.sql`.
- `scripts/db-migrate.sh` (dipanggil otomatis oleh `deploy.sh`) hanya menjalankan
  file yang **belum pernah diterapkan** (tracking via `.applied`).
- Idempoten: aman dijalankan berulang. Jangan edit file yang sudah masuk `.applied`.
- Tulis SQL yang aman dijalankan ulang (pakai `IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, dsb).
