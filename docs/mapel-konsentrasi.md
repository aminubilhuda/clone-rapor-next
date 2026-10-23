# Panduan Sub Mapel Konsentrasi Keahlian (Fase F)

Status: berlaku setelah migrasi `0003_mapel_parent.sql` dan kode hierarki mapel ter-deploy.
Berlaku mulai: **Ganjil 2026-2027** (periode aktif saat dokumen ini dibuat).
Periode 2024-2025 dan 2025-2026 **tidak boleh diubah**.

## 1. Konsep

- Mapel konsentrasi (Akuntansi, Bisnis Digital, Rekayasa Perangkat Lunak, Perhotelan, LPKKK) menjadi **induk**: baris judul tanpa nilai dan tanpa capaian.
- Setiap sub-mapel adalah **mapel penuh**: punya guru pengampu, TP, nilai Formatif/PH/TS/AS, dan enrollment siswa sendiri.
- Induk hanya dirender sebagai header jika pada periode itu ada anak yang diikuti siswa. Jika tidak ada anak, mapel dirender seperti biasa (ini yang menjaga rapor periode lama).
- Kedalaman maksimal **1 level**. Sub-mapel tidak boleh punya sub-mapel lagi.
- `id_kelompok` sub-mapel harus sama dengan induk (Kelompok B / Kejuruan).

## 2. Urutan pengerjaan

1. Deploy kode + jalankan migrasi `0003_mapel_parent.sql`.
2. Tentukan induk untuk setiap jurusan.
3. Buat sub-mapel di tabel `mapel`.
4. Buat `mapel_kelas` (guru + kelas) untuk setiap sub-mapel.
5. Pastikan siswa ter-enroll di `mapel_siswa` (otomatis jika lewat UI).
6. Buat/salin TP di `tujuan_pembelajaran` lewat UI guru.
7. Verifikasi dengan query bagian 8.
8. Backup lalu hapus `mapel_kelas` + `mapel_siswa` induk **hanya untuk periode aktif**.
9. Cek rapor HTML dan PDF.

## 3. Menentukan induk

Jalankan:

```sql
SET @tahun := (SELECT tahun FROM sekolah WHERE id_sekolah = 1);
SET @semester := (SELECT semester FROM sekolah WHERE id_sekolah = 1);

SELECT id_mapel, nama_mapel, id_kelompok, urut, parent_id
FROM mapel
WHERE parent_id IS NULL
  AND nama_mapel IN (
    'Akuntansi',
    'Bisnis Digital',
    'Rekayasa Perangkat Lunak',
    'Perhotelan',
    'Layanan Penunjang Kefarmasian Klinis dan Komunitas'
  )
ORDER BY urut;
```

Catat `id_mapel` masing-masing. Jangan mengandalkan ID dari contoh/dokumentasi lama; ID produksi bisa berbeda.

## 4. Tabel `mapel` — sub-mapel

Kolom wajib:

| Kolom | Nilai |
|---|---|
| `id_sekolah` | `1` |
| `id_kelompok` | sama dengan induk (biasanya `2` = Kelompok B / Kejuruan) |
| `parent_id` | `id_mapel` induk |
| `nama_mapel` | nama sub-mapel |
| `s_mapel` | singkatan |
| `urut` | urutan di dalam induk, mulai 1 |
| `deleted_at` | `NULL` |

Template:

```sql
-- Ganti :id_induk dan nilai contoh dengan data sebenarnya.
INSERT INTO mapel (id_sekolah, id_kelompok, parent_id, nama_mapel, s_mapel, urut)
VALUES
  (1, 2, :id_induk, 'Nama Sub Mapel 1', 'SM1', 1),
  (1, 2, :id_induk, 'Nama Sub Mapel 2', 'SM2', 2);
```

Tabel isian (satu baris per sub-mapel):

| Induk | Urut | Nama sub-mapel | Singkatan | Dipakai di kelas |
|---|---|---|---|---|
| Akuntansi | 1 | | | |
| Akuntansi | 2 | | | |
| Bisnis Digital | 1 | | | |
| Bisnis Digital | 2 | | | |
| Rekayasa Perangkat Lunak | 1 | | | |
| Rekayasa Perangkat Lunak | 2 | | | |
| Rekayasa Perangkat Lunak | 3 | | | |
| Perhotelan | 1 | | | |
| Perhotelan | 2 | | | |
| LPKKK | 1 | | | |
| LPKKK | 2 | | | |

Aturan:

- Jangan memberi `parent_id` kepada induk.
- Jangan membuat 3 level.
- Nama boleh sama antar-jurusan selama `parent_id` berbeda.
- Jika mapel dipakai untuk sinkronisasi Dapodik, isi juga `mata_pelajaran_id_dapodik` bila tersedia.

## 5. Tabel `mapel_kelas` — guru pengampu

Kolom wajib:

| Kolom | Nilai |
|---|---|
| `tahun` | tahun aktif (contoh: `3`) |
| `semester` | semester aktif (contoh: `1`) |
| `id_kelas` | id kelas |
| `id_mapel` | id sub-mapel |
| `id_user` | id guru pengampu |
| `deleted_at` | `NULL` |

Template:

```sql
-- Ganti :id_mapel dan :id_user.
INSERT INTO mapel_kelas (tahun, semester, id_kelas, id_mapel, id_user)
SELECT @tahun, @semester, k.id_kelas, :id_mapel, :id_user
FROM kelas k
WHERE k.nama_kelas = 'XI RPL';
```

Tabel isian:

| Sub-mapel | Kelas | Guru pengampu (id_user) |
|---|---|---|
| | XI AK | |
| | XII AK | |
| | XI BD | |
| | XII BD | |
| | XI RPL | |
| | XII RPL | |
| | XI PH | |
| | XII PH | |
| | XI LPKKK | |
| | XII LPKKK | |

Catatan: menambah `mapel_kelas` lewat UI `/tu/mapel-kelas` otomatis mengisi `mapel_siswa` untuk semua siswa aktif di kelas tersebut. Mengubah guru saja tidak mengubah enrollment.

## 6. Tabel `mapel_siswa` — enrollment

Biasanya terisi otomatis. Jika diisi manual:

| Kolom | Nilai |
|---|---|
| `tahun` | tahun aktif |
| `semester` | semester aktif |
| `id_tingkat` | dari `kelas.id_tingkat` |
| `id_kelas` | id kelas |
| `id_mapel` | id sub-mapel |
| `id_siswa` | id siswa |
| `aktif` | `1` |
| `deleted_at` | `NULL` |

Jangan mengisi `mapel_siswa` untuk induk.

## 7. Tabel `tujuan_pembelajaran` — TP

Gunakan UI guru: **Tujuan Pembelajaran → pilih sub-mapel + kelas → Salin TP / Buat TP**. Cara ini lebih aman karena kolom `middle_formatif`, `middle_ph`, dan `formatif_as` wajib terisi.

Jika manual, kolom wajib:

`tahun`, `semester`, `id_tingkat`, `id_kelas`, `id_mapel`, `id_user`, `urut`, `tujuan`, `kktp`, `middle_formatif`, `middle_ph`, `formatif_as`.

## 8. Query verifikasi

Jalankan dalam satu sesi MySQL:

```sql
SET @tahun := (SELECT tahun FROM sekolah WHERE id_sekolah = 1);
SET @semester := (SELECT semester FROM sekolah WHERE id_sekolah = 1);

DROP TEMPORARY TABLE IF EXISTS tmp_induk_submapel;
CREATE TEMPORARY TABLE tmp_induk_submapel (id_mapel INT PRIMARY KEY);
INSERT INTO tmp_induk_submapel (id_mapel)
SELECT DISTINCT parent_id FROM mapel WHERE parent_id IS NOT NULL;

-- 1. Anak yatim (parent tidak ada)
SELECT c.id_mapel, c.nama_mapel
FROM mapel c
LEFT JOIN mapel p ON c.parent_id = p.id_mapel
WHERE c.parent_id IS NOT NULL AND p.id_mapel IS NULL;

-- 2. Tiga level (harus kosong)
SELECT c.id_mapel, c.nama_mapel
FROM mapel c
JOIN mapel p ON c.parent_id = p.id_mapel
WHERE p.parent_id IS NOT NULL;

-- 3. Induk masih punya mapel_kelas di periode aktif (harus 0)
SELECT m.id_mapel, m.nama_mapel, COUNT(mk.id_mapel_kelas) AS jumlah
FROM mapel m
LEFT JOIN mapel_kelas mk
  ON mk.id_mapel = m.id_mapel AND mk.tahun = @tahun AND mk.semester = @semester
WHERE m.id_mapel IN (SELECT id_mapel FROM tmp_induk_submapel)
GROUP BY m.id_mapel, m.nama_mapel;

-- 4. Setiap anak punya siswa (harus > 0)
SELECT m.id_mapel, m.nama_mapel, COUNT(ms.id_siswa) AS siswa
FROM mapel m
LEFT JOIN mapel_siswa ms
  ON ms.id_mapel = m.id_mapel
  AND ms.tahun = @tahun AND ms.semester = @semester AND ms.aktif = 1
WHERE m.parent_id IS NOT NULL
GROUP BY m.id_mapel, m.nama_mapel
ORDER BY m.parent_id, m.urut;

-- 5. Bandingkan jumlah anak dengan mapel_kelas
SELECT m.parent_id, COUNT(DISTINCT m.id_mapel) AS anak,
       COUNT(DISTINCT mk.id_mapel_kelas) AS kelas_mapel
FROM mapel m
LEFT JOIN mapel_kelas mk
  ON mk.id_mapel = m.id_mapel AND mk.tahun = @tahun AND mk.semester = @semester
WHERE m.parent_id IS NOT NULL
GROUP BY m.parent_id;
```

Jika query 1 atau 2 berisi baris, **jangan lanjut**. Perbaiki `parent_id` terlebih dahulu.

## 9. Backup & hapus induk dari periode aktif

**Jangan jalankan sebelum langkah 4-6 selesai dan query verifikasi bersih.**

```sql
SET @tahun := (SELECT tahun FROM sekolah WHERE id_sekolah = 1);
SET @semester := (SELECT semester FROM sekolah WHERE id_sekolah = 1);

DROP TEMPORARY TABLE IF EXISTS tmp_induk_submapel;
CREATE TEMPORARY TABLE tmp_induk_submapel (id_mapel INT PRIMARY KEY);
INSERT INTO tmp_induk_submapel (id_mapel)
SELECT DISTINCT parent_id FROM mapel WHERE parent_id IS NOT NULL;

-- Backup. Jika tabel sudah ada, gunakan nama lain (mis. _v2),
-- jangan DROP backup lama.
CREATE TABLE backup_mapel_kelas_submapel_20261023 AS
SELECT mk.* FROM mapel_kelas mk
JOIN tmp_induk_submapel t ON t.id_mapel = mk.id_mapel
WHERE mk.tahun = @tahun AND mk.semester = @semester;

CREATE TABLE backup_mapel_siswa_submapel_20261023 AS
SELECT ms.* FROM mapel_siswa ms
JOIN tmp_induk_submapel t ON t.id_mapel = ms.id_mapel
WHERE ms.tahun = @tahun AND ms.semester = @semester;

-- Hapus HANYA periode aktif.
DELETE mk FROM mapel_kelas mk
JOIN tmp_induk_submapel t ON t.id_mapel = mk.id_mapel
WHERE mk.tahun = @tahun AND mk.semester = @semester;

DELETE ms FROM mapel_siswa ms
JOIN tmp_induk_submapel t ON t.id_mapel = ms.id_mapel
WHERE ms.tahun = @tahun AND ms.semester = @semester;

DROP TEMPORARY TABLE tmp_induk_submapel;
```

Cek bahwa data lama tidak tersentuh:

```sql
SELECT tahun, semester, COUNT(*) AS jumlah
FROM mapel_kelas
WHERE id_mapel IN (SELECT id_mapel FROM mapel WHERE parent_id IS NOT NULL)
GROUP BY tahun, semester
ORDER BY tahun, semester;
```

Baris tahun 1 dan 2 harus tetap ada dan jumlahnya tidak berubah.

## 10. Format rapor

### Rapor Semester

```
B. Kelompok Mata Pelajaran Kejuruan
   Rekayasa Perangkat Lunak
      1. Basis Data          82   Baik dalam ...
      2. Pemrograman Web     88   Baik dalam ...
```

- Baris induk: tebal, `colspan` seluruh kolom, tanpa nilai/capaian.
- Anak: nomor `1..n` di dalam induk.
- Nilai dari `nilai_mata_pelajaran`; capaian dari TP anak.

### Rapor Tengah Semester

```
B. Kelompok Mata Pelajaran Kejuruan
   Rekayasa Perangkat Lunak
      1. Basis Data          82   B
      2. Pemrograman Web     88   A
```

- Baris induk: tebal, `colspan` seluruh kolom, tanpa nilai/predikat.
- Nilai dari `nilai_sumatif_ts`; predikat dari KKTP anak.

## 11. Rollback

1. Kembalikan kode ke commit sebelum fitur.
2. Kembalikan data periode aktif:
   ```sql
   INSERT INTO mapel_kelas SELECT * FROM backup_mapel_kelas_submapel_20261023;
   INSERT INTO mapel_siswa SELECT * FROM backup_mapel_siswa_submapel_20261023;
   ```
3. Hapus sub-mapel yang sudah dibuat (setelah memastikan tidak ada nilai/TP):
   ```sql
   DELETE FROM mapel WHERE parent_id IS NOT NULL;
   ```
4. Skema boleh dibiarkan. Jika harus dibersihkan:
   ```sql
   ALTER TABLE mapel DROP FOREIGN KEY fk_mapel_parent;
   ALTER TABLE mapel DROP INDEX idx_mapel_parent;
   ALTER TABLE mapel DROP COLUMN parent_id;
   ```

## 12. Checklist

- [ ] Sub-mapel ada di `mapel` dengan `parent_id` benar.
- [ ] Tidak ada 3 level.
- [ ] Setiap sub-mapel punya `mapel_kelas`, guru, dan siswa.
- [ ] Setiap sub-mapel punya TP.
- [ ] Induk tidak punya `mapel_kelas`/`mapel_siswa` di periode aktif.
- [ ] Rapor Semester & Tengah Semester menampilkan induk sebagai judul.
- [ ] Rapor 2024-2025 dan 2025-2026 tidak berubah.
- [ ] Tabel backup tersimpan sampai rapor periode aktif diverifikasi.
