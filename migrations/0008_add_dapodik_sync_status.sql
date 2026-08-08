-- 0008_add_dapodik_sync_status.sql
-- Status sinkronisasi DAPODIK yang sedang berjalan (untuk banner peringatan).
-- Safe to run multiple times — checks before adding.

SET @dbname = (SELECT DATABASE());

-- Kolom syncing
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'dapodik_config' AND COLUMN_NAME = 'syncing';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `dapodik_config` ADD COLUMN `syncing` TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kolom sync_started_at
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'dapodik_config' AND COLUMN_NAME = 'sync_started_at';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `dapodik_config` ADD COLUMN `sync_started_at` DATETIME NULL DEFAULT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kolom sync_progress
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'dapodik_config' AND COLUMN_NAME = 'sync_progress';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `dapodik_config` ADD COLUMN `sync_progress` VARCHAR(100) NULL DEFAULT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
