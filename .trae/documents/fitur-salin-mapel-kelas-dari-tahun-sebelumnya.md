# Fitur: Salin Mapel Kelas dari Tahun Sebelumnya

## 1. Ringkasan

Menambahkan fitur **"Salin Mapel dari Tahun Sebelumnya"** di halaman Mapel Kelas (TU) agar admin tidak perlu input ulang semua mata pelajaran tiap kelas saat pindah tahun pelajaran. Mekanisme serupa dengan tombol "Naikkan Semua Kelas Sekaligus" yang sudah ada di halaman Naik Kelas.

## 2. Analisis Saat Ini

- Tabel `mapel_kelas` memiliki kolom: `id_mapel_kelas`, `tahun`, `semester`, `id_kelas`, `id_mapel`, `id_user`
- Halaman [Mapel Kelas](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/%28dashboard%29/tu/mapel-kelas/page.tsx) sudah menggunakan `getSekolahWithFilter()` — filter periode otomatis
- Saat admin ganti tahun pelajaran via Pengaturan, data `mapel_kelas` tahun baru masih kosong
- [mapel-kelas-actions.ts](file:///d:/PROJECT/nextjs/clone-rapor-next/src/lib/actions/mapel-kelas-actions.ts) sudah punya `updateMapelKelas` (insert/update) dan `deleteMapelKelas` (hard delete)
- Belum ada mekanisme duplikasi massal antar tahun

## 3. Perubahan yang Diusulkan

### 3a. Server Action Baru: `copyMapelKelasFromPreviousYear`

**File:** [src/lib/actions/mapel-kelas-actions.ts](file:///d:/PROJECT/nextjs/clone-rapor-next/src/lib/actions/mapel-kelas-actions.ts)

**Logika:**
1. Cek session (hanya TU/Admin, jabatan 1/2)
2. Ambil `tahun` dan `semester` aktif dari tabel `sekolah`
3. Cari `id_tahun_pelajaran` sebelumnya (sama pola `promoteAllKelas`)
4. Query semua `mapel_kelas` dari tahun/semester sebelumnya
5. Untuk tiap record, INSERT ke tahun baru jika kombinasi `(tahun, semester, id_kelas, id_mapel)` belum ada
6. Return hasil per kelas (nama kelas, jumlah mapel disalin, jumlah skip)

**Duplicate prevention:** Skip jika sudah ada kombinasi `tahun + semester + id_kelas + id_mapel` yang sama (UNIQUE secara logika, walau tabel tidak punya constraint).

### 3b. UI: Panel Hijau + Tombol + Modal Hasil

**File:** [src/app/(dashboard)/tu/mapel-kelas/_components/mapel-kelas-client.tsx](file:///d:/PROJECT/nextjs/clone-rapor-next/src/app/%28dashboard%29/tu/mapel-kelas/_components/mapel-kelas-client.tsx)

**Penambahan:**

1. **Panel hijau** di atas tabel (sama gaya dengan naik-kelas-client.tsx):
   - Border dashed, bg emerald-50
   - Teks: "Salin Mapel dari Tahun Sebelumnya"
   - Subteks: "Salin semua mata pelajaran beserta guru pengampu dari tahun sebelumnya"
   - Tombol hijau "Salin dari Tahun Lalu"

2. **State baru:**
   - `copying: boolean` — loading state
   - `copyResults: any[] | null` — hasil copy (modal)

3. **Handler `handleCopyPrevious`:**
   - Hitung jumlah mapel yang akan disalin (dari data tahun aktif saat ini yang kosong)
   - Konfirmasi via `confirmAlert`
   - Panggil `copyMapelKelasFromPreviousYear()`
   - Tampilkan modal hasil

4. **Modal hasil** (sama pola modal Naik Kelas):
   - Tabel: `Kelas | Mapel Disalin | Guru | Status`

### 3c. Import Server Action

Tambahkan `copyMapelKelasFromPreviousYear` ke import di `mapel-kelas-client.tsx`.

## 4. Asumsi & Keputusan

| No | Keputusan | Alasan |
|----|-----------|--------|
| 1 | Semester yang disalin = semester yang sama dengan tahun aktif | Konsisten dengan filter `getSekolahWithFilter()` yang pakai `tahun + semester` |
| 2 | Guru pengampu (`id_user`) ikut disalin | User skip konfirmasi, dan ini perilaku paling diharapkan — tinggal edit manual yang berubah |
| 3 | Cegah duplikasi pakai query SELECT cek existing | Tidak ada UNIQUE constraint di tabel, tapi perlu hindari duplicate row |
| 4 | Hard delete (`DELETE`) tidak masalah karena copynya INSERT baru | `mapel_kelas` tidak punya `deleted_at` dan delete existing juga hard delete |

## 5. Alur Data

```
User klik "Salin dari Tahun Lalu"
  → confirmAlert (jumlah mapel yang akan disalin)
  → copyMapelKelasFromPreviousYear()
    → SELECT tahun, semester FROM sekolah
    → SELECT id_tahun_pelajaran WHERE id > tahun_aktif LIMIT 1  (tahunBaru)
    → SELECT tahun_lalu = id - 1
    → SELECT mk.*, k.nama_kelas, m.nama_mapel, u.nama AS nama_guru
      FROM mapel_kelas mk
      JOIN kelas k ON mk.id_kelas = k.id_kelas
      JOIN mapel m ON mk.id_mapel = m.id_mapel
      LEFT JOIN users u ON mk.id_user = u.id_user
      WHERE mk.tahun = ? AND mk.semester = ?
    → Untuk tiap record:
      → SELECT id_mapel_kelas WHERE tahun_baru AND id_kelas AND id_mapel (cek duplikasi)
      → Jika belum ada: INSERT INTO mapel_kelas (tahunBaru, semesterBaru, id_kelas, id_mapel, id_user)
      → Jika sudah ada: skip
  → Return hasil[] → tampilkan di modal
  → RevalidatePath + refresh data
```

## 6. File yang Berubah

| File | Perubahan |
|------|-----------|
| `src/lib/actions/mapel-kelas-actions.ts` | Tambah fungsi `copyMapelKelasFromPreviousYear()` |
| `src/app/(dashboard)/tu/mapel-kelas/_components/mapel-kelas-client.tsx` | Tambah panel hijau, state, handler, modal hasil |

## 7. Verifikasi

1. `npm run build` — harus 0 error
2. Buka halaman Mapel Kelas → lihat panel hijau di atas
3. Klik "Salin dari Tahun Lalu" → lihat modal hasil
4. Data terisi sesuai tahun baru
