# Migrations

Taruh file `.sql` di folder ini untuk perubahan skema database.

Aturan:
- Nama file urut, contoh: `0001_add_kktp.sql`, `0002_fix_nilai.sql`.
- Hanya file yang cocok pola `NNNN_*.sql` yang dijalankan `scripts/db-migrate.sh`
  (dipanggil otomatis oleh `deploy.sh`); file dump/backup tidak akan dieksekusi.
- Tracking via `migrations/.applied`. File yang sudah masuk `.applied` tidak dijalankan ulang.
- Idempoten: aman dijalankan berulang. Jangan edit file yang sudah masuk `.applied`.
- MySQL 8 **tidak mendukung** `ADD COLUMN IF NOT EXISTS` (itu MariaDB). Tulis migrasi
  idempoten dengan cek `information_schema` + `PREPARE/EXECUTE` seperti `0001_api_keys_role_and_hash.sql`.
- Selalu backup database sebelum deploy.
