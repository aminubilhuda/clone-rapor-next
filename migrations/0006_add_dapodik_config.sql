-- 0006_add_dapodik_config.sql
-- Konfigurasi koneksi webservice DAPODIK (single row, id = 1)
CREATE TABLE IF NOT EXISTS `dapodik_config` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `npsn` varchar(20) NOT NULL,
  `last_sync_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `dapodik_config` (`id`, `url`, `token`, `npsn`)
SELECT 1, 'http://192.168.11.207:5774/WebService/', 'ddLiq1Go4JqD3pO', '20505005'
WHERE NOT EXISTS (SELECT 1 FROM `dapodik_config` WHERE `id` = 1);

-- Log hasil sinkronisasi per entitas
CREATE TABLE IF NOT EXISTS `dapodik_log` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `endpoint` varchar(50) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `inserted` int(10) NOT NULL DEFAULT 0,
  `updated` int(10) NOT NULL DEFAULT 0,
  `skipped` int(10) NOT NULL DEFAULT 0,
  `error_msg` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
