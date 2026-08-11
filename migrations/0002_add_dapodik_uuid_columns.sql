-- ============================================================================
-- Migration: 0002_add_dapodik_uuid_columns.sql
-- Deskripsi: Menambahkan kolom UUID Dapodik ke tabel-tabel utama
--            untuk mempermudah sinkronisasi data dari Dapodik.
-- Idempotent: Aman dijalankan berulang kali.
-- ============================================================================

-- Helper: Tambah kolom jika belum ada (MySQL 8.0 compatible)
DELIMITER $$

DROP PROCEDURE IF EXISTS add_column_if_not_exists$$
CREATE PROCEDURE add_column_if_not_exists(
    IN p_table VARCHAR(64),
    IN p_column VARCHAR(64),
    IN p_def TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table
          AND COLUMN_NAME = p_column
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- 1. TABEL SEKOLAH — Tambah 12 kolom
-- ============================================================================
CALL add_column_if_not_exists('sekolah', 'sekolah_id_dapodik', "varchar(36) DEFAULT NULL AFTER `id_sekolah`");
CALL add_column_if_not_exists('sekolah', 'nss', "varchar(20) DEFAULT NULL AFTER `npsn`");
CALL add_column_if_not_exists('sekolah', 'status_sekolah', "varchar(10) DEFAULT NULL AFTER `bentuk_sekolah`");
CALL add_column_if_not_exists('sekolah', 'alamat_jalan', "text DEFAULT NULL AFTER `yayasan`");
CALL add_column_if_not_exists('sekolah', 'rt', "varchar(5) DEFAULT NULL AFTER `alamat_jalan`");
CALL add_column_if_not_exists('sekolah', 'rw', "varchar(5) DEFAULT NULL AFTER `rt`");
CALL add_column_if_not_exists('sekolah', 'kode_wilayah', "varchar(20) DEFAULT NULL AFTER `rw`");
CALL add_column_if_not_exists('sekolah', 'kode_pos', "varchar(10) DEFAULT NULL AFTER `kode_wilayah`");
CALL add_column_if_not_exists('sekolah', 'nomor_fax', "varchar(20) DEFAULT NULL AFTER `kontak`");
CALL add_column_if_not_exists('sekolah', 'is_sks', "tinyint(1) DEFAULT 0 AFTER `website`");
CALL add_column_if_not_exists('sekolah', 'lintang', "varchar(30) DEFAULT NULL AFTER `provinsi`");
CALL add_column_if_not_exists('sekolah', 'bujur', "varchar(30) DEFAULT NULL AFTER `lintang`");

-- ============================================================================
-- 2. TABEL SISWA — Tambah 7 kolom
-- ============================================================================
CALL add_column_if_not_exists('siswa', 'peserta_didik_id_dapodik', "varchar(36) DEFAULT NULL AFTER `id_siswa`");
CALL add_column_if_not_exists('siswa', 'registrasi_id_dapodik', "varchar(36) DEFAULT NULL AFTER `peserta_didik_id_dapodik`");
CALL add_column_if_not_exists('siswa', 'nik', "varchar(20) DEFAULT NULL AFTER `nisn`");
CALL add_column_if_not_exists('siswa', 'tinggi_badan', "int DEFAULT NULL AFTER `anak_ke`");
CALL add_column_if_not_exists('siswa', 'berat_badan', "int DEFAULT NULL AFTER `tinggi_badan`");
CALL add_column_if_not_exists('siswa', 'email', "varchar(100) DEFAULT NULL AFTER `berat_badan`");
CALL add_column_if_not_exists('siswa', 'kebutuhan_khusus', "varchar(50) DEFAULT 'Tidak ada' AFTER `jenis_siswa`");

-- ============================================================================
-- 3. TABEL USERS — Tambah 5 kolom
-- ============================================================================
CALL add_column_if_not_exists('users', 'ptk_id_dapodik', "varchar(36) DEFAULT NULL AFTER `id_user`");
CALL add_column_if_not_exists('users', 'pengguna_id_dapodik', "varchar(36) DEFAULT NULL AFTER `ptk_id_dapodik`");
CALL add_column_if_not_exists('users', 'peran_id_str', "varchar(50) DEFAULT NULL AFTER `jabatan`");
CALL add_column_if_not_exists('users', 'tanggal_lahir', "date DEFAULT NULL AFTER `agama`");
CALL add_column_if_not_exists('users', 'nik', "varchar(20) DEFAULT NULL AFTER `nuptk`");

-- ============================================================================
-- 4. TABEL KELAS — Tambah 4 kolom
-- ============================================================================
CALL add_column_if_not_exists('kelas', 'rombongan_belajar_id_dapodik', "varchar(36) DEFAULT NULL AFTER `id_kelas`");
CALL add_column_if_not_exists('kelas', 'kurikulum_id_dapodik', "int DEFAULT NULL AFTER `id_kompetensi_keahlian`");
CALL add_column_if_not_exists('kelas', 'jurusan_id_dapodik', "varchar(10) DEFAULT NULL AFTER `kurikulum_id_dapodik`");
CALL add_column_if_not_exists('kelas', 'ptk_id_wali_dapodik', "varchar(36) DEFAULT NULL AFTER `jurusan_id_dapodik`");

-- ============================================================================
-- 5. TABEL SISWA_KELAS — Tambah 2 kolom
-- ============================================================================
CALL add_column_if_not_exists('siswa_kelas', 'anggota_rombel_id_dapodik', "varchar(36) DEFAULT NULL AFTER `id_siswa`");
CALL add_column_if_not_exists('siswa_kelas', 'jenis_pendaftaran_id', "varchar(5) DEFAULT NULL AFTER `anggota_rombel_id_dapodik`");

-- ============================================================================
-- 6. TABEL MAPEL — Tambah 7 kolom
-- ============================================================================
CALL add_column_if_not_exists('mapel', 'mata_pelajaran_id_dapodik', "int DEFAULT NULL AFTER `id_mapel`");
CALL add_column_if_not_exists('mapel', 'pilihan_sekolah', "tinyint(1) DEFAULT 0 AFTER `s_mapel`");
CALL add_column_if_not_exists('mapel', 'pilihan_buku', "tinyint(1) DEFAULT 0 AFTER `pilihan_sekolah`");
CALL add_column_if_not_exists('mapel', 'pilihan_kepengawasan', "tinyint(1) DEFAULT 0 AFTER `pilihan_buku`");
CALL add_column_if_not_exists('mapel', 'pilihan_evaluasi', "tinyint(1) DEFAULT 0 AFTER `pilihan_kepengawasan`");
CALL add_column_if_not_exists('mapel', 'jurusan_id_dapodik', "varchar(10) DEFAULT NULL AFTER `pilihan_evaluasi`");
CALL add_column_if_not_exists('mapel', 'last_sync', "datetime DEFAULT NULL AFTER `jurusan_id_dapodik`");

-- ============================================================================
-- 7. TABEL MAPEL_KELAS — Tambah 4 kolom
-- ============================================================================
CALL add_column_if_not_exists('mapel_kelas', 'pembelajaran_id_dapodik', "varchar(36) DEFAULT NULL AFTER `id_mapel_kelas`");
CALL add_column_if_not_exists('mapel_kelas', 'rombongan_belajar_id_dapodik', "varchar(36) DEFAULT NULL AFTER `pembelajaran_id_dapodik`");
CALL add_column_if_not_exists('mapel_kelas', 'jam_mengajar_per_minggu', "int DEFAULT 0 AFTER `id_user`");
CALL add_column_if_not_exists('mapel_kelas', 'status_di_kurikulum', "varchar(10) DEFAULT NULL AFTER `jam_mengajar_per_minggu`");

-- ============================================================================
-- 8. TABEL KELAS_WALI — Tambah 1 kolom (opsional)
-- ============================================================================
CALL add_column_if_not_exists('kelas_wali', 'ptk_id_dapodik', "varchar(36) DEFAULT NULL AFTER `id_user`");

-- ============================================================================
-- 9. TABEL KEPALA_SEKOLAH — Tambah 1 kolom (opsional)
-- ============================================================================
CALL add_column_if_not_exists('kepala_sekolah', 'ptk_id_dapodik', "varchar(36) DEFAULT NULL AFTER `nuptk`");

-- ============================================================================
-- 10. TABEL KOMPETENSI_KEAHLIAN — Tambah 1 kolom (opsional)
-- ============================================================================
CALL add_column_if_not_exists('kompetensi_keahlian', 'jurusan_id_dapodik', "varchar(10) DEFAULT NULL AFTER `id_kompetensi_keahlian`");

-- ============================================================================
-- 11. TABEL KURIKULUM — Tambah 1 kolom (opsional)
-- ============================================================================
CALL add_column_if_not_exists('kurikulum', 'kurikulum_id_dapodik', "int DEFAULT NULL AFTER `id_kurikulum`");

-- ============================================================================
-- 12. TABEL BARU: RIWAYAT_PENDIDIKAN_FORMAL (opsional)
-- Menyimpan riwayat pendidikan guru dari endpoint getGtk Dapodik.
-- ============================================================================
CREATE TABLE IF NOT EXISTS `riwayat_pendidikan_formal` (
  `id_riwayat` int NOT NULL AUTO_INCREMENT,
  `riwayat_id_dapodik` varchar(36) NOT NULL,
  `ptk_id_dapodik` varchar(36) NOT NULL,
  `satuan_pendidikan` varchar(200) DEFAULT NULL,
  `fakultas` varchar(200) DEFAULT NULL,
  `kependidikan` varchar(5) DEFAULT NULL,
  `tahun_masuk` varchar(4) DEFAULT NULL,
  `tahun_lulus` varchar(4) DEFAULT NULL,
  `nim` varchar(50) DEFAULT NULL,
  `status_kuliah` varchar(5) DEFAULT NULL,
  `semester` varchar(5) DEFAULT NULL,
  `ipk` varchar(10) DEFAULT NULL,
  `prodi` varchar(100) DEFAULT NULL,
  `bidang_studi` varchar(200) DEFAULT NULL,
  `jenjang_pendidikan` varchar(50) DEFAULT NULL,
  `gelar_akademik` varchar(100) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_riwayat`),
  UNIQUE KEY `uk_riwayat_dapodik` (`riwayat_id_dapodik`),
  KEY `idx_ptk_dapodik` (`ptk_id_dapodik`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Cleanup: Hapus helper procedure
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

-- ============================================================================
-- SELESAI
-- Total: 7 tabel wajib + 4 tabel opsional + 1 tabel baru
-- Total kolom baru: ~43 kolom + 1 tabel baru (16 kolom)
-- ============================================================================
