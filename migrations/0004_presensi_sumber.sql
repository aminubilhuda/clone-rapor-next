-- Sumber baris presensi:
--   'piket' = absensi harian oleh guru piket
--   'bk'    = koreksi/evaluasi guru BK (selisih) dan data agregat lama
-- Data lama otomatis menjadi 'bk' agar rekap historis tidak berubah.
SET @has_column := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'presensi'
    AND COLUMN_NAME = 'sumber'
);
SET @sql := IF(@has_column = 0,
  'ALTER TABLE presensi ADD COLUMN sumber ENUM(''piket'',''bk'') NOT NULL DEFAULT ''bk'' AFTER jumlah',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_index := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'presensi'
    AND INDEX_NAME = 'idx_presensi_sumber'
);
SET @sql := IF(@has_index = 0,
  'ALTER TABLE presensi ADD INDEX idx_presensi_sumber (tahun, semester, sumber)',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
