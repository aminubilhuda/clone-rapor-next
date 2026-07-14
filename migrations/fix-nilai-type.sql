-- ============================================================
-- Migration: Fix nilai column type from INT/TINYINT to DECIMAL(5,2)
-- Safe dijalankan berkali-kali
-- ============================================================

-- ========================
-- 1. nilai_formatif
-- ========================

SET @sql = (
SELECT
IF(
    DATA_TYPE IN ('int','tinyint'),
    'ALTER TABLE nilai_formatif
        MODIFY COLUMN nilai DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        MODIFY COLUMN middle INT(10) NOT NULL DEFAULT 0',
    'SELECT "nilai_formatif skipped"'
)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA=DATABASE()
AND TABLE_NAME='nilai_formatif'
AND COLUMN_NAME='nilai'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================
-- 2. nilai_sumatif_ph
-- ========================

SET @sql = (
SELECT
IF(
    DATA_TYPE IN ('int','tinyint'),
    'ALTER TABLE nilai_sumatif_ph
        MODIFY COLUMN nilai DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        MODIFY COLUMN middle INT(10) NOT NULL DEFAULT 0',
    'SELECT "nilai_sumatif_ph skipped"'
)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA=DATABASE()
AND TABLE_NAME='nilai_sumatif_ph'
AND COLUMN_NAME='nilai'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================
-- 3. nilai_sumatif_ts
-- ========================

SET @sql = (
SELECT
IF(
    DATA_TYPE IN ('int','tinyint'),
    'ALTER TABLE nilai_sumatif_ts
        MODIFY COLUMN nilai DECIMAL(5,2) NOT NULL DEFAULT 0.00',
    'SELECT "nilai_sumatif_ts skipped"'
)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA=DATABASE()
AND TABLE_NAME='nilai_sumatif_ts'
AND COLUMN_NAME='nilai'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================
-- 4. nilai_sumatif_as
-- ========================

SET @sql = (
SELECT
IF(
    DATA_TYPE IN ('int','tinyint'),
    'ALTER TABLE nilai_sumatif_as
        MODIFY COLUMN nilai DECIMAL(5,2) NOT NULL DEFAULT 0.00',
    'SELECT "nilai_sumatif_as skipped"'
)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA=DATABASE()
AND TABLE_NAME='nilai_sumatif_as'
AND COLUMN_NAME='nilai'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;