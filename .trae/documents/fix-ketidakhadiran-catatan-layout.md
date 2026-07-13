# Plan: Perbaiki Layout Ketidakhadiran & Catatan Wali Kelas (semester-template)

## Summary
Merapikan tata letak bagian "Ketidakhadiran" dan "Catatan Wali Kelas" pada rapor semester agar simetris. Saat ini keduanya berada berdampingan (side-by-side 50%-50%) yang menyebabkan tampilan tidak simetris (terutama saat catatan wali kelas panjang). Akan diubah menjadi layout vertikal (atas-bawah) sehingga masing-masing section menggunakan lebar penuh (100%).

## Current State Analysis

### File: `src/lib/pdf-templates/semester-template.ts` (lines 236-257)
Saat ini layout ketidakhadiran dan catatan wali kelas berdampingan:
```html
<table style="width:100%;border-collapse:collapse;margin-top:20px;">
  <tr>
    <td style="width:50%;vertical-align:top;">  <!-- Kiri: Ketidakhadiran -->
      <table>Ketidakhadiran header</table>
      <table presensiRows border="1">
    </td>
    <td style="width:50%;vertical-align:top;">  <!-- Kanan: Catatan Wali Kelas -->
      <table>Catatan Wali Kelas header</table>
      <table catatan content border="1">
    </td>
  </tr>
</table>
```

### File: `src/lib/pdf-templates/tengah-semester-template.ts` (lines 125-135)
Layout tengah semester sudah vertikal (tidak perlu diubah):
```html
<h3>KETIDAKHADIRAN</h3>
<table presensiRows border="1">

<h3>CATATAN AKADEMIK</h3>
<table catatan border="1">
```

## Proposed Changes

### File: `src/lib/pdf-templates/semester-template.ts`

**Ubah** section ketidakhadiran + catatan wali dari layout side-by-side (table 2 kolom) menjadi layout vertikal (atas-bawah) dengan lebar penuh.

**Sebelum (side-by-side):**
```html
<div style="page-break-inside:avoid;">
  <table style="width:100%;border-collapse:collapse;margin-top:20px;">
    <tr>
      <td style="width:50%;vertical-align:top;">
        Ketidakhadiran (lebar 50%)
      </td>
      <td style="width:50%;vertical-align:top;">
        Catatan Wali Kelas (lebar 50%)
      </td>
    </tr>
  </table>
</div>
```

**Sesudah (vertikal/atas-bawah):**
```html
<div style="page-break-inside:avoid;">
  <h3 style="text-align:left;font-size:11pt;margin:15px 0 5px;font-weight:bold;">KETIDAKHADIRAN</h3>
  <table style="width:100%;border-collapse:collapse;" border="1">
    <tr>
      <td style="width:50%;text-align:left;padding:3px;border:1px solid #000;font-weight:bold;">Absen</td>
      <td style="width:50%;text-align:left;padding:3px;border:1px solid #000;font-weight:bold;">Jumlah</td>
    </tr>
    ${presensiRows}
  </table>

  <h3 style="text-align:left;font-size:11pt;margin:15px 0 5px;font-weight:bold;">CATATAN WALI KELAS</h3>
  <table style="width:100%;border-collapse:collapse;" border="1">
    <tr>
      <td style="width:100%;text-align:left;padding:5px;min-height:54px;border:1px solid #000;">
        ${siswa.catatan_wali ? escapeHtml(siswa.catatan_wali) : ''}
      </td>
    </tr>
  </table>
</div>
```

### Perubahan detail:
1. **Hapus** outer `<table>` dengan 2 kolom (`width:50%` x 2)
2. **Ketidakhadiran**: Gunakan `<h3>` sebagai judul + `<table>` full-width dengan header baris "Absen | Jumlah" + data rows
3. **Catatan Wali Kelas**: Gunakan `<h3>` sebagai judul + `<table>` full-width satu baris untuk isi catatan
4. **Styling**: Sama seperti pattern yang sudah ada di `tengah-semester-template.ts` untuk konsistensi

### Tidak ada perubahan pada:
- `tengah-semester-template.ts` — sudah layout vertikal
- `rapor-template.ts` — wrapper, tidak terpengaruh
- `route.ts` — PDF generation, tidak terpengaruh

## Verification
1. `npm run build` — pastikan 0 error
2. Restart dev server
3. Buka halaman daftar rapor, cetak rapor semester, periksa layout ketidakhadiran & catatan wali kelas harus full-width dan simetris
