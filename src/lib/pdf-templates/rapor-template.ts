export type JenisRapor = 'pelengkap' | 'tengah_semester' | 'semester' | 'p5bk' | 'buku_induk';

export interface SiswaInfo {
  id_siswa: number;
  nama_siswa: string;
  nis: string | null;
  nisn: string | null;
  nama_kelas: string;
}

export interface SekolahInfo {
  nama_sekolah: string;
  alamat: string;
  logo: string | null;
  nama_kepsek: string;
  nip_kepsek: string;
}

export function escapeHtml(s: string): string {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function r(value: any): number {
  return Math.round(Number(value) || 0);
}

export function wrapHtml(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 5mm 15mm 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #000; line-height: 1.0; }
  .page { padding: 0; padding-bottom: 22px; }
  .page-break { page-break-after: always; }
  table { font-size: 11pt; }
  thead { display: table-header-group; }
  tr, td, th, tbody { page-break-inside: avoid; break-inside: avoid; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
${content}
</body>
</html>`;
}

const JENIS_LABELS: Record<JenisRapor, string> = {
  pelengkap: 'Pelengkap Rapor',
  tengah_semester: 'Tengah Semester',
  semester: 'Semester',
  p5bk: 'P5BK',
  buku_induk: 'Buku Induk',
};

export function generateRaporHTML(
  jenis: JenisRapor,
  siswaList: SiswaInfo[],
  sekolah: SekolahInfo,
  tahunPelajaran: string,
  semester: string
): string {
  const logoUrl = sekolah.logo
    ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/uploads/sekolah/${sekolah.logo}`
    : '';

  const siswaPages = siswaList.map((siswa) => `
    <div class="page">
      <div class="header">
        ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo" />` : '<div class="logo-placeholder"></div>'}
        <div class="header-text">
          <h1 class="school-name">${sekolah.nama_sekolah}</h1>
          <p class="school-addr">${sekolah.alamat}</p>
        </div>
      </div>

      <div class="divider"></div>

      <h2 class="title">LAPORAN ${JENIS_LABELS[jenis].toUpperCase()}</h2>

      <div class="info-box">
        <table class="info-table">
          <tr><td class="info-label">Nama Siswa</td><td class="info-colon">:</td><td class="info-value">${siswa.nama_siswa}</td></tr>
          <tr><td class="info-label">NIS</td><td class="info-colon">:</td><td class="info-value">${siswa.nis || '-'}</td></tr>
          <tr><td class="info-label">NISN</td><td class="info-colon">:</td><td class="info-value">${siswa.nisn || '-'}</td></tr>
          <tr><td class="info-label">Kelas</td><td class="info-colon">:</td><td class="info-value">${siswa.nama_kelas}</td></tr>
          <tr><td class="info-label">Tahun Pelajaran</td><td class="info-colon">:</td><td class="info-value">${tahunPelajaran}</td></tr>
          <tr><td class="info-label">Semester</td><td class="info-colon">:</td><td class="info-value">${semester}</td></tr>
        </table>
      </div>

      <div class="content-area">
        <p class="placeholder-text">Konten ${JENIS_LABELS[jenis]} akan segera tersedia.</p>
      </div>

      <div class="footer">
        <div class="signature-block">
          <p class="sig-date">........................, ........................</p>
          <p class="sig-title">Kepala ${sekolah.nama_sekolah}</p>
          <div class="sig-line"></div>
          <p class="sig-name">${sekolah.nama_kepsek}</p>
          <p class="sig-nip">NIP. ${sekolah.nip_kepsek}</p>
        </div>
      </div>
    </div>
  `).join('\n    <div class="page-break"></div>\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12pt;
      color: #000;
      line-height: 1.5;
    }
    .page {
      padding: 0;
    }
    .page-break {
      page-break-after: always;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 8px;
    }
    .logo {
      width: 70px;
      height: 70px;
      object-fit: contain;
    }
    .logo-placeholder {
      width: 70px;
      height: 70px;
      border: 1px dashed #ccc;
    }
    .header-text {
      flex: 1;
      text-align: center;
    }
    .school-name {
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }
    .school-addr {
      font-size: 10pt;
      color: #333;
    }
    .divider {
      border-top: 3px double #000;
      margin: 10px 0 15px;
    }
    .title {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 20px;
    }
    .info-box {
      margin-bottom: 20px;
    }
    .info-table {
      border-collapse: collapse;
    }
    .info-label {
      font-weight: normal;
      padding: 2px 8px 2px 0;
      vertical-align: top;
      width: 160px;
    }
    .info-colon {
      padding: 2px 5px;
      vertical-align: top;
    }
    .info-value {
      font-weight: bold;
      padding: 2px 0;
      vertical-align: top;
    }
    .content-area {
      min-height: 300px;
      padding: 20px 0;
      border: 1px dashed #ccc;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .placeholder-text {
      color: #999;
      font-style: italic;
      font-size: 11pt;
    }
    .footer {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }
    .signature-block {
      text-align: center;
      width: 250px;
    }
    .sig-date {
      margin-bottom: 30px;
      font-size: 11pt;
    }
    .sig-title {
      font-size: 11pt;
      margin-bottom: 5px;
    }
    .sig-line {
      border-bottom: 1px solid #000;
      width: 200px;
      margin: 40px auto 5px;
    }
    .sig-name {
      font-weight: bold;
      font-size: 11pt;
    }
    .sig-nip {
      font-size: 10pt;
      color: #333;
    }
  </style>
</head>
<body>
  ${siswaPages}
</body>
</html>`;
}
