import { SiswaInfo, SekolahInfo, escapeHtml, wrapHtml } from './rapor-template';

export interface MapelNilai {
  nama_mapel: string;
  nilai: number | null;
  kktp: number;
  children?: MapelNilai[];
}

export interface KelompokMapelData {
  huruf: string;
  kelompok: string;
  mapels: MapelNilai[];
}

export interface PresensiData {
  absen: string;
  jumlah: number;
}

export interface SiswaMidRapor extends SiswaInfo {
  fase: string;
  id_kelas: number;
  kelompok_mapels: KelompokMapelData[];
  presensi: PresensiData[];
  catatan_wali: string;
  wali_kelas: string;
  nip_wali: string;
  tanggal_mid: string;
  lokasi: string;
}

function getPredikat(nilai: number | null, kktp: number): string {
  if (nilai === null || nilai === 0) return '-';
  if (nilai < 60) return 'D';
  if (nilai < kktp) return 'C';
  if (nilai <= 84) return 'B';
  return 'A';
}

function getNilaiStyle(nilai: number | null, kktp: number): string {
  if (nilai === null || nilai === 0) return 'color:red;';
  if (nilai < kktp) return 'color:red;';
  return 'color:black;';
}

export function generateTengahSemesterRaporHTML(
  siswaList: SiswaMidRapor[],
  sekolah: SekolahInfo,
  tahunPelajaran: string,
  semesterLabel: string,
  waliKelas: { nama: string; nip: string },
): string {
  const siswaPages = siswaList.map((siswa) => {
    const renderMapelRow = (m: MapelNilai, nomor: number) => {
      const nilai = m.nilai ?? 0;
      return `<tr><td style="width:5%;text-align:center;padding:3px;border:1px solid #000;">${nomor}</td><td style="width:50%;text-align:left;padding:4px;border:1px solid #000;">${escapeHtml(m.nama_mapel)}</td><td style="width:15%;text-align:center;border:1px solid #000;${getNilaiStyle(m.nilai, m.kktp)}">${nilai || '0'}</td><td style="width:15%;text-align:center;border:1px solid #000;">${getPredikat(m.nilai, m.kktp)}</td></tr>`;
    };

    const renderChildRow = (m: MapelNilai, nomorAnak: number) => {
      const nilai = m.nilai ?? 0;
      return `<tr><td style="width:50%;text-align:left;padding:4px 4px 4px 16px;border:1px solid #000;">${nomorAnak}. ${escapeHtml(m.nama_mapel)}</td><td style="width:15%;text-align:center;border:1px solid #000;${getNilaiStyle(m.nilai, m.kktp)}">${nilai || '0'}</td><td style="width:15%;text-align:center;border:1px solid #000;">${getPredikat(m.nilai, m.kktp)}</td></tr>`;
    };

    const renderParentRow = (m: MapelNilai, nomor: number, rowspan: number) => `<tr><td style="width:5%;text-align:center;vertical-align:top;padding:6px 3px 3px;border:1px solid #000;" rowspan="${rowspan}">${nomor}</td><td style="width:50%;text-align:left;height:32px;padding:4px;border:1px solid #000;font-weight:bold;background:#F3F4F6;">${escapeHtml(m.nama_mapel)}</td><td style="width:15%;text-align:center;border:1px solid #000;background:#F3F4F6;color:#6B7280;">&mdash;</td><td style="width:15%;text-align:center;border:1px solid #000;background:#F3F4F6;"></td></tr>`;

    const mapelRows = siswa.kelompok_mapels.flatMap((km) => {
      const kelompokHeader = `<tr style="background:#FFFEC5;"><td colspan="4" style="padding:5px;height:10px;font-weight:bold;border:1px solid #000;">${escapeHtml(km.huruf)}. ${escapeHtml(km.kelompok)}</td></tr>`;

      let nomor = 0;
      const subjectRows = km.mapels.flatMap((m) => {
        const children = m.children ?? [];
        if (children.length > 0) {
          nomor += 1;
          return [
            renderParentRow(m, nomor, 1 + children.length),
            ...children.map((child, i) => renderChildRow(child, i + 1)),
          ];
        }
        nomor += 1;
        return [renderMapelRow(m, nomor)];
      });

      return kelompokHeader + subjectRows.join('');
    }).join('');

    const presensiRows = siswa.presensi.map((p) => `
      <tr><td style="width:50%;text-align:left;padding:3px;border:1px solid #000;">${escapeHtml(p.absen)}</td><td style="width:50%;text-align:left;padding:3px;border:1px solid #000;">${p.jumlah > 0 ? p.jumlah : '-'} Hari</td></tr>
    `).join('');

    const catatanContent = siswa.catatan_wali ? escapeHtml(siswa.catatan_wali) : '';

    return `
    <div class="page">
      <table style="width:100%;border-collapse:collapse;margin-top:0;font-size:9pt;">
        <tr>
          <td style="text-align:left;height:20px;white-space:nowrap;padding-right:4px;">Nama</td>
          <td style="text-align:center;width:1%;">:</td>
          <td style="text-align:left;">${escapeHtml(siswa.nama_siswa.toUpperCase())}</td>
          <td style="width:5%;"></td>
          <td style="text-align:left;white-space:nowrap;padding-right:4px;">Kelas</td>
          <td style="text-align:center;width:1%;">:</td>
          <td style="text-align:left;">${escapeHtml(siswa.nama_kelas.toUpperCase())}</td>
        </tr>
        <tr>
          <td style="text-align:left;height:20px;white-space:nowrap;padding-right:4px;">NIS / NISN</td>
          <td style="text-align:center;width:1%;">:</td>
          <td style="text-align:left;">${escapeHtml((siswa.nis || '-') + ' / ' + (siswa.nisn || '-'))}</td>
          <td style="width:5%;"></td>
          <td style="text-align:left;white-space:nowrap;padding-right:4px;">Fase</td>
          <td style="text-align:center;width:1%;">:</td>
          <td style="text-align:left;">${escapeHtml(siswa.fase.toUpperCase())}</td>
        </tr>
        <tr>
          <td style="text-align:left;height:20px;white-space:nowrap;padding-right:4px;">Nama Sekolah</td>
          <td style="text-align:center;width:1%;">:</td>
          <td style="text-align:left;">${escapeHtml(sekolah.nama_sekolah.toUpperCase())}</td>
          <td style="width:5%;"></td>
          <td style="text-align:left;white-space:nowrap;padding-right:4px;">Semester</td>
          <td style="text-align:center;width:1%;">:</td>
          <td style="text-align:left;">${escapeHtml(semesterLabel.toUpperCase())}</td>
        </tr>
        <tr>
          <td style="text-align:left;height:20px;white-space:nowrap;padding-right:4px;">Alamat</td>
          <td style="text-align:center;width:1%;">:</td>
          <td style="text-align:left;">${escapeHtml(sekolah.alamat.toUpperCase())}</td>
          <td style="width:5%;"></td>
          <td style="text-align:left;white-space:nowrap;padding-right:4px;">Tahun Pelajaran</td>
          <td style="text-align:center;width:1%;">:</td>
          <td style="text-align:left;">${escapeHtml(tahunPelajaran.toUpperCase())}</td>
        </tr>
      </table>
      <div class="divider-double"></div>

      <h2 style="text-align:center;font-size:13.5pt;font-weight:bold;margin:10px 0;">LAPORAN HASIL BELAJAR TENGAH SEMESTER</h2>

      <table style="width:100%;border-collapse:collapse;" border="1">
        <tr style="background:#FFFEC5;">
          <td style="width:5%;text-align:center;vertical-align:middle;height:26px;font-weight:bold;border:1px solid #000;">No</td>
          <td style="width:60%;text-align:center;vertical-align:middle;font-weight:bold;border:1px solid #000;">Mata Pelajaran</td>
          <td style="width:15%;text-align:center;vertical-align:middle;font-weight:bold;border:1px solid #000;">Nilai</td>
          <td style="width:15%;text-align:center;vertical-align:middle;font-weight:bold;border:1px solid #000;">Predikat</td>
        </tr>
        ${mapelRows}
      </table>

      <h3 style="text-align:left;font-size:9pt;margin:15px 0 5px;font-weight:bold;">KETIDAKHADIRAN</h3>
      <table style="width:50%;border-collapse:collapse;" border="1">
        <tr><td style="width:50%;text-align:left;padding:3px;border:1px solid #000;font-weight:bold;">Absen</td><td style="width:50%;text-align:left;padding:3px;border:1px solid #000;font-weight:bold;">Jumlah</td></tr>
        ${presensiRows}
      </table>

      ${catatanContent ? `
      <h3 style="text-align:left;font-size:9pt;margin:15px 0 5px;font-weight:bold;">CATATAN AKADEMIK</h3>
      <table style="width:100%;border-collapse:collapse;" border="1">
        <tr><td style="width:100%;text-align:left;padding:5px;height:35px;">${catatanContent}</td></tr>
      </table>` : ''}

      <table style="width:100%;border-collapse:collapse;margin-top:25px;">
        <tr>
          <td style="width:40%;text-align:center;padding:5px;">Mengetahui,</td>
          <td style="width:20%;"></td>
          <td style="width:40%;text-align:center;padding:5px;">${escapeHtml(siswa.lokasi)}, ${escapeHtml(siswa.tanggal_mid)}</td>
        </tr>
        <tr>
          <td style="width:40%;text-align:center;padding:5px;">Orang Tua / Wali Peserta Didik</td>
          <td style="width:20%;"></td>
          <td style="width:40%;text-align:center;padding:5px;">Wali Kelas</td>
        </tr>
        <tr>
          <td style="width:40%;text-align:center;height:40px;"></td>
          <td style="width:20%;height:40px;"></td>
          <td style="width:40%;text-align:center;padding:5px;height:40px;"></td>
        </tr>
        <tr>
          <td style="width:40%;text-align:center;padding:5px;">(....................................................)</td>
          <td style="width:20%;"></td>
          <td style="width:40%;text-align:center;padding:5px;font-weight:bold;text-decoration:underline;">${escapeHtml(waliKelas.nama)}</td>
        </tr>
        <tr>
          <td style="width:40%;text-align:center;padding:5px;"></td>
          <td style="width:20%;"></td>
          <td style="width:40%;text-align:center;padding:5px;">NIP. ${escapeHtml(waliKelas.nip)}</td>
        </tr>
        <tr><td colspan="3" style="height:10px;"></td></tr>
        <tr><td colspan="3" style="text-align:center;padding:5px;">Mengesahkan,</td></tr>
        <tr><td colspan="3" style="text-align:center;padding:5px;">Kepala Sekolah,</td></tr>
        <tr><td colspan="3" style="text-align:center;height:40px;"></td></tr>
        <tr><td colspan="3" style="text-align:center;padding:5px;font-weight:bold;text-decoration:underline;">${escapeHtml(sekolah.nama_kepsek)}</td></tr>
      </table>
    </div>`;
  }).join('\n<div class="page-break"></div>\n');

  return wrapHtml(siswaPages);
}
