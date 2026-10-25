# Rencana Implementasi Modul Bimbingan Konseling (BK) — v2.2

> Berdasarkan studi `LAYANAN AKL.xlsx` (aplikasi BK SMK Negeri 2 Turen) dan keputusan pengguna.
> Menggantikan `rencana-implementasi-bk.md` v2.1 untuk ruang lingkup layanan & rekap.

## Keputusan yang sudah disepakati

| # | Keputusan |
|---|---|
| 1 | **8 jenis layanan** sesuai Excel (bukan 5 jenis generik) |
| 2 | Jumlah sesi **bebas** (tidak dibatasi 3 seperti Excel) |
| 3 | Layanan kelompok: **setiap siswa punya catatan sendiri** |
| 4 | **Opsi A** — semua guru BK (`users.moto = 1`) dapat melihat & mengisi semua kelas; tidak ada `siswa_bk` |
| 5 | **Cetak Info Siswa** dan **export rekap Excel** disertakan |
| 6 | Bidang bimbingan **multi-select** (Pribadi/Sosial/Belajar/Karier) |

## 0. Perbedaan dari v2.1

| Aspek | v2.1 | v2.2 |
|---|---|---|
| Jenis layanan | 5 generik | 8 spesifik |
| Field | `judul`, `uraian` | field per jenis (lihat §1.4) |
| Peserta | header + peserta tanpa field | peserta menyimpan catatan per siswa |
| Binaan | `siswa_bk` wajib | **dihapus**; semua siswa kelas boleh dilayani |
| Jadwal BK | `jadwal_bk` | **di luar MVP** (tidak ada di Excel) |
| Status layanan | `proses/selesai/dirujuk` | **dihapus** (tidak ada di Excel) |
| Rekap | agregat dashboard | matriks per siswa + export |
| Cetak | belum ada | Info Siswa per siswa |

## 1. Model data

### 1.1 Prinsip

- Satu **sesi layanan** = satu baris `layanan_bk` + N baris `layanan_bk_peserta`.
- Individu/mediasi/konsultasi/anekdot/konferensi/home visit/referal: 1 peserta.
- Konseling kelompok: 2+ peserta, semua dari kelas yang sama.
- Field sesi (tanggal, pelaksana, tempat, pihak terlibat, tujuan, petugas) disimpan di header.
- Field per siswa (permasalahan, arahan, tindak lanjut, hasil, bidang, dll.) disimpan di peserta.
- Tidak ada batas 3 sesi. Nomor sesi dihitung dari urutan tanggal, bukan disimpan.

### 1.2 `layanan_bk`

```sql
CREATE TABLE IF NOT EXISTS `layanan_bk` (
  `id_layanan` int(10) NOT NULL AUTO_INCREMENT,
  `tahun` int(10) NOT NULL,
  `semester` int(10) NOT NULL,
  `id_user` int(10) NOT NULL COMMENT 'Guru BK pemberi layanan',
  `jenis_layanan` enum(
    'konseling_individu','konseling_kelompok','mediasi','konsultasi',
    'catatan_anekdot','konferensi_kasus','home_visit','referal'
  ) NOT NULL,
  `id_kelas` int(10) NOT NULL,
  `tanggal` date NOT NULL,
  `jam` time DEFAULT NULL,
  `agenda` varchar(255) DEFAULT NULL COMMENT 'Judul/topik sesi (opsional)',
  `pelaksana` varchar(255) DEFAULT NULL COMMENT 'Mediasi',
  `tempat` varchar(255) DEFAULT NULL COMMENT 'Catatan anekdot',
  `pihak_terlibat` text COMMENT 'Konferensi kasus',
  `tujuan` text COMMENT 'Home visit',
  `petugas` varchar(255) DEFAULT NULL COMMENT 'Home visit',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_layanan`),
  KEY `idx_periode` (`tahun`,`semester`,`deleted_at`),
  KEY `idx_kelas` (`id_kelas`),
  KEY `idx_user` (`id_user`),
  KEY `idx_jenis` (`jenis_layanan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.3 `layanan_bk_peserta`

```sql
CREATE TABLE IF NOT EXISTS `layanan_bk_peserta` (
  `id_layanan` int(10) NOT NULL,
  `id_siswa` int(10) NOT NULL,
  `bidang_bimbingan` set('pribadi','sosial','belajar','karir') NOT NULL DEFAULT '',
  `permasalahan` text,
  `arahan` text,
  `tindak_lanjut` text,
  `topik` varchar(255) DEFAULT NULL COMMENT 'Konsultasi',
  `pelaksana_dituju` varchar(255) DEFAULT NULL COMMENT 'Konsultasi',
  `hasil` text COMMENT 'Konsultasi / home visit',
  `peristiwa` text COMMENT 'Catatan anekdot',
  `informan` varchar(255) DEFAULT NULL COMMENT 'Catatan anekdot',
  `pembinaan` text COMMENT 'Referal: pembinaan yang sudah dilakukan',
  `referal` text COMMENT 'Referal: alasan/bentuk referal',
  `dirujuk_ke` varchar(255) DEFAULT NULL COMMENT 'Referal: tujuan rujukan',
  PRIMARY KEY (`id_layanan`,`id_siswa`),
  KEY `idx_siswa` (`id_siswa`),
  CONSTRAINT `fk_lbp_layanan` FOREIGN KEY (`id_layanan`)
    REFERENCES `layanan_bk` (`id_layanan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.4 Pemetaan field Excel → kolom

| Excel | Kolom DB | Level |
|---|---|---|
| Hari / Tanggal / Pukul | `tanggal`, `jam` | header |
| Permasalahan | `permasalahan` | peserta |
| Arahan | `arahan` | peserta |
| Tindak lanjut (tertulis "TIDAK LANJUT") | `tindak_lanjut` | peserta |
| Bidang Bimbingan | `bidang_bimbingan` | peserta |
| Pelaksana (mediasi) | `pelaksana` | header |
| Topik (konsultasi) | `topik` | peserta |
| Pelaksana yang dituju | `pelaksana_dituju` | peserta |
| Hasil konsultasi / home visit | `hasil` | peserta |
| Peristiwa (anekdot) | `peristiwa` | peserta |
| Tempat (anekdot) | `tempat` | header |
| Informan (anekdot) | `informan` | peserta |
| Pihak-pihak yang terlibat | `pihak_terlibat` | header |
| Tujuan home visit | `tujuan` | header |
| Petugas (home visit) | `petugas` | header |
| Pembinaan yang sudah dilakukan | `pembinaan` | peserta |
| Referal (tertulis "PEREVERAL") | `referal` | peserta |
| Di rujuk ke | `dirujuk_ke` | peserta |

### 1.5 Field per jenis layanan

| Jenis | Header | Peserta |
|---|---|---|
| `konseling_individu` | tanggal, jam, agenda | permasalahan, arahan, tindak_lanjut, bidang |
| `konseling_kelompok` | tanggal, jam, agenda | permasalahan, arahan, tindak_lanjut, bidang |
| `mediasi` | tanggal, jam, pelaksana | permasalahan, arahan, tindak_lanjut, bidang |
| `konsultasi` | tanggal, jam | topik, pelaksana_dituju, hasil, bidang |
| `catatan_anekdot` | tanggal, jam, tempat | peristiwa, informan, bidang |
| `konferensi_kasus` | tanggal, jam, pihak_terlibat | permasalahan, arahan, tindak_lanjut, bidang |
| `home_visit` | tanggal, jam, tujuan, petugas | hasil, bidang |
| `referal` | tanggal, jam, agenda | permasalahan, pembinaan, referal, dirujuk_ke, bidang |

### 1.6 Bidang bimbingan

- Disimpan sebagai `SET('pribadi','sosial','belajar','karir')`.
- UI: 4 checkbox; minimal 1 dipilih.
- Query filter: `FIND_IN_SET('sosial', p.bidang_bimbingan)`.
- Label tampilan: `Pribadi`, `Sosial`, `Belajar`, `Karier` (gabungan ditampilkan dengan koma).

## 2. Otorisasi

| Aktor | Hak |
|---|---|
| Guru BK (`users.moto = '1'`) | Lihat semua kelas; tambah layanan; edit/hapus **miliknya sendiri** (rekomendasi) |
| Guru non-BK | Tidak ada akses; redirect `/guru` |
| TU Admin | `/tu/bk-rekap` read-only + export |

- Guard: `layout.tsx` (`jabatan = 3` + `moto = '1'`) dan `requireBKGuru()` di setiap server action.
- **Catatan teknis:** `users.moto` bertipe `TEXT` (bukan int). Pakai `moto = '1'`, jangan `moto = 1`, agar konsisten.
- Edit/hapus milik sendiri: header menyimpan `id_user`; action memfilter `id_user = ?`. Jika ingin semua BK bisa mengedit, cukup hapus filter itu.

## 3. Server actions (`src/lib/actions/bk-actions.ts`)

| Fungsi | Keterangan |
|---|---|
| `getBKGrid(jenis, idKelas)` | Data grid: siswa + sesi per siswa (urut tanggal) |
| `getBKSesi(idLayanan, idSiswa)` | Detail satu sel (header + catatan siswa) |
| `createBKSesi(jenis, idKelas, idSiswa)` | Buat sesi baru (tanggal hari ini) + 1 peserta |
| `saveBKSesi(idLayanan, idSiswa, input)` | Update field sesi + catatan siswa |
| `deleteBKSesi(idLayanan, idSiswa)` | Hapus peserta; header soft-delete jika peserta terakhir |
| `saveBKLayanan(input)` | Form kelompok: 1 header + N peserta |
| `getBKSiswaKelas(idKelas)` | Picker peserta |
| `getBKLayananList(...)` | Riwayat lintas jenis (opsional) |
| `getBKStats()` | Dashboard: sesi bulan ini, siswa terlayani, per jenis, per bidang |
| `getBKRekap({ idKelas? })` | Matriks siswa × 8 jenis (jumlah sesi) |
| `getBKInfoSiswa(idSiswa)` | Semua sesi siswa untuk cetak |

Validasi:

- `jenis_layanan` harus salah satu dari 8.
- `id_kelas` wajib; peserta harus terdaftar di kelas itu pada periode aktif.
- `createBKSesi`: 1 siswa; `saveBKLayanan` kelompok: minimal 2 peserta, semua satu kelas.
- `bidang_bimbingan` minimal 1.
- Field wajib per jenis (mis. konsultasi: `topik`; anekdot: `peristiwa`; home visit: `tujuan`).
- Simpan `id_user` dari sesi; update hanya jika `id_user` sama dengan user aktif.

## 4. Halaman & komponen

```
src/app/(dashboard)/guru/bk/
├── layout.tsx                  # guard jabatan=3 + moto='1'
├── page.tsx                    # dashboard
├── layanan/
│   ├── page.tsx                # grid per jenis (tampilan utama)
│   ├── [id]/page.tsx           # detail satu sesi (deep link)
│   └── _components/            # grid, session card, drawer, form kelompok
├── siswa/
│   ├── page.tsx                # daftar siswa + pencarian
│   └── [id]/page.tsx           # info siswa + cetak
└── rekap/
    └── page.tsx                # matriks + export
```

### 4.1 Grid per jenis — tampilan utama

`/guru/bk/layanan?jenis=konseling_individu&kelas=1`

```
┌ Layanan BK ───────────────────────────────────────────────┐
│ [Individu] [Kelompok] [Mediasi] [Konsultasi] [Anekdot] ...│  ← tab 8 jenis
│ Kelas [X AKL v]  Semester [Ganjil v]   [Cari siswa...]     │
│                                    [+ Layanan Kelompok]    │
├────┬──────────────────┬───┬──────────────┬──────────────┬──┤
│ No │ Nama             │ L │ Sesi 1       │ Sesi 2       │ +│
├────┼──────────────────┼───┼──────────────┼──────────────┼──┤
│ 1  │ Aditya Harits    │ L │ 24/10/2026   │ —            │ +│
│    │                  │   │ Sakit/…      │              │  │
│    │                  │   │ ● Pribadi    │              │  │
│ 2  │ Alda Dwi Oky     │ P │ 20/10/2026   │ 23/10/2026   │ +│
│    │                  │   │ …            │ …            │  │
└────┴──────────────────┴───┴──────────────┴──────────────┴──┘
```

- Tab 8 jenis; filter kelas + pencarian siswa.
- Baris = siswa kelas; kolom = sesi ke-1, ke-2, … (bebas, bukan 3).
- Kartu sesi menampilkan tanggal, ringkasan field utama, badge bidang.
- Klik kartu → **drawer** kanan berisi semua field sesuai jenis.
- Tombol `+` di ujung baris membuat sesi baru (tanggal hari ini), lalu drawer terbuka.
- Tombol `+ Layanan Kelompok` membuka form multi-peserta.
- Desktop: scroll horizontal; kolom No/Nama sticky.
- Mobile: satu kartu per siswa, sesi ditumpuk vertikal.

### 4.2 Drawer detail/edit sesi

```
┌ Sesi 1 — Konseling Individu ─────────────────────── [x] ┐
│ Tanggal [24/10/2026]   Jam [09:00]                     │
│ Permasalahan [......................................]  │
│ Arahan       [......................................]  │
│ Tindak lanjut[......................................]  │
│ Bidang  [✓ Pribadi] [ Sosial] [ Belajar] [ Karier]     │
│                                                        │
│ [Hapus sesi]                            [Simpan]      │
└────────────────────────────────────────────────────────┘
```

- Drawer mengambil field header + peserta.
- Simpan → toast → kartu di grid ikut berubah.
- Hapus → konfirmasi → hapus peserta; jika grup, peserta lain tetap.

### 4.3 Form kelompok

- Tombol `+ Layanan Kelompok` → modal:
  - tanggal/jam, kelas, agenda;
  - pilih 2+ siswa (search + checkbox);
  - tiap siswa punya field catatan sendiri (sesuai jenis);
  - simpan → 1 header + N peserta; muncul di grid tiap siswa.
- Jenis lain yang multi-siswa memakai form yang sama.

### 4.4 Halaman lain

| Halaman | Isi |
|---|---|
| `/guru/bk` | Stat cards: sesi bulan ini, siswa terlayani, per jenis, per bidang; 5 layanan terbaru |
| `/guru/bk/layanan/[id]` | Detail satu sesi (deep link), tombol edit/hapus |
| `/guru/bk/siswa` | Daftar siswa + jumlah sesi |
| `/guru/bk/siswa/[id]` | Profil + riwayat per jenis + Cetak |
| `/guru/bk/rekap` | Matriks siswa × 8 jenis, total; export Excel |
| `/tu/bk-rekap` | Komponen rekap sama, read-only |

Sidebar guru (hanya `isBK`): Dashboard BK, Layanan BK, Rekap BK, Data Siswa.
Sidebar TU: Rekap BK.

### 4.5 Alur

1. **Input cepat (grid):** Layanan BK → pilih jenis & kelas → klik `+` pada baris siswa → isi drawer → simpan.
2. **Kelompok:** `+ Layanan Kelompok` → pilih beberapa siswa → isi catatan masing-masing → simpan.
3. **Edit:** klik kartu sesi → ubah → simpan.
4. **Hapus:** drawer → Hapus sesi → konfirmasi.
5. **Rekap:** Rekap BK → filter kelas → matrix → export/cetak.
6. **Cetak siswa:** Data Siswa → pilih siswa → Cetak.

## 5. Cetak & export

### 5.1 Info Siswa

- Halaman `/guru/bk/siswa/[id]` dengan CSS `@media print`.
- Isi: kop sekolah, identitas siswa, 8 jenis layanan; tiap sesi menampilkan tanggal, field terkait, bidang.
- Tombol **Cetak** memanggil `window.print()`.
- PDF server-side (pdfmake/Puppeteer) menyusul bila diperlukan; tidak memblokir MVP.

### 5.2 Export rekap Excel

- Route `GET /api/guru/bk/rekap/export?tahun=&semester=&id_kelas=`.
- Dua sheet:
  1. **Rekap** — matriks siswa × 8 jenis (jumlah sesi) + total.
  2. **Detail** — satu baris per peserta-sesi, semua field.
- Pakai helper `src/lib/excel.ts` (xlsx).
- TU dapat mengakses endpoint yang sama via `/tu/bk-rekap`.

## 6. Migrasi

- File: `migrations/0005_add_bk_tables.sql` (idempoten, `CREATE TABLE IF NOT EXISTS`).
- Tidak ada tabel `siswa_bk` / `jadwal_bk`.
- Jalankan via `bash deploy.sh` (atau `scripts/db-migrate.sh`).

## 7. Urutan implementasi

| # | Langkah |
|---|---|
| 1 | Migrasi 0005 + jalankan lokal |
| 2 | Types (`JenisLayananBK`, `LayananBK`) |
| 3 | `bk-actions.ts` (grid, sesi, save, delete, kelompok, stats, rekap, info) |
| 4 | Layout guard + `isBK` di `getGuruTugas` + sidebar |
| 5 | Grid per jenis + kartu sesi + drawer |
| 6 | Form layanan kelompok |
| 7 | Halaman detail sesi (deep link) |
| 8 | Halaman siswa + Info Siswa (print) |
| 9 | Rekap + export Excel |
| 10 | Dashboard BK |
| 11 | `/tu/bk-rekap` + sidebar TU |
| 12 | Typecheck, test, build, browser test, `graphify update .` |

## 8. Testing checklist

| # | Uji | Harapan |
|---|---|---|
| 1 | Guru BK buka `/guru/bk` | Menu & halaman tampil |
| 2 | Guru non-BK buka `/guru/bk` | Redirect `/guru` |
| 3 | Grid: pilih jenis + kelas | Semua siswa kelas tampil, kolom sesi muncul |
| 4 | Klik `+` pada baris siswa | Sesi baru dibuat, drawer terbuka |
| 5 | Simpan drawer | Kartu sesi terisi; Sesi 1/2/… benar |
| 6 | Tambah sesi ke-4+ | Boleh, tidak dibatasi |
| 7 | Form kelompok 3 siswa | 1 header + 3 peserta; muncul di grid tiap siswa |
| 8 | Peserta beda kelas | Ditolak |
| 9 | Kelompok 1 siswa | Ditolak (min 2) |
| 10 | Bidang kosong | Ditolak |
| 11 | Bidang 3 pilihan | Tersimpan (`SET`), tampil 3 label |
| 12 | Edit sesi milik sendiri | Berhasil; grid ikut berubah |
| 13 | Edit sesi guru BK lain | Ditolak (rekomendasi) |
| 14 | Hapus satu peserta grup | Peserta lain tetap; header hidup |
| 15 | Hapus peserta terakhir | Header soft-delete; hilang dari grid & rekap |
| 16 | Rekap | Jumlah sesi per jenis benar |
| 17 | Export Excel | 2 sheet, angka cocok |
| 18 | Info Siswa | Semua sesi tampil; print rapi |
| 19 | TU buka `/tu/bk-rekap` | Read-only, tanpa tombol edit |
| 20 | `npm run build` | 0 error |

## 9. Catatan & keputusan terbuka

1. **Edit/hapus**: rekomendasi hanya pemilik (`id_user`). Jika ingin semua guru BK bisa mengedit, tinggal hapus filter — konfirmasi.
2. **PDF Info Siswa**: MVP memakai print browser; PDF server-side opsional.
3. **`users.moto` TEXT**: gunakan `moto = '1'`.
4. **Typo Excel** yang diperbaiki di web: "TIDAK LANJUT" → Tindak Lanjut; "PEREVERAL/REVERAL" → Referal; "INDINVIDU" → Individu.
5. **Jadwal BK** dan **status layanan** tidak masuk MVP karena tidak ada di Excel; bisa ditambahkan kemudian.
6. **Data lama**: template Excel kosong (hanya 3 sel contoh), tidak perlu impor.
