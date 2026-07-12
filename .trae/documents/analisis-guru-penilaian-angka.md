# Analisis Bagian Guru & Menu Penilaian Angka

## 1. Ringkasan

Dokumen ini berisi analisis mendalam terhadap seluruh menu Guru (20 file) dan khususnya alur **Penilaian Angka** — fitur inti untuk input nilai Formatif, Sumatif Harian (PH), Sumatif Tengah Semester (TS), dan Sumatif Akhir Semester (AS). Analisis mencakup arsitektur, data flow, kekuatan, kelemahan, dan rekomendasi.

---

## 2. Arsitektur Menu Guru — 20 File

| # | File | Peran |
|---|------|-------|
| 1 | [layout.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/layout.tsx) | Layout dengan `DashboardLayout` + `SidebarGuru` |
| 2 | [page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/page.tsx) | Dashboard — kartu statistik + shortcut |
| 3 | [kelas-ku/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/kelas-ku/page.tsx) | Daftar mapel yang diampu guru, link ke TP & Penilaian |
| 4 | [penilaian/\[id_mapel_kelas\]/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/penilaian/%5Bid_mapel_kelas%5D/page.tsx) | **Server Component** — ambil data penilaian |
| 5 | [penilaian/\[id_mapel_kelas\]/\_components/penilaian-client.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/penilaian/%5Bid_mapel_kelas%5D/_components/penilaian-client.tsx) | **Client Component** — tabel input nilai |
| 6 | [tujuan-pembelajaran/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/tujuan-pembelajaran/page.tsx) | CRUD Tujuan Pembelajaran |
| 7 | [tujuan-pembelajaran/\_components/tp-multi-kelas-client.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/tujuan-pembelajaran/_components/tp-multi-kelas-client.tsx) | Multi-class TP component |
| 8 | [anggota-kelas/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/anggota-kelas/page.tsx) | Lihat anggota kelas (jika wali kelas) |
| 9 | [buku-induk/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/buku-induk/page.tsx) | Buku induk siswa |
| 10 | [catatan-rapor/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/catatan-rapor/page.tsx) | Catatan rapor / cetak |
| 11 | [ekstra/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/ekstra/page.tsx) | Penilaian ekstrakurikuler |
| 12 | [ekstra/\_components/guru-ekstra-detail.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/ekstra/_components/guru-ekstra-detail.tsx) | Detail ekstrakurikuler |
| 13 | [kokurikuler/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/kokurikuler/page.tsx) | Penilaian kokurikuler (P5BK) |
| 14 | [lager-nilai-kelas/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/lager-nilai-kelas/page.tsx) | Leger nilai kelas |
| 15 | [organisasi/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/organisasi/page.tsx) | Penilaian organisasi |
| 16 | [p5bk/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/p5bk/page.tsx) | Penilaian P5BK |
| 17 | [piket-harian/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/piket-harian/page.tsx) | Piket harian guru |
| 18 | [prakerin/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/prakerin/page.tsx) | Penilaian prakerin |
| 19 | [profil/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/profil/page.tsx) | Profil guru |
| 20 | [rekap-presensi/page.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/(dashboard)/guru/rekap-presensi/page.tsx) | Rekap presensi |

---

## 3. Arsitektur Penilaian — Data Flow

### 3a. Alur Data End-to-End

```
Guru Login → Dashboard
  → Kelas Ku (Daftar Mapel)
    → Klik "Nilai" di baris mapel
      → /guru/penilaian/{id_mapel_kelas}
        ─┬─ Server Component: fetch data (4-5 queries parallel)
          │  1. mapel_kelas info (title bar)
          │  2. tujuan_pembelajaran (column headers)
          │  3. siswa via mapel_siswa.aktif=1 (rows)
          │  4. nilai_{type} (existing values)
          └── Client Component: render tabel input
                ├─ Tab Formatif (per-TP input + Jumlah + Rata-rata)
                ├─ Tab Sumatif Harian/PH (per-TP input)
                ├─ Tab Sumatif TS (1 input per siswa)
                └─ Tab Sumatif AS (Formatif + PH + AS + Total + Nilai Akhir)
                      └─ Rumus: Formatif 35% + PH 35% + AS 30%

Klik "Simpan Nilai"
  → POST /api/guru/penilaian/{id_mapel_kelas}
    → Transaction: Upsert/Delete per entry
    → Response { success: true }
```

### 3b. Database — 9 Tabel Nilai

| Tabel | PK | id_tujuan | middle | nas | Tipe nilai |
|-------|----|-----------|--------|-----|------------|
| `nilai_formatif` | id_nilai_formatif | ✅ | ✅ | ✅ | INT |
| `nilai_sumatif_ph` | id_nilai_sumatif_ph | ✅ | ✅ | ❌ | INT |
| `nilai_sumatif_ts` | id_nilai_sumatif_ts | ❌ | ❌ | ❌ | INT |
| `nilai_sumatif_as` | id_nilai_sumatif_as | ❌ | ❌ | ❌ | INT |
| `nilai_kelas` | id_nilai_kelas | ❌ | ❌ | ❌ | CHAR(10) |
| `nilai_mata_pelajaran` | id_nilai_mata_pelajaran | ❌ | ❌ | ❌ | CHAR(10) |
| `nilai_proyek` | id_nilai_proyek | ❌ | ❌ | ❌ | INT (P5BK) |
| `lager_nilai_mapel` | id_lager_nilai_mapel | ❌ | ❌ | ❌ | CHAR(10) multi-kolom |
| `lager_nilai_mid` | id_lager_nilai_mapel | ❌ | ❌ | ❌ | CHAR(10) multi-kolom |

### 3c. Arsitektur API Save

[route.ts](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/api/guru/penilaian/%5Bid_mapel_kelas%5D/route.ts) menggunakan:
- **Transaction** (`beginTransaction` + `commit`/`rollback`)
- **Upsert pattern**: SELECT existing → jika ada UPDATE, jika tidak INSERT
- **Delete-if-empty**: jika nilai parsed NaN atau string kosong, DELETE row
- **Dynamic table config**: `tableConfig` mapping menentukan `pk`, `hasIdTujuan`, `hasNas` per tabel
- **Dynamic SQL**: `\`${tableName}\`` (safe karena dari controlled enum)

---

## 4. ✅ Kekuatan yang Sudah Baik

### 4a. Arsitektur Server/Client Terpisah
Server component handle semua data fetching, client component hanya UI + state — clean separation.

### 4b. Transaction di API Save
Semua upsert dibungkus transaction — konsisten jika salah satu gagal.

### 4c. Sumatif AS Tampilkan Semua
Tab AS menampilkan Formatif + PH + AS + Total + Nilai Akhir dalam satu view — memudahkan guru melihat gambaran lengkap.

### 4d. Filter siswa via `mapel_siswa.aktif=1`
Hanya siswa yang mengambil mapel ini yang tampil — sesuai dengan sistem Mapel Pilihan.

### 4e. Dynamic Table Config
Mapping `tableConfig` mencegah SQL injection karena nama tabel berasal dari controlled object, bukan input user.

### 4f. GET API untuk Fetch Data
Server component menggunakan `pool.query` langsung (bukan API), efisien tanpa HTTP roundtrip.

---

## 5. ⚠️ Temuan & Potensi Masalah

### 5a. 🔴 `nilai` Pakai INT, Bukan DECIMAL
**Semua** tabel nilai menggunakan `INT(10)` — tidak bisa menyimpan nilai desimal.

```sql
`nilai` int(10) NOT NULL  -- di semua 4 tabel utama
```

**Dampak:** Guru input nilai seperti 78.5 → disimpan sebagai `78` (dibulatkan). Akurasi hilang.

**Perbaikan:** Ubah ke `DECIMAL(5,2)`:
```sql
ALTER TABLE nilai_formatif MODIFY nilai DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE nilai_sumatif_ph MODIFY nilai DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE nilai_sumatif_ts MODIFY nilai DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE nilai_sumatif_as MODIFY nilai DECIMAL(5,2) NOT NULL DEFAULT 0;
```

### 5b. 🔴 Kolom `middle` Tidak Pernah Dipakai
Tabel `nilai_formatif` dan `nilai_sumatif_ph` punya kolom `middle INT(10) NOT NULL` yang selalu `0`. Kolom `nas` di `nilai_formatif` selalu diset `1` — tidak ada logika bisnis yang membacanya.

**Rekomendasi:** Hapus atau dokumentasikan `middle`. `nas` bisa dimanfaatkan untuk menandai mana nilai yang sudah final.

### 5c. 🔴 `lager_nilai_mapel` Tidak Pernah Diupdate
Teacher saves nilai → data masuk ke `nilai_formatif`, `nilai_sumatif_*`. Tapi `lager_nilai_mapel` dan `lager_nilai_mid` tidak pernah diisi/dihitung ulang. Jika laporan rapor membaca dari tabel lager, datanya akan kosong/tidak sinkron.

**Perbaikan:** Tambahkan log di API save atau server action terpisah untuk menghitung dan update `lager_nilai_mapel` setelah nilai disimpan.

### 5d. 🟡 Rumus Nilai Akhir Hardcoded di Client
Di [penilaian-client.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/%28dashboard%29/guru/penilaian/%5Bid_mapel_kelas%5D/_components/penilaian-client.tsx):
```tsx
const nilaiAkhir = (parseFloat(String(avgF)) * 0.35 + parseFloat(String(avgPH)) * 0.35 + vAS * 0.30).toFixed(2);
```

**Masalah:**
- Bobot hardcoded (35/35/30) — tidak bisa diubah tanpa deploy ulang
- Nilai akhir dihitung **client-side** (JS), tidak disimpan ke database
- Jika guru refresh halaman sebelum screenshot/cetak, nilai akhir hilang

**Rekomendasi:** Simpan `nilaiAkhir` ke `nilai_mata_pelajaran` saat save.

### 5e. 🟡 Tidak Ada Validasi Input Nilai
Input nilai hanya pakai `inputMode="numeric"` — tidak ada:
- Batas range (0-100)
- Validasi format angka
- Peringatan nilai di luar wajar (>100)

### 5f. 🟡 Form Submit Bisa Kehilangan Data Saat Concurrent
Tidak ada optimistic locking atau version check. Jika 2 guru (atau 2 tab) save bersamaan, salah satu overwrite data tanpa konflik terdeteksi.

### 5g. 🟡 `getGuruTugas()` 8 Sequential Queries
[guru-actions.ts](file:///d:/PROJECT/nextjs/clone-rapor-next/src/lib/actions/guru-actions.ts) menjalankan 8 query terpisah untuk cek tugas guru (wali, eskul, organisasi, mapel, piket, prakerin, p5bk, kokurikuler). Ini adalah **N+1 ringan** — bisa di-UNION atau di-batch.

### 5h. 🟡 SELECT * di Semua Query Penilaian
Hampir semua query di penilaian pakai `SELECT *` — ambil semua kolom padahal cuma butuh beberapa (id, nama_siswa, nis, nilai).

### 5i. 🟡 Tidak Ada Composite Index untuk Query Penilaian
Query penilaian yang paling sering dijalankan:
```sql
SELECT * FROM nilai_formatif 
WHERE tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ?
ORDER BY id_siswa, tp_urut ASC
```

Tabel punya index individu per kolom, tapi **tidak ada composite index** `(tahun, semester, id_kelas, id_mapel)`.

### 5j. 🟡 `totalRaw` di Sumatif AS Tidak Akurat Secara Matematis
```tsx
const totalRaw = (() => {
  let s = 0;
  for (const tp of tujuanRows) {
    const vf = parseFloat(getN(formatifMap, sis.id_siswa, tp.id_tujuan));
    if (!isNaN(vf)) s += vf;
    const vp = parseFloat(getN(phMap, sis.id_siswa, tp.id_tujuan));
    if (!isNaN(vp)) s += vp;
  }
  return s + (isNaN(vAS) ? 0 : vAS);
})();
```

Kolom "Total" ini menjumlahkan semua nilai formatif + PH + AS mentah. Ini tidak bermakna secara pedagogis karena setiap TP punya skala dan bobot sendiri.

### 5k. 🟡 Duplikasi Data di `siswa_kelas` Tidak Dicegah
Saat `bulkAddAnggotaKelas`, tidak ada cek apakah siswa sudah terdaftar untuk periode yang sama — bisa duplikasi. Tidak ada UNIQUE constraint di tabel.

---

## 6. Rekomendasi Prioritas

| # | Item | Severity | File Terkait | Estimasi |
|---|------|----------|-------------|----------|
| 1 | **Ubah INT ke DECIMAL(5,2)** | 🔴 HIGH | SQL migration | 15 menit |
| 2 | **Simpan nilaiAkhir ke `nilai_mata_pelajaran`** | 🔴 HIGH | API route + action | 30 menit |
| 3 | **Update `lager_nilai_mapel` setelah save** | 🔴 HIGH | API route | 30 menit |
| 4 | **Validasi input nilai (0-100)** | 🟡 MEDIUM | Client component | 15 menit |
| 5 | **Fix `totalRaw` di Sumatif AS** | 🟡 MEDIUM | Client component | 10 menit |
| 6 | **Composite index (tahun, semester, id_kelas, id_mapel)** | 🟡 MEDIUM | SQL migration | 10 menit |
| 7 | **Batch query di `getGuruTugas()`** | 🟢 LOW | guru-actions.ts | 20 menit |
| 8 | **Hapus/dokumentasi kolom `middle`** | 🟢 LOW | SQL migration | 5 menit |

---

## 7. File yang Perlu Diubah (Jika Ditindaklanjuti)

| File | Perubahan |
|------|-----------|
| `abdinega_db_raporkm.sql` + migration SQL | ALTER TABLE nilai_* MODIFY nilai DECIMAL(5,2), composite index |
| `src/app/api/guru/penilaian/[id_mapel_kelas]/route.ts` | Simpan nilaiAkhir + update lager |
| `src/app/(dashboard)/guru/penilaian/[id_mapel_kelas]/_components/penilaian-client.tsx` | Validasi input, fix totalRaw |
| `src/lib/actions/guru-actions.ts` | Batch 8 query jadi 2-3 |
| `src/lib/actions/anggota-kelas-actions.ts` | Cek duplikasi sebelum insert |

## 8. Verifikasi

Setiap perubahan harus diverifikasi:
1. `npm run build` — 0 error
2. Login sebagai guru → Kelas Ku → Pilih mapel → semua tab berfungsi
3. Input nilai formatif (desimal test: 78.5) → save → refresh → nilai tetap 78.5
4. Tab AS: nilai akhir muncul, total akurat
5. Cek database: `nilai_mata_pelajaran` terisi, `lager_nilai_mapel` terisi
