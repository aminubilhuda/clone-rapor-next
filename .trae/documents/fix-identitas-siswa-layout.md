# Plan: Rapikan Layout Identitas Siswa (Rapor Semester & Tengah Semester)

## Summary
Merapikan tata letak tabel identitas siswa pada rapor agar label dan colon (:) sejajar sempurna. Kolom width dihapus dan diganti auto-sizing agar menyesuaikan konten terpanjang.

## Current State Analysis

### Struktur saat ini (kedua template identik):
```html
<table style="width:100%;border-collapse:collapse;margin-top:0;font-size:11pt;">
  <tr>
    <td style="width:25%;text-align:left;height:14px;">Nama</td>
    <td style="width:3%;text-align:center;">:</td>
    <td style="width:37%;text-align:left;font-weight:bold;">NAMA SISWA</td>
    <td style="width:5%;"></td>
    <td style="width:17%;text-align:left;">Kelas</td>
    <td style="width:3%;text-align:center;">:</td>
    <td style="width:17%;text-align:left;font-weight:bold;">X AK</td>
  </tr>
  ...
</table>
```

### Masalah:
1. Width eksplisit (25%, 37%, 17%) memaksa kolom tetap proporsi tetap — colon tidak sejajar
2. Label panjang seperti "Nama Sekolah" dan "Tahun Pelajaran" memakan ruang lebih dari yang tersedia
3. Tidak ada `white-space: nowrap` — label bisa wrap dan membuat layout berantakan

## Proposed Changes

### File: `src/lib/pdf-templates/semester-template.ts` (lines 125-162)
### File: `src/lib/pdf-templates/tengah-semester-template.ts` (lines 73-110)

**Ubah** tabel identitas dengan menghapus semua width eksplisit dan menggunakan auto-sizing:

```html
<table style="width:100%;border-collapse:collapse;margin-top:0;font-size:11pt;">
  <tr>
    <td style="text-align:left;height:14px;white-space:nowrap;padding-right:4px;">Nama</td>
    <td style="text-align:center;width:1%;">:</td>
    <td style="text-align:left;font-weight:bold;">NAMA SISWA</td>
    <td style="width:5%;"></td>
    <td style="text-align:left;white-space:nowrap;padding-right:4px;">Kelas</td>
    <td style="text-align:center;width:1%;">:</td>
    <td style="text-align:left;font-weight:bold;">X AK</td>
  </tr>
  <tr>
    <td style="text-align:left;height:14px;white-space:nowrap;padding-right:4px;">NIS / NISN</td>
    <td style="text-align:center;width:1%;">:</td>
    <td style="text-align:left;font-weight:bold;">3406 / 898.102</td>
    <td style="width:5%;"></td>
    <td style="text-align:left;white-space:nowrap;padding-right:4px;">Fase</td>
    <td style="text-align:center;width:1%;">:</td>
    <td style="text-align:left;font-weight:bold;">G</td>
  </tr>
  <tr>
    <td style="text-align:left;height:14px;white-space:nowrap;padding-right:4px;">Nama Sekolah</td>
    <td style="text-align:center;width:1%;">:</td>
    <td style="text-align:left;font-weight:bold;">SMK NEGERI 1</td>
    <td style="width:5%;"></td>
    <td style="text-align:left;white-space:nowrap;padding-right:4px;">Semester</td>
    <td style="text-align:center;width:1%;">:</td>
    <td style="text-align:left;font-weight:bold;">GANJIL</td>
  </tr>
  <tr>
    <td style="text-align:left;height:14px;white-space:nowrap;padding-right:4px;">Alamat</td>
    <td style="text-align:center;width:1%;">:</td>
    <td style="text-align:left;font-weight:bold;">JL. MERDEKA NO. 1</td>
    <td style="width:5%;"></td>
    <td style="text-align:left;white-space:nowrap;padding-right:4px;">Tahun Pelajaran</td>
    <td style="text-align:center;width:1%;">:</td>
    <td style="text-align:left;font-weight:bold;">2025/2026</td>
  </tr>
</table>
```

### Perubahan detail:
1. **Hapus semua width** pada label (Nama, NIS/NISN, Nama Sekolah, Alamat, Kelas, Fase, Semester, Tahun Pelajaran) → auto-size mengikuti konten
2. **Hapus width** pada value (NAMA SISWA, NIS, Nama Sekolah, Alamat, Kelas, Fase, Semester, Tahun Pelajaran) → auto-size
3. **Colon (:)** hanya `width:1%` sebagai minimum — browser auto-expand sesuai konten
4. **Gap tengah** tetap `width:5%`
5. **Tambahkan** `white-space:nowrap` pada semua label agar tidak wrap
6. **Tambahkan** `padding-right:4px` pada label agar ada jarak antara teks dan colon

### Mengapa pendekatan ini:
- Browser/Puppeteer otomatis menghitung width terbaik berdasarkan konten
- Label terpanjang ("Nama Sekolah" di kiri, "Tahun Pelajaran" di kanan) menentukan lebar kolom
- Colon (:) sejajar sempurna karena label memiliki width tetap (nowrap)
- Tidak ada text yang terpotong atau overflow

## Verification
1. `npm run build` — pastikan 0 error
2. Restart dev server
3. Buka halaman daftar rapor, cetak rapor semester & tengah semester
4. Periksa apakah colon (:) sejajar sempurna di semua baris
5. Pastikan tidak ada text yang wrap atau terpotong
