SET @has_role := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'api_keys' AND COLUMN_NAME = 'role'
);
SET @sql := IF(@has_role = 0,
  "ALTER TABLE api_keys ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'tu_admin' AFTER is_active",
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE api_keys SET key_value = SHA2(key_value, 256) WHERE CHAR_LENGTH(key_value) <> 64;
