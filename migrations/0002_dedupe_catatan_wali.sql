DELETE cw FROM catatan_wali cw
JOIN (
  SELECT MAX(id_catatan) AS keep_id, tahun, semester, id_kelas, id_siswa
  FROM catatan_wali
  GROUP BY tahun, semester, id_kelas, id_siswa
) k
  ON cw.tahun = k.tahun
 AND cw.semester = k.semester
 AND cw.id_kelas = k.id_kelas
 AND cw.id_siswa = k.id_siswa
WHERE cw.id_catatan <> k.keep_id;

SET @has_uniq := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'catatan_wali'
    AND INDEX_NAME = 'uniq_catatan_periode'
);
SET @sql := IF(@has_uniq = 0,
  'ALTER TABLE catatan_wali ADD UNIQUE KEY uniq_catatan_periode (tahun, semester, id_kelas, id_siswa)',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
