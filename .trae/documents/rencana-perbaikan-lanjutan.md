# Rencana Perbaikan Lanjutan: Browser Test + CHAR(10) Migration + UNIQUE Constraint

## 1. Ringkasan

Rencana sebelumnya (7 item untuk Menu Guru & Penilaian Angka) **sudah 100% selesai** — semua perubahan kode terverifikasi di disk, build sukses. Sekarang lanjut ke:

1. **Browser Testing** — verifikasi semua perubahan dengan agent-browser (terputus dari sesi sebelumnya)
2. **Migrasi CHAR(10) ke DECIMAL(5,2)** — 3 tabel nilai masih pakai CHAR(10), rawan sorting string
3. **Tambah UNIQUE constraint** — 6 tabel nilai & siswa_kelas tidak punya UNIQUE, rawan duplikat

---

## 2. Status Rencana Sebelumnya ✅

| Urut | Item | Status |
|------|------|--------|
| 1 | SQL Migration: INT→DECIMAL(5,2) + Composite Index | ✅ **SELESAI** |
| 2 | API Route: Simpan nilaiAkhir + validasi + fix parse | ✅ **SELESAI** |
| 3 | Client: Validasi input nilai (0-100) | ✅ **SELESAI** |
| 4 | Client: Ubah totalRaw jadi totalRata | ✅ **SELESAI** |
| 5 | API Route: Fix tipe parse nilai | ✅ **SELESAI** |
| 6 | Server Action: Batch query getGuruTugas() | ✅ **SELESAI** |
| 7 | SQL: Drop kolom middle | ✅ **SELESAI** |

---

## 3. Detail — Sesi Ini

### Bagian A: Browser Testing (agent-browser)

**Tujuan:** Verifikasi end-to-end bahwa semua perubahan berfungsi.

**Langkah:**
1. Restart dev server (jika belum running) — `npm run dev`, tunggu 8 detik
2. **Login sebagai Guru** (`dasa` / `12345678`) — screenshot halaman login
3. **Buka Kelas Ku** → klik "Nilai" pada salah satu mapel → screenshot halaman penilaian
4. **Tab Formatif:** input `78.5` pada salah satu cell → save → refresh → verifikasi nilai tetap `78.5` ✅
5. **Validasi input:** coba input `150` → harus ditolak oleh pre-submit validation ✅
6. **Validasi input:** coba input `abc` → harus ditolak oleh onChange regex ✅
7. **Tab Sumatif AS:** kolom Total harus menampilkan rata-rata Formatif + PH + AS (bukan jumlah mentah) ✅
8. **Tab Sumatif AS:** klik save → nilai_mata_pelajaran terisi di database ✅
9. **Login sebagai TU** (`abdira` / `abdira`) → Laporan Pendidikan → nilai akhir mapel muncul ✅

**Tools:** agent-browser (chrome-devtools-mcp) untuk navigasi, screenshot, snapshot.

---

### Bagian B: SQL Migration — CHAR(10) ke DECIMAL(5,2)

**Latar Belakang:** Tabel `nilai_mata_pelajaran` dan `nilai_kelas` menyimpan nilai sebagai CHAR(10), bukan numerik. Ini menyebabkan:
- Sorting menggunakan ASCII, bukan numerik (`"9.50"` > `"78.50"` karena `"9"` > `"7"`)
- Tidak bisa dilakukan agregasi numerik (AVG, SUM)
- Risiko data non-numerik masuk

**Target Tabel:**

| Tabel | Kolom | Tipe Sekarang | Tipe Baru |
|-------|-------|--------------|-----------|
| `nilai_mata_pelajaran` | `nilai` | CHAR(10) | DECIMAL(5,2) |
| `nilai_kelas` | `nilai` | CHAR(10) | DECIMAL(5,2) |
| `nilai_kelas` | `jumlah` | CHAR(10) | DECIMAL(5,2) |

> `lager_nilai_mapel` dan `lager_nilai_mid` **tidak diubah** karena sudah tidak dipakai di kode (legacy).

**SQL:**
```sql
ALTER TABLE nilai_mata_pelajaran MODIFY nilai DECIMAL(5,2) NOT NULL DEFAULT 0.00;
ALTER TABLE nilai_kelas MODIFY nilai DECIMAL(5,2) NOT NULL DEFAULT 0.00;
ALTER TABLE nilai_kelas MODIFY jumlah DECIMAL(5,2) NOT NULL DEFAULT 0.00;
```

**Perubahan Kode di route.ts:**
Di bagian upsert `nilai_mata_pelajaran`, ganti `nilaiAkhir.toFixed(2)` (string) jadi `nilaiAkhir` (number):
```typescript
// Sebelum (CHAR)
[nilaiAkhir.toFixed(2), existingNmp[0].id_nilai_mata_pelajaran]

// Sesudah (DECIMAL)
[nilaiAkhir, existingNmp[0].id_nilai_mata_pelajaran]
```

---

### Bagian C: SQL Migration — Tambah UNIQUE Constraint

**Latar Belakang:** Semua tabel nilai hanya punya PRIMARY KEY auto-increment. Kombinasi kolom logis (tahun + semester + id_kelas + id_mapel + id_siswa) tidak di-enforce UNIQUE, menyebabkan duplikat data jika ada race condition atau bug.

**Target:**

| Tabel | Kombinasi UNIQUE |
|-------|-----------------|
| `siswa_kelas` | `(tahun, semester, id_siswa)` |
| `nilai_formatif` | `(tahun, semester, id_kelas, id_mapel, id_siswa, id_tujuan)` |
| `nilai_sumatif_ph` | `(tahun, semester, id_kelas, id_mapel, id_siswa, id_tujuan)` |
| `nilai_sumatif_ts` | `(tahun, semester, id_kelas, id_mapel, id_siswa)` |
| `nilai_sumatif_as` | `(tahun, semester, id_kelas, id_mapel, id_siswa)` |
| `nilai_mata_pelajaran` | `(tahun, semester, id_kelas, id_mapel, id_siswa)` |

**SQL — Tambah UNIQUE:**
```sql
-- Hapus index biasa dulu (agar tidak redundan), lalu tambah UNIQUE
DROP INDEX idx_nf_tskm ON nilai_formatif;
ALTER TABLE nilai_formatif ADD UNIQUE INDEX uq_nf (tahun, semester, id_kelas, id_mapel, id_siswa, id_tujuan);

DROP INDEX idx_nsph_tskm ON nilai_sumatif_ph;
ALTER TABLE nilai_sumatif_ph ADD UNIQUE INDEX uq_nsph (tahun, semester, id_kelas, id_mapel, id_siswa, id_tujuan);

DROP INDEX idx_nsts_tskm ON nilai_sumatif_ts;
ALTER TABLE nilai_sumatif_ts ADD UNIQUE INDEX uq_nsts (tahun, semester, id_kelas, id_mapel, id_siswa);

DROP INDEX idx_nsas_tskm ON nilai_sumatif_as;
ALTER TABLE nilai_sumatif_as ADD UNIQUE INDEX uq_nsas (tahun, semester, id_kelas, id_mapel, id_siswa);

ALTER TABLE nilai_mata_pelajaran ADD UNIQUE INDEX uq_nmp (tahun, semester, id_kelas, id_mapel, id_siswa);
ALTER TABLE siswa_kelas ADD UNIQUE INDEX uq_sk (tahun, semester, id_siswa);
```

**⚠️ Risiko:** Jika sudah ada data duplikat, ALTER TABLE akan gagal. Perlu dibersihkan dulu:
```sql
-- Cek duplikat sebelum eksekusi
SELECT tahun, semester, id_kelas, id_mapel, id_siswa, COUNT(*)
FROM nilai_formatif
GROUP BY tahun, semester, id_kelas, id_mapel, id_siswa, id_tujuan
HAVING COUNT(*) > 1;
```

Jika ada duplikat, hapus yang lebih lama (id lebih kecil):
```sql
-- Contoh untuk nilai_formatif (ulangi untuk tabel lain jika perlu)
DELETE n1 FROM nilai_formatif n1
INNER JOIN nilai_formatif n2
WHERE n1.id_nilai_formatif > n2.id_nilai_formatif
  AND n1.tahun = n2.tahun AND n1.semester = n2.semester
  AND n1.id_kelas = n2.id_kelas AND n1.id_mapel = n2.id_mapel
  AND n1.id_siswa = n2.id_siswa AND n1.id_tujuan = n2.id_tujuan;
```

**Perubahan Kode:** Tidak perlu — API route sudah pakai SELECT-then-upsert pattern yang kompatibel dengan UNIQUE constraint. Tapi kita bisa tambah opsi `ON DUPLICATE KEY` untuk efisiensi di masa depan (opsional, tidak wajib untuk rencana ini).

---

## 4. File yang Berubah

| # | File/Resource | Perubahan |
|---|-------------|-----------|
| 1 | ✅ `penilaian-client.tsx` | **SUDAH** (validasi + totalRata) |
| 2 | ✅ `guru-actions.ts` | **SUDAH** (Promise.all) |
| 3 | ✅ API route `route.ts` | **SUDAH** (nilaiAkhir, validasi, fix parse) |
| 4 | ⚡ SQL (eksekusi langsung) | **BARU:** ALTER TABLE `nilai_mata_pelajaran` + `nilai_kelas` MODIFY DECIMAL |
| 5 | ⚡ SQL (eksekusi langsung) | **BARU:** DROP INDEX biasa → ADD UNIQUE INDEX (6 tabel) |
| 6 | ⚡ API route `route.ts` | **BARU:** ganti `.toFixed(2)` → langsung `nilaiAkhir` (number) |
| 7 | ⚡ Browser test (agent-browser) | **BARU:** verifikasi end-to-end |

---

## 5. Urutan Eksekusi

1. **Browser Testing** — verifikasi perubahan sebelumnya berfungsi
2. **SQL Migration** — jalankan ALTER TABLE CHAR→DECIMAL + UNIQUE constraint
3. **Kode** — update route.ts (toFixed → langsung number)
4. **Build** — `npm run build` — 0 error
5. **Browser Testing Ulang** — verifikasi masih berfungsi setelah SQL migration

---

## 6. Verifikasi

1. **Build:** `npm run build` — 0 error ✅
2. **Browser test:**
   - Login guru → input nilai desimal 78.5 → value persist ✅
   - Input `150` → ditolak ✅
   - Input `abc` → ditolak ✅
   - Tab AS: Total tampilkan rata-rata (bukan jumlah) ✅
   - TU Laporan Pendidikan: nilai akhir muncul ✅
3. **Database (cek via phpMyAdmin / console):**
   - `DESC nilai_mata_pelajaran` → `nilai` tipe `decimal(5,2)` ✅
   - `SHOW INDEX FROM nilai_formatif` → `uq_nf` type `UNIQUE` ✅
   - `SHOW INDEX FROM siswa_kelas` → `uq_sk` type `UNIQUE` ✅

---

## 7. Catatan Tambahan

- **`lager_nilai_mapel`** dan **`lager_nilai_mid`** tidak disentuh — tabel legacy tidak dipakai kode.
- **`nilai_kelas`** hanya dipakai di halaman Laporan Pendidikan (read-only). Migrasi CHAR→DECIMAL aman karena query SELECT tidak berubah.
- Jika ALTER TABLE UNIQUE gagal karena duplikat, jalankan query DELETE duplikat terlebih dahulu.
- Perubahan route.ts minimal: hanya ganti `.toFixed(2)` jadi angka langsung — API tetap kompatibel dengan client.
