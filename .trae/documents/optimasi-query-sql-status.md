# Status Optimasi Query SQL

## Ringkasan

Optimasi query SQL **sudah selesai diimplementasikan** pada sesi sebelumnya. Build berhasil (0 error), semua halaman berfungsi normal.

---

## ✅ Sudah Diimplementasikan (7 file berubah)

### 🔴 N+1 Queries — 11+ N+1 telah dieliminasi

| # | File | Fix | N+1 Dihapus |
|---|------|-----|-------------|
| 1 | `src/lib/actions/naik-kelas-actions.ts` | `promoteAllKelas()` — batch query `WHERE ... IN (?)` + JS Map untuk kelas target, siswa, existing check, siswa XII, lulusan | **5 N+1** |
| 2 | `src/lib/actions/tp-actions.ts` | `addTujuanMulti()` — batch query `SELECT id_kelas, id_tingkat` + counter manual `nextUrutCounter` | **1 N+1** |
| 3 | `src/lib/actions/tp-actions.ts` | `copyTujuan()` — batch query sumber TP + batch kelas + counter manual | **2 N+1** |
| 4 | `src/lib/actions/p5bk-actions.ts` | `updateP5BK()` — batch `SELECT id_sub_elemen, id_dimensi, id_elemen WHERE IN (?)` | **1 N+1** |
| 5 | `src/lib/actions/p5bk-actions.ts` | `saveNilaiP5BK()` — batch `SELECT existing nilai_proyek` sekali, JS Map untuk lookup | **1 N+1** |
| 6 | `src/lib/actions/prakerin-actions.ts` | Import loop — batch `SELECT mitra, id_prakerin` sekali, JS Map `existingMitra` | **1 N+1** |
| 7 | `src/lib/actions/mapel-kelas-actions.ts` | `copyMapelKelasFromPreviousYear()` — batch `SELECT existing` sekali, `existingKey` Set | **1 N+1** |

### 🟢 Full Table Scan — 4 tabel diperbaiki

| # | File | Tabel | Fix |
|---|------|-------|-----|
| 1 | `src/app/(dashboard)/tu/page.tsx` | `prakerin` | Tambah `WHERE tahun = ? AND semester = ?` |
| 2 | `src/app/(dashboard)/tu/page.tsx` | `lulusan` | Tambah `WHERE tahun = ? AND semester = ?` |
| 3 | `src/app/(dashboard)/tu/page.tsx` | `mutasi_masuk` | Tambah `WHERE tahun = ?` |
| 4 | `src/app/(dashboard)/tu/page.tsx` | `mutasi_keluar` | Tambah `WHERE tahun = ?` |

### 🟡 SELECT * — Perbaikan parsial

Sudah diganti manual di file yang dioptimasi (query-query yang disentuh saat N+1 fix sudah pakai kolom eksplisit). `SELECT *` di tabel referensi (kecil) dibiarkan karena dampaknya minimal.

---

## ❌ Belum Dilakukan (Rekomendasi ke Depan)

| Item | Prioritas | Alasan Skip |
|------|-----------|-------------|
| **Composite index** `(tahun, semester, id_kelas, id_mapel)` | LOW | Hanya beri dampak kalau data sudah >10.000 row per tabel |
| **Pagination (LIMIT/OFFSET)** | LOW | Database masih kecil |
| **SELECT * → kolom eksplisit** (50+ lokasi) | LOW | Sebagian besar tabel referensi kecil; yang besar sudah di-optimasi |

**Composite index yang bisa ditambahkan nanti (SQL migration):**
```sql
ALTER TABLE nilai_formatif ADD INDEX idx_nilai_f_tskm (tahun, semester, id_kelas, id_mapel);
ALTER TABLE nilai_sumatif_ph ADD INDEX idx_nilai_sph_tskm (tahun, semester, id_kelas, id_mapel);
ALTER TABLE nilai_sumatif_as ADD INDEX idx_nilai_sas_tskm (tahun, semester, id_kelas, id_mapel);
ALTER TABLE nilai_sumatif_ts ADD INDEX idx_nilai_sts_tskm (tahun, semester, id_kelas, id_mapel);
ALTER TABLE nilai_kelas ADD INDEX idx_nilai_k_tsk (tahun, semester, id_kelas);
ALTER TABLE nilai_mata_pelajaran ADD INDEX idx_nilai_mp_tskm (tahun, semester, id_kelas, id_mapel);
ALTER TABLE mapel_siswa ADD INDEX idx_ms_tsk (tahun, semester, id_kelas);
ALTER TABLE mapel_kelas ADD INDEX idx_mk_tsk (tahun, semester, id_kelas);
ALTER TABLE siswa_kelas ADD INDEX idx_sk_ts (tahun, semester);
```

---

## Verifikasi

- ✅ `npm run build` — **Compiled successfully, 0 errors**
- ✅ Semua halaman dashboard, naik kelas, mapel kelas, TP, p5bk, prakerin, anggota kelas — berfungsi normal
- ✅ Data dashboard TU sesuai periode aktif (tidak ambil semua data)
