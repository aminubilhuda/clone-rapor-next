import { NextRequest } from 'next/server';
import ExcelJS from 'exceljs';
import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';

function formatIndoDate(raw: any): string {
  if (!raw) return '-';
  try {
    const d = typeof raw === 'string' ? new Date(raw.includes('T') ? raw : `${raw}T00:00:00`) : new Date(raw);
    if (isNaN(d.getTime())) return String(raw);
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return String(raw);
  }
}

export async function GET(req: NextRequest) {
  const authResult = await requireTuAdmin();
  if (authResult.error) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'ringkas'; // 'ringkas' | 'lengkap'
  const idKelasParam = searchParams.get('id_kelas');
  const searchParam = searchParams.get('search') || '';

  const sekolah = await getSekolahWithFilter();
  const tahun = sekolah.tahun;
  const semester = sekolah.semester;

  const conditions: string[] = ['s.deleted_at IS NULL', 's.aktif = 1'];
  const params: any[] = [tahun, semester];

  if (idKelasParam && idKelasParam !== 'all' && idKelasParam !== '') {
    conditions.push('sk.id_kelas = ?');
    params.push(Number(idKelasParam));
  }

  if (searchParam.trim()) {
    const like = `%${searchParam.trim()}%`;
    const cols = ['s.nama_siswa', 's.nis', 's.nisn', 'jk.jenis_kelamin', 'a.agama', 'kk.kompetensi_keahlian', 'k.nama_kelas'];
    conditions.push(`(${cols.map((c) => `${c} LIKE ?`).join(' OR ')})`);
    params.push(...Array(cols.length).fill(like));
  }

  // Ambil nama kelas jika id_kelas dipilih
  let namaKelasFilter = 'Semua Kelas';
  if (idKelasParam && idKelasParam !== 'all' && idKelasParam !== '') {
    const [kRows]: any = await pool.query('SELECT nama_kelas FROM kelas WHERE id_kelas = ?', [idKelasParam]);
    if (kRows && kRows[0]) {
      namaKelasFilter = `Kelas ${kRows[0].nama_kelas}`;
    }
  }

  const [rows]: any = await pool.query(`
    SELECT
      s.id_siswa, s.nama_siswa, s.nik_pd, s.nkk,
      s.nis, s.nisn, s.terima_kelas,
      s.tempat_lahir, s.tanggal_lahir, s.kelamin, s.agama, s.jurusan,
      s.kontak_siswa, s.hub_keluarga, s.jumlah_saudara, s.anak_ke,
      s.nama_ayah, s.nik_ayah, s.tahun_ayah, s.pendidikan_ayah, s.pekerjaan_ayah, s.kontak_ayah,
      s.nama_ibu, s.nik_ibu, s.tahun_ibu, s.pendidikan_ibu, s.pekerjaan_ibu, s.kontak_ibu,
      s.alamat, s.alamat_orang_tua,
      s.nama_wali, s.alamat_wali, s.pekerjaan_wali, s.kontak_wali,
      s.terima_tingkat, s.sekolah_asal, s.terima_tanggal,
      s.username, s.jenis_siswa, s.aktif,
      jk.jenis_kelamin, a.agama as nama_agama,
      kk.kompetensi_keahlian,
      hk.hubunga_keluarga as nama_hub_keluarga,
      js.jenis_siswa as nama_jenis_siswa,
      pa.pendidikan as nama_pendidikan_ayah,
      pi.pendidikan as nama_pendidikan_ibu,
      t.tingkat as nama_terima_tingkat,
      t.tabjad as tabjad_terima_tingkat,
      kt.tabjad as tingkat_saat_ini,
      kt.tingkat as tingkat_angka_saat_ini,
      kt.fase as fase_saat_ini,
      COALESCE(k.nama_kelas, 'Belum Bergabung') as kelas_display
    FROM siswa s
    LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
    LEFT JOIN agama a ON s.agama = a.id_agama
    LEFT JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
    LEFT JOIN hubungan_keluarga hk ON s.hub_keluarga = hk.id_hubungan_keluarga
    LEFT JOIN jenis_siswa js ON s.jenis_siswa = js.id_jenis_siswa
    LEFT JOIN pendidikan pa ON s.pendidikan_ayah = pa.id_pendidikan OR s.pendidikan_ayah = pa.pendidikan
    LEFT JOIN pendidikan pi ON s.pendidikan_ibu = pi.id_pendidikan OR s.pendidikan_ibu = pi.pendidikan
    LEFT JOIN tingkat t ON s.terima_tingkat = t.id_tingkat
    LEFT JOIN (
      SELECT id_siswa, id_kelas FROM siswa_kelas
      WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
      GROUP BY id_siswa
    ) sk ON s.id_siswa = sk.id_siswa
    LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
    LEFT JOIN tingkat kt ON k.id_tingkat = kt.id_tingkat
    WHERE ${conditions.join(' AND ')}
    ORDER BY k.nama_kelas ASC, s.nama_siswa ASC
  `, params);

  // Buat workbook ExcelJS
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'E-Rapor SMK';
  workbook.created = new Date();

  const isLengkap = type === 'lengkap';
  const sheetTitle = isLengkap ? 'Buku Induk Siswa' : 'Data Siswa';
  const worksheet = workbook.addWorksheet(sheetTitle, {
    views: [{ state: 'frozen', ySplit: 5, showGridLines: true }],
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    },
  });

  // Definisi Kolom
  interface ColDef {
    header: string;
    key: string;
    width: number;
    align: 'left' | 'center' | 'right';
    isText?: boolean;
    isBold?: boolean;
  }

  const columnsRingkas: ColDef[] = [
    { header: 'NO', key: 'no', width: 6, align: 'center' },
    { header: 'NIS', key: 'nis', width: 14, align: 'center', isText: true },
    { header: 'NISN', key: 'nisn', width: 16, align: 'center', isText: true },
    { header: 'NAMA SISWA', key: 'nama_siswa', width: 32, align: 'left', isBold: true },
    { header: 'L/P', key: 'jenis_kelamin', width: 8, align: 'center' },
    { header: 'TINGKAT', key: 'tingkat_display', width: 12, align: 'center' },
    { header: 'KELAS', key: 'kelas_display', width: 16, align: 'center' },
    { header: 'KOMPETENSI KEAHLIAN / JURUSAN', key: 'kompetensi_keahlian', width: 30, align: 'left' },
    { header: 'TEMPAT LAHIR', key: 'tempat_lahir', width: 18, align: 'left' },
    { header: 'TANGGAL LAHIR', key: 'tanggal_lahir', width: 18, align: 'center' },
    { header: 'AGAMA', key: 'agama', width: 14, align: 'center' },
    { header: 'NO. HP / KONTAK', key: 'kontak_siswa', width: 18, align: 'center', isText: true },
    { header: 'ALAMAT SISWA', key: 'alamat', width: 38, align: 'left' },
    { header: 'NAMA AYAH', key: 'nama_ayah', width: 24, align: 'left' },
    { header: 'NAMA IBU', key: 'nama_ibu', width: 24, align: 'left' },
    { header: 'KONTAK ORTU', key: 'kontak_ortu', width: 18, align: 'center', isText: true },
  ];

  const columnsLengkap: ColDef[] = [
    { header: 'NO', key: 'no', width: 6, align: 'center' },
    { header: 'NIS', key: 'nis', width: 14, align: 'center', isText: true },
    { header: 'NISN', key: 'nisn', width: 16, align: 'center', isText: true },
    { header: 'NIK SISWA', key: 'nik_pd', width: 20, align: 'center', isText: true },
    { header: 'NO. KK', key: 'nkk', width: 20, align: 'center', isText: true },
    { header: 'NAMA SISWA', key: 'nama_siswa', width: 32, align: 'left', isBold: true },
    { header: 'JENIS KELAMIN', key: 'jenis_kelamin', width: 15, align: 'center' },
    { header: 'TINGKAT SAAT INI', key: 'tingkat_display', width: 18, align: 'center' },
    { header: 'KELAS SAAT INI', key: 'kelas_display', width: 18, align: 'center' },
    { header: 'KOMPETENSI KEAHLIAN', key: 'kompetensi_keahlian', width: 30, align: 'left' },
    { header: 'TEMPAT LAHIR', key: 'tempat_lahir', width: 18, align: 'left' },
    { header: 'TANGGAL LAHIR', key: 'tanggal_lahir', width: 18, align: 'center' },
    { header: 'AGAMA', key: 'agama', width: 14, align: 'center' },
    { header: 'HUB. KELUARGA', key: 'hub_keluarga', width: 16, align: 'center' },
    { header: 'ANAK KE', key: 'anak_ke', width: 10, align: 'center' },
    { header: 'JML SAUDARA', key: 'jumlah_saudara', width: 14, align: 'center' },
    { header: 'KONTAK SISWA', key: 'kontak_siswa', width: 18, align: 'center', isText: true },
    { header: 'ALAMAT SISWA', key: 'alamat', width: 38, align: 'left' },
    { header: 'ALAMAT ORTU', key: 'alamat_orang_tua', width: 38, align: 'left' },
    { header: 'NAMA AYAH', key: 'nama_ayah', width: 24, align: 'left' },
    { header: 'NIK AYAH', key: 'nik_ayah', width: 20, align: 'center', isText: true },
    { header: 'THN LAHIR AYAH', key: 'tahun_ayah', width: 15, align: 'center' },
    { header: 'PENDIDIKAN AYAH', key: 'pendidikan_ayah', width: 18, align: 'center' },
    { header: 'PEKERJAAN AYAH', key: 'pekerjaan_ayah', width: 22, align: 'left' },
    { header: 'KONTAK AYAH', key: 'kontak_ayah', width: 18, align: 'center', isText: true },
    { header: 'NAMA IBU', key: 'nama_ibu', width: 24, align: 'left' },
    { header: 'NIK IBU', key: 'nik_ibu', width: 20, align: 'center', isText: true },
    { header: 'THN LAHIR IBU', key: 'tahun_ibu', width: 15, align: 'center' },
    { header: 'PENDIDIKAN IBU', key: 'pendidikan_ibu', width: 18, align: 'center' },
    { header: 'PEKERJAAN IBU', key: 'pekerjaan_ibu', width: 22, align: 'left' },
    { header: 'KONTAK IBU', key: 'kontak_ibu', width: 18, align: 'center', isText: true },
    { header: 'NAMA WALI', key: 'nama_wali', width: 24, align: 'left' },
    { header: 'PEKERJAAN WALI', key: 'pekerjaan_wali', width: 22, align: 'left' },
    { header: 'KONTAK WALI', key: 'kontak_wali', width: 18, align: 'center', isText: true },
    { header: 'ALAMAT WALI', key: 'alamat_wali', width: 38, align: 'left' },
    { header: 'SEKOLAH ASAL', key: 'sekolah_asal', width: 26, align: 'left' },
    { header: 'DITERIMA DI TINGKAT', key: 'terima_tingkat', width: 18, align: 'center' },
    { header: 'DITERIMA DI KELAS', key: 'terima_kelas', width: 18, align: 'center' },
    { header: 'TANGGAL TERIMA', key: 'terima_tanggal', width: 18, align: 'center' },
    { header: 'JENIS SISWA', key: 'jenis_siswa', width: 15, align: 'center' },
    { header: 'USERNAME LOGIN', key: 'username', width: 18, align: 'center', isText: true },
  ];

  const activeCols = isLengkap ? columnsLengkap : columnsRingkas;
  const totalCols = activeCols.length;

  // Set Column Widths
  activeCols.forEach((col, idx) => {
    worksheet.getColumn(idx + 1).width = col.width;
  });

  // Border Style Helper
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  };

  // 1. BANNER HEADER ROW 1 (Title)
  worksheet.mergeCells(1, 1, 1, totalCols);
  const row1 = worksheet.getRow(1);
  row1.height = 32;
  const cell1 = row1.getCell(1);
  cell1.value = isLengkap ? 'BUKU INDUK / DATA LENGKAP SISWA' : 'DATA POKOK SISWA';
  cell1.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  cell1.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF991B1B' }, // Deep Crimson / Burgundy
  };
  cell1.alignment = { vertical: 'middle', horizontal: 'center' };

  // 2. BANNER HEADER ROW 2 (School Info)
  worksheet.mergeCells(2, 1, 2, totalCols);
  const row2 = worksheet.getRow(2);
  row2.height = 24;
  const cell2 = row2.getCell(1);
  cell2.value = `${sekolah.nama_sekolah || 'SMK'} ${sekolah.npsn ? `(NPSN: ${sekolah.npsn})` : ''} ${sekolah.alamat ? `— ${sekolah.alamat}` : ''}`;
  cell2.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF1E293B' } };
  cell2.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' }, // Light slate
  };
  cell2.alignment = { vertical: 'middle', horizontal: 'center' };

  // 3. BANNER HEADER ROW 3 (Filter & Timestamp)
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  const filterDesc = searchParam.trim() ? `${namaKelasFilter} (Pencarian: "${searchParam.trim()}")` : namaKelasFilter;

  worksheet.mergeCells(3, 1, 3, totalCols);
  const row3 = worksheet.getRow(3);
  row3.height = 20;
  const cell3 = row3.getCell(1);
  cell3.value = `Tahun Pelajaran: ${tahun}/${tahun + 1} | Semester: ${semester === 1 ? '1 (Ganjil)' : '2 (Genap)'} | Filter: ${filterDesc} | Diunduh: ${dateFormatted} | Total: ${rows.length} Siswa`;
  cell3.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF475569' } };
  cell3.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' },
  };
  cell3.alignment = { vertical: 'middle', horizontal: 'center' };

  // 4. SPACER ROW 4
  const row4 = worksheet.getRow(4);
  row4.height = 8;

  // 5. TABLE HEADER ROW 5
  const row5 = worksheet.getRow(5);
  row5.height = 28;
  activeCols.forEach((col, idx) => {
    const cell = row5.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF991B1B' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF7F1D1D' } },
      bottom: { style: 'medium', color: { argb: 'FF7F1D1D' } },
      left: { style: 'thin', color: { argb: 'FFB91C1C' } },
      right: { style: 'thin', color: { argb: 'FFB91C1C' } },
    };
  });

  // 6. POPULATE DATA ROWS (Row 6 onwards)
  let countL = 0;
  let countP = 0;

  rows.forEach((s: any, index: number) => {
    const rowNum = 6 + index;
    const dataRow = worksheet.getRow(rowNum);
    dataRow.height = 20;

    // Hitung gender
    const jkStr = (s.jenis_kelamin || '').toLowerCase();
    if (jkStr.startsWith('l')) countL++;
    else if (jkStr.startsWith('p')) countP++;

    // Mapping nilai per kolom
    const jkDisplay = s.jenis_kelamin ? (s.jenis_kelamin.toLowerCase().startsWith('l') ? 'Laki-laki' : 'Perempuan') : '-';
    const jkShort = s.jenis_kelamin ? (s.jenis_kelamin.toLowerCase().startsWith('l') ? 'L' : 'P') : '-';
    const kontakOrtu = s.kontak_ayah || s.kontak_ibu || s.kontak_wali || '-';

    // Tingkat saat ini (X, XI, XII)
    let tingkatSaatIni = '-';
    if (s.tingkat_saat_ini) {
      tingkatSaatIni = s.tingkat_saat_ini;
    } else if (s.kelas_display && s.kelas_display !== 'Belum Bergabung') {
      const parts = s.kelas_display.trim().split(/\s+/);
      tingkatSaatIni = parts[0] || '-';
    }

    let values: any[] = [];
    if (!isLengkap) {
      values = [
        index + 1,
        s.nis || '-',
        s.nisn || '-',
        s.nama_siswa || '-',
        jkShort,
        tingkatSaatIni,
        s.kelas_display || 'Belum Bergabung',
        s.kompetensi_keahlian || '-',
        s.tempat_lahir || '-',
        formatIndoDate(s.tanggal_lahir),
        s.nama_agama || '-',
        s.kontak_siswa || '-',
        s.alamat || '-',
        s.nama_ayah || '-',
        s.nama_ibu || '-',
        kontakOrtu,
      ];
    } else {
      values = [
        index + 1,
        s.nis || '-',
        s.nisn || '-',
        s.nik_pd || '-',
        s.nkk || '-',
        s.nama_siswa || '-',
        jkDisplay,
        tingkatSaatIni,
        s.kelas_display || 'Belum Bergabung',
        s.kompetensi_keahlian || '-',
        s.tempat_lahir || '-',
        formatIndoDate(s.tanggal_lahir),
        s.nama_agama || '-',
        s.nama_hub_keluarga || '-',
        s.anak_ke ?? 0,
        s.jumlah_saudara ?? 0,
        s.kontak_siswa || '-',
        s.alamat || '-',
        s.alamat_orang_tua || '-',
        s.nama_ayah || '-',
        s.nik_ayah || '-',
        s.tahun_ayah || '-',
        s.nama_pendidikan_ayah || s.pendidikan_ayah || '-',
        s.pekerjaan_ayah || '-',
        s.kontak_ayah || '-',
        s.nama_ibu || '-',
        s.nik_ibu || '-',
        s.tahun_ibu || '-',
        s.nama_pendidikan_ibu || s.pendidikan_ibu || '-',
        s.pekerjaan_ibu || '-',
        s.kontak_ibu || '-',
        s.nama_wali || '-',
        s.pekerjaan_wali || '-',
        s.kontak_wali || '-',
        s.alamat_wali || '-',
        s.sekolah_asal || '-',
        s.tabjad_terima_tingkat || s.nama_terima_tingkat || s.terima_tingkat || '-',
        s.terima_kelas || '-',
        formatIndoDate(s.terima_tanggal),
        s.nama_jenis_siswa || (s.jenis_siswa === 1 ? 'Reguler' : 'Pindahan'),
        s.username || '-',
      ];
    }

    const isEven = index % 2 === 0;
    const rowBgColor = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // Alternating zebra

    values.forEach((val, colIdx) => {
      const cell = dataRow.getCell(colIdx + 1);
      const colDef = activeCols[colIdx];

      cell.value = val;
      cell.font = {
        name: 'Segoe UI',
        size: 9.5,
        bold: colDef.isBold || false,
        color: { argb: 'FF1E293B' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBgColor },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colDef.align,
        wrapText: colDef.align === 'left',
      };
      cell.border = thinBorder;

      if (colDef.isText) {
        cell.numFmt = '@'; // Format Text agar angka 0 di depan dan digit panjang tidak rusak
      }
    });
  });

  // 7. SUMMARY FOOTER ROW
  const lastRowNum = 6 + rows.length;
  const summaryRow = worksheet.getRow(lastRowNum);
  summaryRow.height = 24;

  const mergeEndCol = isLengkap ? 6 : 4;
  worksheet.mergeCells(lastRowNum, 1, lastRowNum, mergeEndCol);
  const summaryTitleCell = summaryRow.getCell(1);
  summaryTitleCell.value = 'TOTAL KESELURUHAN';
  summaryTitleCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  summaryTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  summaryTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  const summaryInfoCol = mergeEndCol + 1;
  const summaryInfoEndCol = isLengkap ? 13 : 8;
  worksheet.mergeCells(lastRowNum, summaryInfoCol, lastRowNum, summaryInfoEndCol);
  const summaryInfoCell = summaryRow.getCell(summaryInfoCol);
  summaryInfoCell.value = `${rows.length} Siswa (Laki-laki: ${countL}, Perempuan: ${countP})`;
  summaryInfoCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF991B1B' } };
  summaryInfoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  summaryInfoCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // Sisanya isi background dan border ganda
  for (let c = 1; c <= totalCols; c++) {
    const cell = summaryRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'double', color: { argb: 'FF475569' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  }

  // Aktifkan Auto-Filter pada Baris 5
  worksheet.autoFilter = {
    from: { row: 5, column: 1 },
    to: { row: 5, column: totalCols },
  };

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  const sanitizedSchool = (sekolah.nama_sekolah || 'SMK').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = isLengkap
    ? `Buku_Induk_Siswa_${sanitizedSchool}_${tahun}_${semester === 1 ? 'Ganjil' : 'Genap'}.xlsx`
    : `Data_Siswa_${sanitizedSchool}_${namaKelasFilter.replace(/[^a-zA-Z0-9_-]/g, '_')}_${tahun}_${semester === 1 ? 'Ganjil' : 'Genap'}.xlsx`;

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
