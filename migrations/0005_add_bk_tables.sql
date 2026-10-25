-- Modul Bimbingan Konseling (BK) v2.2
-- Satu sesi layanan = 1 baris `layanan_bk` + N baris `layanan_bk_peserta`.
-- Field sesi di header; field per siswa di peserta.

CREATE TABLE IF NOT EXISTS `layanan_bk` (
  `id_layanan` int(10) NOT NULL AUTO_INCREMENT,
  `tahun` int(10) NOT NULL,
  `semester` int(10) NOT NULL,
  `id_user` int(10) NOT NULL COMMENT 'Guru BK pemberi layanan',
  `jenis_layanan` enum(
    'konseling_individu','konseling_kelompok','mediasi','konsultasi',
    'catatan_anekdot','konferensi_kasus','home_visit','referal'
  ) NOT NULL,
  `id_kelas` int(10) NOT NULL,
  `tanggal` date NOT NULL,
  `jam` time DEFAULT NULL,
  `agenda` varchar(255) DEFAULT NULL,
  `pelaksana` varchar(255) DEFAULT NULL COMMENT 'Mediasi',
  `tempat` varchar(255) DEFAULT NULL COMMENT 'Catatan anekdot',
  `pihak_terlibat` text COMMENT 'Konferensi kasus',
  `tujuan` text COMMENT 'Home visit',
  `petugas` varchar(255) DEFAULT NULL COMMENT 'Home visit',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_layanan`),
  KEY `idx_periode` (`tahun`,`semester`,`deleted_at`),
  KEY `idx_kelas` (`id_kelas`),
  KEY `idx_user` (`id_user`),
  KEY `idx_jenis` (`jenis_layanan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `layanan_bk_peserta` (
  `id_layanan` int(10) NOT NULL,
  `id_siswa` int(10) NOT NULL,
  `bidang_bimbingan` set('pribadi','sosial','belajar','karir') NOT NULL DEFAULT '',
  `permasalahan` text,
  `arahan` text,
  `tindak_lanjut` text,
  `topik` varchar(255) DEFAULT NULL,
  `pelaksana_dituju` varchar(255) DEFAULT NULL,
  `hasil` text,
  `peristiwa` text,
  `informan` varchar(255) DEFAULT NULL,
  `pembinaan` text,
  `referal` text,
  `dirujuk_ke` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_layanan`,`id_siswa`),
  KEY `idx_siswa` (`id_siswa`),
  CONSTRAINT `fk_lbp_layanan` FOREIGN KEY (`id_layanan`)
    REFERENCES `layanan_bk` (`id_layanan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
