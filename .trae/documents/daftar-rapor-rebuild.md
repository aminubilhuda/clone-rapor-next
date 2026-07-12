# Plan: Rebuild Halaman Daftar Rapor (TU Admin)

## Ringkasan

Membangun ulang halaman `/tu/laporan-pendidikan/daftar-rapor` dengan tampilan lengkap (tabel siswa + tombol cetak per jenis rapor + checkbox select-all) dan fungsi cetak PDF via Puppeteer (placeholder dulu).

## Current State

- **Halaman sudah ada** di `src/app/(dashboard)/tu/laporan-pendidikan/daftar-rapor/`
- Saat ini hanya: dropdown kelas + tabel sederhana (No, Nama, NIS, NISN, tombol "Cetak Rapor" yang belum berfungsi)
- Belum ada Puppeteer atau library PDF di project
- Belum ada API route untuk cetak rapor

## Reference Design

Tabel dengan kolom:
| No | Nama Peserta Didik | Pelengkap Rapor | Tengah Semester ☐ | Semester ☐ | P5BK ☐ | Buku Induk |

- Header kolom "Tengah Semester", "Semester", "P5BK" punya **checkbox** untuk select all siswa → cetak batch 1 PDF
- Setiap baris punya **5 tombol** berwarna: Pelengkap Rapor (hijau), Tengah Semester (kuning), Semester (biru), P5BK (merah), Buku Induk (kuning)
- Tombol header checkbox → cetak semua siswa yang dicentang dalam 1 PDF

## Perubahan yang Akan Dilakukan

### 1. Install Puppeteer

**File:** `package.json`
- Tambah dependency `puppeteer` ke dependencies

### 2. Buat API Route Cetak Rapor

**File baru:** `src/app/api/tu/cetak-rapor/route.ts`

- Method: POST
- Auth: jabatan 1 atau 2
- Input: `{ id_siswa_list: number[], jenis: string }`
  - `jenis`: "pelengkap" | "tengah_semester" | "semester" | "p5bk" | "buku_induk"
  - `id_siswa_list`: array id_siswa untuk batch print
- Process:
  1. Fetch data sekolah (nama, logo, alamat, kepsek)
  2. Fetch data siswa + kelas
  3. Generate HTML placeholder dengan header sekolah + nama siswa
  4. Gunakan Puppeteer untuk convert HTML → PDF
  5. Return PDF buffer sebagai response
- Output: `application/pdf` binary response

### 3. Buat Server Action untuk Fetch Data Rapor

**File baru:** `src/lib/actions/rapor-actions.ts`

- `getSiswaRapor(tahun, semester, id_kelas)` → fetch siswa + kelas + catatan_wali status
- `getSekolahInfo()` → fetch nama sekolah, alamat, nama kepsek, logo
- `getPembagianRaport(tahun, semester)` → fetch tanggal pembagian rapor

### 4. Rebuild Client Component DaftarRapor

**File:** `src/app/(dashboard)/tu/laporan-pendidikan/daftar-rapor/_components/daftar-rapor-client.tsx`

- Props: `refKelas`, `siswaKelas`, `sekolahInfo`
- **Dropdown kelas** (sudah ada, pertahankan)
- **Tabel** dengan layout sesuai referensi:
  - Header: `bg-blue-600 text-white` dengan judul "Daftar Rapor {nama_kelas}"
  - Kolom: No, Nama Peserta Didik, Pelengkap Rapor, Tengah Semester ☐, Semester ☐, P5BK ☐, Buku Induk
  - Header kolom checkbox: native `<input type="checkbox">` 
  - Row buttons: colored buttons sesuai referensi (hijau/kuning/biru/merah/kuning)
- **State management:**
  - `selectedKelas` — kelas aktif
  - `selectedStudents` — Map<jenis, Set<id_siswa>> per kolom checkbox
- **Actions:**
  - Klik tombol per baris → POST `/api/tu/cetak-rapor` dengan 1 siswa + 1 jenis
  - Klik checkbox header → toggle select all siswa di kolom itu
  - Tombol cetak batch (di bawah tabel atau di header) → POST dengan semua siswa tercentang + 1 jenis

### 5. Update Page Server Component

**File:** `src/app/(dashboard)/tu/laporan-pendidikan/daftar-rapor/page.tsx`

- Tambah fetch `sekolahInfo` (nama, alamat, logo, kepsek)
- Pass ke client component

### 6. Buat PDF Template (Placeholder)

**File:** `src/lib/pdf-templates/rapor-template.ts`

- Function `generateRaporHTML(jenis, siswaInfo, sekolahInfo)` → returns HTML string
- Placeholder content:
  - Header: logo sekolah + nama sekolah + alamat
  - Judul sesuai jenis (Pelengkap Rapor / Tengah Semester / Semester / P5BK / Buku Induk)
  - Nama siswa, NIS, NISN, Kelas
  - Isi: "Konten {jenis} akan segera tersedia" (placeholder)
  - Footer: tanda tangan Kepala Sekolah

## File yang Diubah/Dibuat

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Edit | Tambah `puppeteer` dependency |
| `src/lib/actions/rapor-actions.ts` | **New** | Server actions fetch data rapor |
| `src/lib/pdf-templates/rapor-template.ts` | **New** | HTML template untuk PDF placeholder |
| `src/app/api/tu/cetak-rapor/route.ts` | **New** | API route generate PDF via Puppeteer |
| `src/app/(dashboard)/tu/laporan-pendidikan/daftar-rapor/page.tsx` | Edit | Tambah fetch sekolahInfo |
| `src/app/(dashboard)/tu/laporan-pendidikan/daftar-rapor/_components/daftar-rapor-client.tsx` | **Rewrite** | Tabel lengkap + checkbox + tombol cetak |

## Design Patterns (Mengikuti Tema Project)

- Background: `bg-[#F8F9FB]` (dari parent `<main>`)
- Card: `bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]`
- Table header: `bg-blue-600 text-white px-5 py-3 rounded-t-lg`
- Column headers: `bg-gray-50 text-xs font-medium text-[#6B7280] uppercase tracking-wider`
- Row hover: `hover:bg-[#F8F9FB]`
- Select: `bg-white border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20`
- Buttons:
  - Pelengkap Rapor: `bg-green-500 text-white hover:bg-green-600`
  - Tengah Semester: `bg-amber-500 text-white hover:bg-amber-600`
  - Semester: `bg-blue-500 text-white hover:bg-blue-600`
  - P5BK: `bg-red-500 text-white hover:bg-red-600`
  - Buku Induk: `bg-amber-500 text-white hover:bg-amber-600`
- Checkbox: native `<input type="checkbox">` dengan accent color

## Verifikasi

1. `npm run build` — 0 error
2. Login sebagai TU (abdira/abdira)
3. Navigasi ke `/tu/laporan-pendidikan/daftar-rapor`
4. Pilih kelas → tabel muncul dengan kolom lengkap
5. Centang checkbox header → semua siswa tercentang
6. Klik tombol cetak per baris → download PDF placeholder
7. Centang beberapa siswa + klik tombol batch → download PDF multi-halaman
8. Screenshot semua state untuk verifikasi visual
