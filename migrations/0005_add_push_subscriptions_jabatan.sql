-- ============================================================
-- Migration: Add jabatan & id_siswa columns to push_subscriptions
-- Run: mysql -u root -proot abdinega_db_raporkm < this-file.sql
-- Safe to run multiple times — checks before adding.
-- ============================================================

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'push_subscriptions' AND COLUMN_NAME = 'jabatan');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE push_subscriptions
    ADD COLUMN jabatan INT NOT NULL DEFAULT 0 AFTER user_id,
    ADD COLUMN id_siswa INT DEFAULT NULL AFTER jabatan,
    ADD INDEX idx_jabatan (jabatan),
    ADD INDEX idx_id_siswa (id_siswa)',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;