-- Satu catatan wali untuk setiap siswa, kelas, dan periode.
-- Jika data lama ganda, pertahankan record aktif terbaru.

DELETE lama
FROM catatan_wali lama
JOIN catatan_wali terbaru
  ON terbaru.tahun = lama.tahun
 AND terbaru.semester = lama.semester
 AND terbaru.id_kelas = lama.id_kelas
 AND terbaru.id_siswa = lama.id_siswa
 AND (
   (lama.deleted_at IS NOT NULL AND terbaru.deleted_at IS NULL)
   OR (
     (lama.deleted_at IS NULL) = (terbaru.deleted_at IS NULL)
     AND lama.id_catatan < terbaru.id_catatan
   )
 );

SET @catatan_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'catatan_wali'
    AND INDEX_NAME = 'uq_catatan_wali_periode_siswa'
);

SET @catatan_index_sql = IF(
  @catatan_index_exists = 0,
  'ALTER TABLE catatan_wali ADD UNIQUE INDEX uq_catatan_wali_periode_siswa (tahun, semester, id_kelas, id_siswa)',
  'SELECT 1'
);

PREPARE catatan_index_stmt FROM @catatan_index_sql;
EXECUTE catatan_index_stmt;
DEALLOCATE PREPARE catatan_index_stmt;
