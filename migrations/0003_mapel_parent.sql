-- Kolom parent_id pada mapel (self-reference, maksimal 1 level).
SET @has_column := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mapel'
    AND COLUMN_NAME = 'parent_id'
);
SET @sql := IF(@has_column = 0,
  'ALTER TABLE mapel ADD COLUMN parent_id INT NULL AFTER id_mapel',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index untuk lookup anak.
SET @has_index := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mapel'
    AND INDEX_NAME = 'idx_mapel_parent'
);
SET @sql := IF(@has_index = 0,
  'ALTER TABLE mapel ADD INDEX idx_mapel_parent (parent_id)',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign key: hapus induk -> anak menjadi mapel biasa.
SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mapel'
    AND CONSTRAINT_NAME = 'fk_mapel_parent'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql := IF(@has_fk = 0,
  'ALTER TABLE mapel ADD CONSTRAINT fk_mapel_parent FOREIGN KEY (parent_id) REFERENCES mapel(id_mapel) ON DELETE SET NULL',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
