# Optimasi Query SQL

## 1. Ringkasan

Audit menyeluruh terhadap semua query SQL di codebase menemukan **5 kategori masalah** dengan total 70+ lokasi. Dokumen ini berisi rencana perbaikan berdasarkan tingkat keparahan.

## 2. Hasil Audit — 5 Kategori Masalah

| # | Kategori | Severity | Jumlah | Dampak |
|---|----------|----------|--------|--------|
| 1 | **N+1 queries** 🔴 | HIGH | 20+ | Query di dalam loop — paling boros. 1 request → 1+N query. Semakin banyak data semakin lambat. |
| 2 | **SELECT \*** 🟡 | MEDIUM | 50+ | Ambil semua kolom padahal hanya butuh beberapa. Boros network + memory. |
| 3 | **No pagination** 🟡 | MEDIUM | Semua query data | Tidak pakai LIMIT/OFFSET. Makin banyak data makin lambat. |
| 4 | **Composite index** 🟢 | LOW | 10+ tabel | Tabel nilai punya index per kolom tapi tidak composite (tahun, semester, id_kelas, id_mapel). |
| 5 | **Full table scan** 🟢 | LOW | 5 tabel | Query tanpa WHERE di tabel transaksional. |

## 3. Perubahan Detail

### 3a. 🔴 N+1 Queries (Prioritas Tertinggi)

#### File: `src/lib/actions/naik-kelas-actions.ts` — `promoteKelas()` (line 64-73)
**Before:** Query siswa di dalam loop untuk setiap kelas
```typescript
for (const kelas of kelasRows) {
  const [siswaRows]: any = await pool.query(
    'SELECT sk.id_siswa FROM siswa_kelas sk WHERE ...',
    [kelas.id_kelas, ...]
  );
  // ...
}
```
**After:** Batch query sekali untuk semua kelas
```typescript
const idKelasList = kelasRows.map((k: any) => k.id_kelas);
const [allSiswaRows]: any = await pool.query(
  `SELECT sk.id_siswa, sk.id_kelas FROM siswa_kelas sk 
   WHERE sk.id_kelas IN (?) AND sk.tahun = ? AND ...`,
  [idKelasList, ...]
);
```
Group by `id_kelas` in JavaScript.

#### File: `src/lib/actions/naik-kelas-actions.ts` — `promoteAllKelas()` (lines 127-214)
**Before:** 5 nested N+1 loops (cari kelas target, ambil siswa, cek existing, cek lulusan, update siswa_kelas)
**After:** Ubah semua jadi batch query dengan `WHERE ... IN (?)`.

#### File: `src/lib/actions/tp-actions.ts` — `addTujuanMulti()` (lines 57-76)
**Before:** `SELECT id_tingkat` dan `SELECT MAX(urut)` di dalam loop per kelas
```typescript
for (const idKelas of kelasIds) {
  const [tingkat] = await pool.query('SELECT id_tingkat FROM kelas WHERE id_kelas = ?', [idKelas]);
  const [lastUrut] = await pool.query('SELECT MAX(urut) FROM tujuan_pembelajaran WHERE...', [...]);
}
```
**After:** Batch query `SELECT id_kelas, id_tingkat FROM kelas WHERE id_kelas IN (?)` sekali, lalu hitung urut via JS counter.

#### File: `src/lib/actions/tp-actions.ts` — `copyTujuan()` (lines 213-241)
**Before:** Triple nested N+1 (loop kodes → loop kelas → query MAX urut)
**After:** Batch query + JS Map untuk tracking.

#### File: `src/lib/actions/p5bk-actions.ts` (lines 59-70, 199-225)
**Before:** `SELECT id_dimensi, id_elemen FROM sub_elemen` di dalam loop per subElemen.
**After:** `SELECT id_sub_elemen, id_dimensi, id_elemen FROM sub_elemen WHERE id_sub_elemen IN (?)` sekali.

#### File: `src/lib/actions/prakerin-actions.ts` (lines 87-98)
**Before:** SELECT existing check di dalam loop import.
**After:** Batch check dengan `WHERE id_siswa IN (?)`.

#### File: `src/lib/actions/anggota-kelas-actions.ts` (lines 74-78)
**Before:** `SELECT id_tingkat FROM kelas WHERE id_kelas = ?` di dalam loop per siswa.
**After:** Query sekali di luar loop, cache hasilnya.

#### File: `src/lib/actions/mapel-kelas-actions.ts` (line 108)
**Before:** `SELECT id_mapel_kelas ... LIMIT 1` di dalam loop per mapel
```typescript
for (const row of rows) {
  const [existing]: any = await pool.query(
    'SELECT id_mapel_kelas FROM mapel_kelas WHERE ... LIMIT 1',
    [...]
  );
  if (existing.length === 0) {
    await pool.query('INSERT INTO mapel_kelas ...', [...]);
  }
}
```
**After:** Batch query semua yang sudah ada, filter pakai JS Set
```typescript
// Ambil semua existing dalam 1 query
const [existingRows]: any = await pool.query(
  'SELECT id_kelas, id_mapel FROM mapel_kelas WHERE tahun = ? AND semester = ?',
  [tahunBaru, semester]
);
const existingKey = new Set(existingRows.map((r: any) => `${r.id_kelas}-${r.id_mapel}`));
// Loop tinggal cek Set (no DB call)
for (const row of rows) {
  if (!existingKey.has(`${row.id_kelas}-${row.id_mapel}`)) {
    await pool.query('INSERT ...');
  }
}
```

### 3b. 🟡 SELECT * → Kolom Eksplisit

**Target:** Semua query yang ambil data dari tabel dengan banyak kolom (lebih dari 5 kolom).

**Pendekatan:** Ganti `SELECT *` dengan daftar kolom yang benar-benar dipakai di komponen.

**Tabel prioritas tinggi (banyak kolom):**
| File | Tabel | Kolom dipakai |
|------|-------|---------------|
| `tu/page.tsx` dashboard | `users`, `kelas`, `mapel` | Hanya COUNT beberapa field |
| `tu/pegawai/page.tsx` | `users` JOIN 4 tabel | Semua kolom untuk form, aman |
| `guru/penilaian/.../page.tsx` | `nilai_formatif`, `nilai_sumatif_*` | Banyak kolom, tapi tabel ini besar → paling berdampak |
| `tu/kesiswaan/page.tsx` | `siswa` JOIN complex | Spesifik, sudah eksplisit di SELECT |

**Tabel prioritas rendah (sedikit kolom / reference):** `tingkat`, `jenis_kelamin`, `agama`, `semester`, `tahun_pelajaran` — tidak perlu diubah.

### 3c. 🟡 No Pagination — Belum Perlu Sekarang

Database saat ini masih kecil. Pagination layak ditambahkan nanti ketika data mulai besar ( >10.000 row per tabel nilai). Untuk sekarang, skip dulu.

### 3d. 🟢 Composite Index

**File baru:** `src/lib/migrations/optimize-indexes.sql` (opsional, atau langsung execute di MySQL)

**Index yang perlu ditambahkan:**
```sql
-- Tabel nilai: composite index untuk query tahun + semester + kelas + mapel
ALTER TABLE nilai_formatif ADD INDEX idx_nilai_f_tskm (tahun, semester, id_kelas, id_mapel);
ALTER TABLE nilai_sumatif_ph ADD INDEX idx_nilai_sph_tskm (tahun, semester, id_kelas, id_mapel);
ALTER TABLE nilai_sumatif_as ADD INDEX idx_nilai_sas_tskm (tahun, semester, id_kelas, id_mapel);
ALTER TABLE nilai_sumatif_ts ADD INDEX idx_nilai_sts_tskm (tahun, semester, id_kelas, id_mapel);
ALTER TABLE nilai_kelas ADD INDEX idx_nilai_k_tsk (tahun, semester, id_kelas);
ALTER TABLE nilai_mata_pelajaran ADD INDEX idx_nilai_mp_tskm (tahun, semester, id_kelas, id_mapel);
ALTER TABLE mapel_siswa ADD INDEX idx_ms_tsk (tahun, semester, id_kelas);

-- Tabel yang sering di-join: tambah index composite
ALTER TABLE mapel_kelas ADD INDEX idx_mk_tsk (tahun, semester, id_kelas);
ALTER TABLE siswa_kelas ADD INDEX idx_sk_ts (tahun, semester);
```

### 3e. 🟢 Full Table Scan — Perbaiki Query Dashboard TU

**File:** `src/app/(dashboard)/tu/page.tsx`
- `prakerin` → tambah `WHERE tahun = ? AND semester = ?` agar hanya ambil periode aktif
- `lulusan` → tambah `WHERE tahun = ? AND semester = ?`
- `mutasi_masuk` → tambah `WHERE tahun = ?`
- `mutasi_keluar` → tambah `WHERE tahun = ?`

## 4. Ringkasan File yang Berubah

| # | File | Perubahan |
|---|------|-----------|
| 1 | `src/lib/actions/naik-kelas-actions.ts` | Batch query di promoteKelas + promoteAllKelas → hapus 5 N+1 |
| 2 | `src/lib/actions/tp-actions.ts` | Batch query di addTujuanMulti + copyTujuan → hapus 2 N+1 |
| 3 | `src/lib/actions/p5bk-actions.ts` | Batch query di updateP5BK + saveNilaiP5BK → hapus 2 N+1 |
| 4 | `src/lib/actions/prakerin-actions.ts` | Batch query di import loop → hapus 1 N+1 |
| 5 | `src/lib/actions/anggota-kelas-actions.ts` | Cache id_tingkat di luar loop → hapus 1 N+1 |
| 6 | `src/lib/actions/mapel-kelas-actions.ts` | Batch existing check → hapus 1 N+1 |
| 7 | `src/app/(dashboard)/tu/page.tsx` | Tambah WHERE untuk prakerin, lulusan, mutasi |
| 8 | File SQL migrasi index | 10+ composite index |

## 5. Verifikasi

1. `npm run build` — 0 error
2. Test manual halaman: Naik Kelas, Mapel Kelas, Tujuan Pembelajaran, P5BK, Prakerin, Anggota Kelas — pastikan data masih benar
3. Dashboard TU — jumlah data per kategori masih sesuai
