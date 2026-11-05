-- Agenda Harian BK
-- Rencana layanan BK per periode dan per guru BK, terpisah dari layanan_bk (realisasi).

CREATE TABLE IF NOT EXISTS `agenda_bk` (
  `id_agenda` int(10) NOT NULL AUTO_INCREMENT,
  `tahun` int(10) NOT NULL,
  `semester` int(10) NOT NULL,
  `id_user` int(10) NOT NULL COMMENT 'Guru BK',
  `tanggal` date NOT NULL,
  `waktu` varchar(100) DEFAULT NULL COMMENT 'Contoh: 08.30-09.15 (1 JP, dalam kelas)',
  `jenis_kegiatan` varchar(255) NOT NULL,
  `bidang` set('pribadi','sosial','belajar','karir') NOT NULL DEFAULT '',
  `sasaran` text,
  `hasil` text,
  `tindak_lanjut` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_agenda`),
  KEY `idx_periode` (`tahun`,`semester`,`deleted_at`),
  KEY `idx_user` (`id_user`),
  KEY `idx_tanggal` (`tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
