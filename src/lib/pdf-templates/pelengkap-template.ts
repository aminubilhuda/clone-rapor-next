import { escapeHtml } from './rapor-template';

export interface PelengkapSekolahInfo {
  npsn: string;
  nama_sekolah: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  website: string;
  email: string;
  kontak: string;
  logo_prov: string | null;
  logo: string | null;
  nama_kepsek: string;
  nip_kepsek: string;
}

export interface PelengkapSiswaInfo {
  id_siswa: number;
  nama_siswa: string;
  nik_pd: string | null;
  nkk: string | null;
  nis: string | null;
  nisn: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | Date | null;
  jenis_kelamin: string | null;
  agama: string | null;
  kontak_siswa: string | null;
  jumlah_saudara: number | null;
  anak_ke: number | null;
  nama_ayah: string | null;
  pendidikan_ayah: string | null;
  pekerjaan_ayah: string | null;
  kontak_ayah: string | null;
  nama_ibu: string | null;
  pendidikan_ibu: string | null;
  pekerjaan_ibu: string | null;
  kontak_ibu: string | null;
  alamat: string | null;
  alamat_orang_tua: string | null;
  nama_wali: string | null;
  alamat_wali: string | null;
  pekerjaan_wali: string | null;
  kontak_wali: string | null;
  sekolah_asal: string | null;
  terima_tanggal: string | Date | null;
  terima_kelas: string | null;
  nama_kelas: string;
  kompetensi_keahlian: string | null;
}

const value = (input: unknown): string => {
  if (input === null || input === undefined || input === '' || input === '0') return '-';
  return escapeHtml(String(input));
};

const formatTanggal = (input: string | Date | null): string => {
  if (!input) return '-';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return value(input);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);
};

const infoRow = (nomor: string, label: string, content: unknown): string => `
  <tr>
    <td class="number">${nomor}</td>
    <td class="label">${escapeHtml(label)}</td>
    <td class="colon">:</td>
    <td class="value">${value(content)}</td>
  </tr>`;

export function generatePelengkapRaporHTML(
  siswaList: PelengkapSiswaInfo[],
  sekolah: PelengkapSekolahInfo,
): string {
  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const provinceLogoUrl = `${baseUrl}/api/uploads/sekolah/${encodeURIComponent(
    sekolah.logo_prov || 'logo-provinsi-jawa-timur.png',
  )}`;
  const fallbackProvinceLogoUrl =
    `${baseUrl}/api/uploads/sekolah/logo-provinsi-jawa-timur.png`;
  const schoolLogoUrl = sekolah.logo
    ? `${baseUrl}/api/uploads/sekolah/${encodeURIComponent(sekolah.logo)}`
    : '';

  const students = siswaList.map((siswa) => {
    const tempatTanggalLahir = [
      siswa.tempat_lahir || '',
      formatTanggal(siswa.tanggal_lahir),
    ].filter(Boolean).join(', ');

    return `
    <section class="student">
      <article class="sheet cover">
        <div class="cover-content">
          <img
            class="province-logo"
            src="${escapeHtml(provinceLogoUrl)}"
            alt="Lambang Provinsi Jawa Timur"
            onerror="this.onerror=null;this.src='${escapeHtml(fallbackProvinceLogoUrl)}'"
          />

          <div class="cover-title">
            <strong>RAPOR</strong>
            <strong>SEKOLAH MENENGAH KEJURUAN</strong>
            <strong>(SMK)</strong>
          </div>

          ${schoolLogoUrl
            ? `<div class="school-logo-frame">
                <img
                  class="school-logo"
                  src="${escapeHtml(schoolLogoUrl)}"
                  alt="Logo Sekolah"
                  onerror="this.hidden=true;this.nextElementSibling.hidden=false"
                />
                <div class="school-logo-placeholder" hidden>Logo Kosong</div>
              </div>`
            : '<div class="school-logo-placeholder">Logo Kosong</div>'}

          <div class="competency">
            <strong>KOMPETENSI KEAHLIAN</strong>
            <span>${value(siswa.kompetensi_keahlian)}</span>
          </div>

          <div class="cover-identity">
            <strong>Nama Peserta Didik</strong>
            <div class="identity-box">${value(siswa.nama_siswa).toUpperCase()}</div>
            <strong>NISN / NIS</strong>
            <div class="identity-box">${value(siswa.nisn)} / ${value(siswa.nis)}</div>
          </div>

          <div class="ministry">
            KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH<br />
            REPUBLIK INDONESIA
          </div>
        </div>
      </article>

      <article class="sheet">
        <h3>KETERANGAN TENTANG SEKOLAH</h3>
        <table class="info-table">
          ${infoRow('1.', 'Nama Sekolah', sekolah.nama_sekolah)}
          ${infoRow('2.', 'NPSN', sekolah.npsn)}
          ${infoRow('3.', 'Alamat Sekolah', sekolah.alamat)}
          ${infoRow('4.', 'Desa / Kelurahan', sekolah.desa)}
          ${infoRow('5.', 'Kecamatan', sekolah.kecamatan)}
          ${infoRow('6.', 'Kabupaten / Kota', sekolah.kabupaten)}
          ${infoRow('7.', 'Provinsi', sekolah.provinsi)}
          ${infoRow('8.', 'Nomor Telepon', sekolah.kontak)}
          ${infoRow('9.', 'Website', sekolah.website)}
          ${infoRow('10.', 'E-mail', sekolah.email)}
          ${infoRow('11.', 'Kompetensi Keahlian', siswa.kompetensi_keahlian)}
        </table>
        <div class="approval">
          <div>
            <p>${value(sekolah.kabupaten)}, ................................</p>
            <p>Kepala Sekolah,</p>
            <div class="signature-space"></div>
            <strong>${value(sekolah.nama_kepsek)}</strong>
            <p>NIP. ${value(sekolah.nip_kepsek)}</p>
          </div>
        </div>
      </article>

      <article class="sheet">
        <h3>KETERANGAN TENTANG DIRI PESERTA DIDIK</h3>
        <table class="info-table compact">
          ${infoRow('1.', 'Nama Peserta Didik (Lengkap)', siswa.nama_siswa)}
          ${infoRow('2.', 'Nomor Induk / NISN', `${siswa.nis || '-'} / ${siswa.nisn || '-'}`)}
          ${infoRow('3.', 'NIK', siswa.nik_pd)}
          ${infoRow('4.', 'Nomor Kartu Keluarga', siswa.nkk)}
          ${infoRow('5.', 'Tempat dan Tanggal Lahir', tempatTanggalLahir)}
          ${infoRow('6.', 'Jenis Kelamin', siswa.jenis_kelamin)}
          ${infoRow('7.', 'Agama', siswa.agama)}
          ${infoRow('8.', 'Anak ke', siswa.anak_ke)}
          ${infoRow('9.', 'Jumlah Saudara Kandung', siswa.jumlah_saudara)}
          ${infoRow('10.', 'Alamat Peserta Didik', siswa.alamat)}
          ${infoRow('11.', 'Nomor Telepon', siswa.kontak_siswa)}
          ${infoRow('12.', 'Sekolah Asal', siswa.sekolah_asal)}
          ${infoRow('13.', 'Diterima di sekolah ini', '')}
          ${infoRow('', 'a. Di kelas', siswa.terima_kelas || siswa.nama_kelas)}
          ${infoRow('', 'b. Pada tanggal', formatTanggal(siswa.terima_tanggal))}
          ${infoRow('14.', 'Nama Orang Tua', '')}
          ${infoRow('', 'a. Ayah', siswa.nama_ayah)}
          ${infoRow('', 'b. Ibu', siswa.nama_ibu)}
          ${infoRow('15.', 'Alamat Orang Tua', siswa.alamat_orang_tua)}
          ${infoRow('16.', 'Pekerjaan Orang Tua', '')}
          ${infoRow('', 'a. Ayah', siswa.pekerjaan_ayah)}
          ${infoRow('', 'b. Ibu', siswa.pekerjaan_ibu)}
          ${infoRow('17.', 'Nama Wali', siswa.nama_wali)}
          ${infoRow('18.', 'Alamat Wali', siswa.alamat_wali)}
          ${infoRow('19.', 'Pekerjaan Wali', siswa.pekerjaan_wali)}
        </table>
        <div class="identity-footer">
          <div class="photo-box">Pas Foto<br />3 × 4</div>
          <div class="approval inline">
            <div>
              <p>${value(sekolah.kabupaten)}, ${formatTanggal(siswa.terima_tanggal)}</p>
              <p>Kepala Sekolah,</p>
              <div class="signature-space small"></div>
              <strong>${value(sekolah.nama_kepsek)}</strong>
              <p>NIP. ${value(sekolah.nip_kepsek)}</p>
            </div>
          </div>
        </div>
      </article>

      <article class="sheet transfer">
        <h3>KETERANGAN PINDAH SEKOLAH</h3>
        <p class="transfer-note">
          Nama Peserta Didik: <strong>${value(siswa.nama_siswa).toUpperCase()}</strong>
          &nbsp;&nbsp; NIS / NISN: <strong>${value(siswa.nis)} / ${value(siswa.nisn)}</strong>
        </p>
        <table class="transfer-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kelas yang Ditinggalkan</th>
              <th>Sebab-sebab Keluar atau Atas Permintaan</th>
              <th>Tanda Tangan Kepala Sekolah, Stempel, dan Tanda Tangan Orang Tua/Wali</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: 3 }, () => `
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <p>................................, ........................</p>
                <p>Kepala Sekolah,</p>
                <div class="transfer-signature-space"></div>
                <p>(................................................)</p>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div class="document-note">
          <strong>Catatan:</strong> Buku Laporan Hasil Belajar dibawa oleh peserta didik apabila
          pindah sekolah dan menjadi dokumen berkelanjutan di sekolah penerima.
        </div>
      </article>
    </section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pelengkap Rapor</title>
  <style>
    @page { size: 210mm 330mm; margin: 12mm 15mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #000; font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.35; }
    .sheet { min-height: 294mm; padding: 4mm 2mm; page-break-after: always; break-after: page; }
    .student:last-child .sheet:last-child { page-break-after: auto; break-after: auto; }
    h3 { margin: 4mm 0 8mm; text-align: center; font-size: 14pt; text-decoration: underline; }
    .cover { display: flex; align-items: center; justify-content: center; text-align: center; }
    .cover-content {
      width: 100%;
      min-height: 294mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3mm 0 7mm;
    }
    .province-logo { width: 36mm; height: 51mm; object-fit: contain; }
    .cover-title {
      display: grid;
      gap: 1.5mm;
      margin-top: 7mm;
      font-size: 14pt;
      line-height: 1.2;
    }
    .school-logo-frame, .school-logo, .school-logo-placeholder {
      width: 40mm;
      height: 40mm;
      margin-top: 8mm;
    }
    .school-logo-frame .school-logo,
    .school-logo-frame .school-logo-placeholder {
      margin-top: 0;
    }
    .school-logo {
      object-fit: contain;
    }
    .school-logo-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11pt;
      font-weight: bold;
    }
    .school-logo-placeholder[hidden] { display: none; }
    .competency {
      width: 150mm;
      display: grid;
      gap: 2mm;
      margin-top: 8mm;
      font-size: 13pt;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }
    .competency span { font-weight: bold; }
    .cover-identity {
      width: 100%;
      display: grid;
      justify-items: center;
      gap: 3mm;
      margin-top: 7mm;
      font-size: 13pt;
    }
    .cover-identity strong:not(:first-child) { margin-top: 2mm; }
    .identity-box {
      width: 105mm;
      min-height: 10mm;
      border: 1px solid #000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5mm 4mm;
      font-weight: bold;
      line-height: 1.2;
      overflow-wrap: anywhere;
    }
    .ministry {
      margin-top: auto;
      font-size: 13pt;
      font-weight: bold;
      line-height: 1.12;
    }
    .info-table { width: 100%; border-collapse: collapse; font-size: 10.5pt; }
    .info-table td { padding: 2.5mm 1mm; vertical-align: top; }
    .info-table.compact td { padding: 1.4mm 1mm; }
    .number { width: 8mm; text-align: right; }
    .label { width: 58mm; }
    .colon { width: 5mm; text-align: center; }
    .value { font-weight: 600; }
    .approval { display: flex; justify-content: flex-end; margin-top: 16mm; }
    .approval > div { width: 70mm; text-align: left; }
    .approval p { margin: 1mm 0; }
    .signature-space { height: 22mm; }
    .signature-space.small { height: 14mm; }
    .identity-footer { display: flex; align-items: flex-start; justify-content: space-between; margin: 8mm 8mm 0 15mm; }
    .photo-box { width: 30mm; height: 40mm; border: 1px solid #000; display: flex; align-items: center; justify-content: center; text-align: center; color: #555; }
    .approval.inline { margin: 0; }
    .transfer-note { margin: 0 0 6mm; }
    .transfer-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 8.5pt; }
    .transfer-table th, .transfer-table td { border: 1px solid #000; padding: 2mm; vertical-align: top; }
    .transfer-table th:nth-child(1) { width: 16%; }
    .transfer-table th:nth-child(2) { width: 17%; }
    .transfer-table th:nth-child(3) { width: 27%; }
    .transfer-table th:nth-child(4) { width: 40%; }
    .transfer-table tbody tr { height: 62mm; }
    .transfer-table p { margin: 1mm 0; }
    .transfer-signature-space { height: 27mm; }
    .document-note { margin-top: 8mm; padding: 4mm; border: 1px solid #777; font-size: 9pt; }
    @media screen {
      body { background: #e5e7eb; padding: 16px; }
      .sheet { width: 210mm; min-height: 330mm; margin: 0 auto 16px; padding: 16mm 17mm; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.15); }
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>${students}</body>
</html>`;
}
