-- Menggabungkan PTK duplikat yang dibuat sinkronisasi Dapodik 2026-08-11.
-- Nama lokal bergelar dipertahankan sebagai akun kanonik; UUID/metadata
-- Dapodik dan seluruh relasi dipindahkan dari akun duplikat lalu duplikat
-- dinonaktifkan dengan soft delete.

START TRANSACTION;

CREATE TEMPORARY TABLE dapodik_ptk_merge (
  source_id INT PRIMARY KEY,
  target_id INT NOT NULL
);

INSERT INTO dapodik_ptk_merge (source_id, target_id) VALUES
  (44, 12), (47, 20), (48, 37), (50, 25), (51, 23),
  (52, 14), (55, 15), (56, 22), (58, 7), (59, 11),
  (60, 28), (61, 19), (62, 24), (63, 17), (65, 10),
  (66, 5), (67, 27), (68, 3), (69, 18), (71, 13);

UPDATE users target
JOIN dapodik_ptk_merge m ON m.target_id = target.id_user
JOIN users source ON source.id_user = m.source_id
SET target.kelamin = source.kelamin,
    target.agama = source.agama,
    target.nip = COALESCE(NULLIF(source.nip, ''), target.nip),
    target.nuptk = COALESCE(NULLIF(source.nuptk, ''), target.nuptk),
    target.id_kepegawaian = source.id_kepegawaian,
    target.ijazah = source.ijazah,
    target.id_tugas_tambahan = source.id_tugas_tambahan,
    target.ptk_id_dapodik = source.ptk_id_dapodik,
    target.nik = COALESCE(NULLIF(source.nik, ''), target.nik),
    target.tanggal_lahir = COALESCE(source.tanggal_lahir, target.tanggal_lahir)
WHERE target.deleted_at IS NULL
  AND source.deleted_at IS NULL;

UPDATE kelas_wali rel
JOIN dapodik_ptk_merge m ON m.source_id = rel.id_user
SET rel.id_user = m.target_id;

UPDATE mapel_kelas rel
JOIN dapodik_ptk_merge m ON m.source_id = rel.id_user
SET rel.id_user = m.target_id;

UPDATE pembina_eskul rel
JOIN dapodik_ptk_merge m ON m.source_id = rel.id_user
SET rel.id_user = m.target_id;

UPDATE pembina_organisasi rel
JOIN dapodik_ptk_merge m ON m.source_id = rel.id_user
SET rel.id_user = m.target_id;

UPDATE piket_harian rel
JOIN dapodik_ptk_merge m ON m.source_id = rel.id_user
SET rel.id_user = m.target_id;

UPDATE prakerin rel
JOIN dapodik_ptk_merge m ON m.source_id = rel.id_user
SET rel.id_user = m.target_id;

UPDATE proyek_kelas rel
JOIN dapodik_ptk_merge m ON m.source_id = rel.id_user
SET rel.id_user = m.target_id;

UPDATE tujuan_pembelajaran rel
JOIN dapodik_ptk_merge m ON m.source_id = rel.id_user
SET rel.id_user = m.target_id;

UPDATE users source
JOIN dapodik_ptk_merge m ON m.source_id = source.id_user
SET source.deleted_at = NOW()
WHERE source.deleted_at IS NULL;

DROP TEMPORARY TABLE dapodik_ptk_merge;

COMMIT;
