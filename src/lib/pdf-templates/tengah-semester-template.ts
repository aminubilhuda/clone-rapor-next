import { SiswaInfo, SekolahInfo, escapeHtml, wrapHtml } from './rapor-template';

export interface MapelNilai {
  nama_mapel: string;
  nilai: number | null;
  kktp: number;
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
    const mapelRows = siswa.kelompok_mapels.flatMap((km) => {
      const kelompokHeader = `<tr style="background:#FFFEC5;"><td colspan="4" style="padding:5px;height:10px;font-weight:bold;border:1px solid #000;">${escapeHtml(km.huruf)}. ${escapeHtml(km.kelompok)}</td></tr>`;
      const subjectRows = km.mapels.map((m, i) => {
        const nilai = m.nilai ?? 0;
        const predikat = getPredikat(m.nilai, m.kktp);
        const style = getNilaiStyle(m.nilai, m.kktp);
        return `<tr><td style="width:5%;text-align:center;padding:3px;border:1px solid #000;">${i + 1}</td><td style="width:50%;text-align:left;padding:4px;border:1px solid #000;">${escapeHtml(m.nama_mapel)}</td><td style="width:15%;text-align:center;border:1px solid #000;${style}">${nilai || '0'}</td><td style="width:15%;text-align:center;border:1px solid #000;">${predikat}</td></tr>`;
      });
      return kelompokHeader + subjectRows.join('');
    });

    const presensiRows = siswa.presensi.map((p) => `
      <tr><td style="width:50%;text-align:left;padding:3px;border:1px solid #000;">${escapeHtml(p.absen)}</td><td style="width:50%;text-align:left;padding:3px;border:1px solid #000;">${p.jumlah > 0 ? p.jumlah : '-'} Hari</td></tr>
    `).join('');

    const catatanContent = siswa.catatan_wali ? escapeHtml(siswa.catatan_wali) : '';

    return `
    <div class="page">
      <table style="width:100%;border-collapse:collapse;margin-top:5px;font-size:11pt;">
        <tr>
          <td style="width:25%;text-align:left;height:14px;">Nama</td>
          <td style="width:3%;text-align:center;">:</td>
          <td style="width:37%;text-align:left;font-weight:bold;">${escapeHtml(siswa.nama_siswa.toUpperCase())}</td>
          <td style="width:5%;"></td>
          <td style="width:17%;text-align:left;">Kelas</td>
          <td style="width:3%;text-align:center;">:</td>
          <td style="width:17%;text-align:left;font-weight:bold;">${escapeHtml(siswa.nama_kelas.toUpperCase())}</td>
        </tr>
        <tr>
          <td style="width:25%;text-align:left;height:14px;">NIS / NISN</td>
          <td style="width:3%;text-align:center;">:</td>
          <td style="width:37%;text-align:left;font-weight:bold;">${escapeHtml((siswa.nis || '-') + ' / ' + (siswa.nisn || '-'))}</td>
          <td style="width:5%;"></td>
          <td style="width:17%;text-align:left;">Fase</td>
          <td style="width:3%;text-align:center;">:</td>
          <td style="width:17%;text-align:left;font-weight:bold;">${escapeHtml(siswa.fase.toUpperCase())}</td>
        </tr>
        <tr>
          <td style="width:25%;text-align:left;height:14px;">Nama Sekolah</td>
          <td style="width:3%;text-align:center;">:</td>
          <td style="width:37%;text-align:left;font-weight:bold;">${escapeHtml(sekolah.nama_sekolah.toUpperCase())}</td>
          <td style="width:5%;"></td>
          <td style="width:17%;text-align:left;">Semester</td>
          <td style="width:3%;text-align:center;">:</td>
          <td style="width:17%;text-align:left;font-weight:bold;">${escapeHtml(semesterLabel.toUpperCase())}</td>
        </tr>
        <tr>
          <td style="width:25%;text-align:left;height:14px;">Alamat</td>
          <td style="width:3%;text-align:center;">:</td>
          <td style="width:37%;text-align:left;font-weight:bold;">${escapeHtml(sekolah.alamat.toUpperCase())}</td>
          <td style="width:5%;"></td>
          <td style="width:17%;text-align:left;">Tahun Pelajaran</td>
          <td style="width:3%;text-align:center;">:</td>
          <td style="width:17%;text-align:left;font-weight:bold;">${escapeHtml(tahunPelajaran.toUpperCase())}</td>
        </tr>
      </table>
      <hr style="margin:6px 0 10px;border:1px solid #000;">

      <h2 style="text-align:center;font-size:14pt;margin:10px 0;">LAPORAN HASIL BELAJAR TENGAH SEMESTER</h2>

      <table style="width:100%;border-collapse:collapse;" border="1">
        <tr style="background:#FFFEC5;">
          <td style="width:5%;text-align:center;vertical-align:middle;height:26px;font-weight:bold;border:1px solid #000;">No</td>
          <td style="width:60%;text-align:center;vertical-align:middle;font-weight:bold;border:1px solid #000;">Mata Pelajaran</td>
          <td style="width:15%;text-align:center;vertical-align:middle;font-weight:bold;border:1px solid #000;">Nilai</td>
          <td style="width:15%;text-align:center;vertical-align:middle;font-weight:bold;border:1px solid #000;">Predikat</td>
        </tr>
        ${mapelRows}
      </table>

      <h3 style="text-align:left;font-size:11pt;margin:15px 0 5px;font-weight:bold;">KETIDAKHADIRAN</h3>
      <table style="width:50%;border-collapse:collapse;" border="1">
        <tr><td style="width:50%;text-align:left;padding:3px;border:1px solid #000;font-weight:bold;">Absen</td><td style="width:50%;text-align:left;padding:3px;border:1px solid #000;font-weight:bold;">Jumlah</td></tr>
        ${presensiRows}
      </table>

      ${catatanContent ? `
      <h3 style="text-align:left;font-size:11pt;margin:15px 0 5px;font-weight:bold;">CATATAN AKADEMIK</h3>
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
