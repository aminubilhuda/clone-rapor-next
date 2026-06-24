-- ============================================================
-- Migration: Add deleted_at column + index to ALL tables
-- Run: mysql -u root -proot abdinega_db_raporkm < this-file.sql
-- Or import via phpMyAdmin (tab Import)
-- Safe to run multiple times — checks before adding.
-- ============================================================

SET @dbname = (SELECT DATABASE());

DELIMITER //

CREATE PROCEDURE add_deleted_at_to_all_tables()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE tbl VARCHAR(100);
  DECLARE col_exists INT;
  DECLARE idx_exists INT;

  DECLARE cur CURSOR FOR
    SELECT TABLE_NAME FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = @dbname AND TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN cur;

  read_loop: LOOP
    FETCH cur INTO tbl;
    IF done THEN LEAVE read_loop; END IF;

    -- Add column if missing
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = tbl AND COLUMN_NAME = 'deleted_at';

    IF col_exists = 0 THEN
      SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `deleted_at` datetime NULL DEFAULT NULL');
      PREPARE stmt FROM @sql;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END IF;

    -- Add index if missing (checked independently, so if column existed but index was dropped, we still add it)
    SELECT COUNT(*) INTO idx_exists
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = tbl AND INDEX_NAME = 'idx_deleted_at';

    IF idx_exists = 0 THEN
      SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD INDEX idx_deleted_at (`deleted_at`)');
      PREPARE stmt FROM @sql;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    END IF;
  END LOOP;

  CLOSE cur;
END //

DELIMITER ;

CALL add_deleted_at_to_all_tables();
DROP PROCEDURE IF EXISTS add_deleted_at_to_all_tables;
