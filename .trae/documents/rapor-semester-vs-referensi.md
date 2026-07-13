# Plan: Menyelaraskan Rapor Semester dengan PDF Referensi (WeasyPrint SMKS Abdi Negara)

## Summary
Membandingkan template rapor semester saat ini dengan PDF referensi (download.pdf — WeasyPrint) dan membuat perubahan agar semirip mungkin.

---

## Perbandingan Item per Item

### 1. Ukuran Kertas & Margin

| Properti | Saat Ini | Referensi | Status |
|---|---|---|---|
| Ukuran kertas | A4 (210×297mm) | F4/Folio (210×330mm) | ❌ BEDA |
| Margin atas | 5mm | ~6.2mm (17.5pt) | ❌ BEDA |
| Margin bawah | 15mm | ~6.6mm (18.6pt) | ❌ BEDA |
| Margin kiri | 15mm | ~14.5mm (41pt) | ✅ Mirip |
| Margin kanan | 15mm | ~15.7mm (44.4pt) | ✅ Mirip |

**Yang perlu diubah**: `rapor-template.ts` `@page` CSS + Puppeteer `margin` di `route.ts`

### 2. Font & Typography

| Properti | Saat Ini | Referensi | Status |
|---|---|---|---|
| Font family | Arial | Arial | ✅ SAMA |
| Body font size | 11pt | 9pt | ❌ BEDA |
| Line-height | 1.0 | ~1.1 (≈10pt untuk 9pt font) | ❌ BEDA |
| Judul font size | 18px (~13.5pt) | 13.5pt Bold | ⚠️ Mirip, tapi perlu Bold |
| Judul style | Normal | Bold + Center | ❌ BEDA (kurang Bold) |
| Footer font | Arial 8pt | Arial 9pt Italic | ⚠️ BEDA sedikit |
| Identity table font | 9pt | 9pt | ✅ SAMA |

**Yang perlu diubah**: body font-size 11pt→9pt, line-height 1.0→1.1, judul tambah bold

### 3. Tabel Nilai Mata Pelajaran

| Properti | Saat Ini | Referensi | Status |
|---|---|---|---|
| Lebar No | 5% | 5.4% (27.4pt) | ✅ Mirip |
| Lebar Mata Pelajaran | 25% | 24.8% (126.3pt) | ✅ Mirip |
| Lebar Nilai | 10% | 11.9% (60.8pt) | ⚠️ BEDA sedikit |
| Lebar Capaian Kompetensi | 60% | 57.3% (292.4pt) | ⚠️ BEDA sedikit |
| Header bg | `#f5f3f3` | `#E4E6EB` | ❌ BEDA |
| Header font | Bold | Bold | ✅ SAMA |
| Border | 1px solid #000 | 0.3pt solid #000 | ⚠️ BEDA tipis |
| Baris sub-kelompok | Bold, colspan 4 | Bold, full-width, 17.9pt height | ✅ SAMA |

**Yang perlu diubah**: header bg `#f5f3f3` → `#E4E6EB`, sesuaikan width kolom

### 4. Garis Dekoratif Ganda (Double Rule)

| Properti | Saat Ini | Referensi | Status |
|---|---|---|---|
| Garis atas judul | `<hr>` 1px solid | Double rule 1.5pt (#AAA + #555) | ❌ BEDA |
| Garis atas footer | Puppeteer border-top 1px #ddd | Double rule 1.5pt (#AAA + #555) | ❌ BEDA |

**Yang perlu diubah**: Ganti `<hr>` dengan CSS double rule, ganti footer border

### 5. Section Layout

| Section | Saat Ini | Referensi | Status |
|---|---|---|---|
| Header identitas (2 kolom) | ✅ Ada | ✅ Ada, 9pt | ✅ SAMA |
| Garis ganda dekoratif | ❌ | ✅ | ❌ BEDA |
| Judul "LAPORAN HASIL BELAJAR" | 18px center | 13.5pt Bold center | ⚠️ Perlu bold |
| Tabel nilai | ✅ | ✅ | ⚠️ Header bg beda |
| Prakerin | ✅ | TIDAK ADA di referensi | ⚠️ EKSTRA (tidak ada di referensi) |
| Kokurikuler | ✅ | TIDAK ADA di referensi | ⚠️ EKSTRA |
| Ekstrakurikuler (tanpa label) | ✅ | ✅ Ada label "Ekstrakurikuler" Bold 9pt | ❌ BEDA (label dihapus user) |
| Organisasi (tanpa label) | ✅ | TIDAK ADA di referensi | ⚠️ EKSTRA |
| Absensi (tanpa border table) | Table dengan border | 3 baris tanpa border | ❌ BEDA |
| Catatan Wali Kelas | h3 Bold 11pt | Bold 9pt | ❌ BEDA font size |
| Tanggapan Orang Tua | ✅ | TIDAK ADA di referensi | ⚠️ EKSTRA |
| Kenaikan Kelas (keputusan) | "KETERANGAN KENAIKAN KELAS" | "Keputusan" Bold 10.5pt | ❌ BEDA |
| Tanda tangan | 2 kolom, center | 2 kolom, kiri-kanan | ⚠️ BEDA layout |

### 6. Footer

| Properti | Saat Ini | Referensi | Status |
|---|---|---|---|
| Format | Kiri: info \| Kanan: Halaman X | Kiri: italic info \| Kanan: italic Halaman | ⚠️ BEDA style |
| Font size | 8pt | 9pt | ❌ BEDA |
| Style | Normal | Italic | ❌ BEDA |
| Garis atas | 1px solid #ddd | Double rule 1.5pt | ❌ BEDA |
| Padding | 15mm | ~14.5mm | ✅ Mirip |

### 7. Keputusan / Kenaikan Kelas

| Properti | Saat Ini | Referensi | Status |
|---|---|---|---|
| Label | "KETERANGAN KENAIKAN KELAS" Bold 11pt | "Keputusan" Bold 10.5pt | ❌ BEDA |
| Isi | "Berdasarkan..." + "Naik Ke Tingkat X / Tinggal di Kelas Y" | "Berdasarkan..." + "Naik ke kelas X / Tinggal Kelas" Bold | ⚠️ BEDA |
| Box | Ada border | Ada border | ✅ SAMA |

---

## Prioritas Perubahan

### Prioritas Tinggi (visual sangat beda)
1. **Ukuran kertas**: A4 → F4 (210×330mm)
2. **Body font**: 11pt → 9pt (seluruh template)
3. **Header background**: `#f5f3f3` → `#E4E6EB`
4. **Garis dekoratif ganda**: `<hr>` → double rule
5. **Judul**: tambah Bold
6. **Footer font**: 8pt → 9pt, tambah italic
7. **Footer garis**: single → double rule

### Prioritas Sedang
8. **Absensi**: hapus border table, jadikan baris biasa
9. **Catatan Wali Kelas label**: h3 11pt → Bold 9pt
10. **Keputusan label**: "KETERANGAN KENAIKAN KELAS" → "Keputusan" 10.5pt Bold
11. **Footer garis atas**: single → double rule

### Prioritas Rendah (tambahan fitur, bukan perbaikan)
12. Prakerin/Kokurikuler/Organisasi/Tanggapan Orang Tua — section ekstra yang tidak ada di referensi (tidak dihapus, tetap ada karena mungkin diperlukan)

---

## File yang Perlu Diubah

### 1. `src/lib/pdf-templates/rapor-template.ts` (CSS Global)
- `@page`: `size: A4` → `size: 210mm 330mm` (F4)
- `@page margin`: sesuaikan dengan referensi
- `body font-size`: 11pt → 9pt
- `table font-size`: 11pt → 9pt
- `line-height`: 1.0 → 1.1
- Tambah CSS untuk double rule: `.divider-double { border-bottom: 1.5pt double #555; }`

### 2. `src/lib/pdf-templates/semester-template.ts`
- **Judul**: `<h2 ...>LAPORAN HASIL BELAJAR</h2>` → tambah `font-weight:bold`
- **Header tabel background**: `#f5f3f3` → `#E4E6EB`
- **Catatan Wali label**: `<h3 ... font-size:11pt>` → `<h3 ... font-size:9pt>`
- **Keputusan label**: "KETERANGAN KENAIKAN KELAS" → "Keputusan", font-size 10.5pt
- **Absensi**: hapus border table outer, jadikan 3 baris tanpa border
- **Garis `<hr>`**: ganti dengan double rule div

### 3. `src/app/api/tu/cetak-rapor/route.ts`
- `format: 'A4'` → hapus atau ganti custom size (Puppeteer custom: `width: '210mm', height: '330mm'`)
- `margin`: sesuaikan dengan referensi
- **Footer**: font-size 8pt → 9pt, tambah italic

---

## Catatan Penting

### Section ekstra (bukan di referensi tapi tetap dipertahankan):
- Prakerin
- Kokurikuler
- Organisasi
- Tanggapan Orang Tua

User sebelumnya meminta label "Ekstrakurikuler", "Organisasi", "Ketidakhadiran" **dihapus**, tapi **tabel tetap ada**. Ini sudah diimplementasikan.

### Sub-kelompok "A. Kelompok Mata Pelajaran Umum" / "B. Kelompok Mata Pelajaran Kejuruan"
Referensi memiliki sub-header full-width row dengan Bold. Saat ini sudah ada di kode (line 64: `kelompokHeader`).

### Desain signature block
Referensi: layout 2 kolom kiri-kanan (Orang Tua/Wali kiri, Wali Kelas kanan), kemudian "Mengesahkan" + "Kepala Sekolah" di tengah/kanan. Saat ini: layout serupa tapi dengan spacing berbeda.
