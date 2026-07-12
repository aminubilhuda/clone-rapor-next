import { SiswaInfo, SekolahInfo, escapeHtml, r, wrapHtml } from './rapor-template';
import { PresensiData } from './tengah-semester-template';

export interface MapelSemester {
  nama_mapel: string;
  nilai: number;
  deskripsi_max: string;
  tujuan_max: string;
  deskripsi_min: string;
  tujuan_min: string;
}

export interface KelompokSemester {
  huruf: string;
  kelompok: string;
  mapels: MapelSemester[];
}

export interface PrakerinItem {
  mitra: string;
  lokasi: string;
  durasi: string;
  keterangan: string;
}

export interface EskulItem {
  nama_eskul: string;
  predikat: string;
  keterangan: string;
}

export interface OrganisasiItem {
  nama_organisasi: string;
}

export interface SiswaSemesterRapor extends SiswaInfo {
  fase: string;
  id_kelas: number;
  id_tingkat: number;
  kelompok_mapels: KelompokSemester[];
  prakerin: PrakerinItem[];
  kokurikuler_text: string;
  eskul: EskulItem[];
  organisasi: OrganisasiItem[];
  presensi: PresensiData[];
  catatan_wali: string;
  tanggapan_ortu: string;
  tanggal_rapor: string;
  lokasi: string;
  isSemester2: boolean;
  tingkatNaik: string;
  tahunPelajaran: string;
}

export function generateSemesterRaporHTML(
  siswaList: SiswaSemesterRapor[],
  sekolah: SekolahInfo,
  tahunPelajaran: string,
  semesterLabel: string,
  waliKelas: { nama: string; nip: string },
): string {
  const siswaPages = siswaList.map((siswa) => {
    const mapelRows = siswa.kelompok_mapels.flatMap((km) => {
      const kelompokHeader = `<tr><td colspan="4" style="padding:5px;height:10px;font-weight:bold;border:1px solid #000;">${escapeHtml(km.huruf)}. ${escapeHtml(km.kelompok)}</td></tr>`;
      const subjectRows = km.mapels.flatMap((m, i) => {
        const nilaiDisplay = m.nilai === 0 ? "0" : String(r(m.nilai));
        const nilaiStyle = m.nilai === 0 || m.nilai < 75 ? 'color:red;' : 'color:black;';
        return [
          `<tr><td style="width:5%;text-align:center;vertical-align:middle;border:1px solid #000;" rowspan="2">${i + 1}</td><td style="width:30%;text-align:left;padding:3px;vertical-align:middle;border:1px solid #000;" rowspan="2">${escapeHtml(m.nama_mapel)}</td><td style="width:15%;text-align:center;vertical-align:middle;border:1px solid #000;${nilaiStyle}" rowspan="2">${nilaiDisplay}</td><td style="width:50%;text-align:left;padding:3px;vertical-align:middle;border:1px solid #000;">${escapeHtml(m.deskripsi_max)} ${escapeHtml(m.tujuan_max)}</td></tr>`,
          `<tr><td style="width:50%;text-align:left;padding:3px;vertical-align:middle;border:1px solid #000;border-left:none;">${escapeHtml(m.deskripsi_min)} ${escapeHtml(m.tujuan_min)}</td></tr>`
        ];
      });
      return kelompokHeader + subjectRows.join('');
    });

    const prakerinRows = siswa.prakerin.map((p, i) => `
      <tr>
        <td style="width:5%;text-align:center;border:1px solid #000;">${i + 1}</td>
        <td style="width:20%;text-align:left;padding:3px;border:1px solid #000;">${escapeHtml(p.mitra)}</td>
        <td style="width:15%;text-align:center;padding:3px;border:1px solid #000;">${escapeHtml(p.lokasi)}</td>
        <td style="width:10%;text-align:center;padding:3px;border:1px solid #000;">${escapeHtml(p.durasi)}</td>
        <td style="width:50%;text-align:left;padding:3px;border:1px solid #000;">${escapeHtml(p.keterangan)}</td>
      </tr>`).join('');

    const eskulRows = siswa.eskul.length > 0
      ? siswa.eskul.map((e, i) => `
      <tr>
        <td style="width:5%;text-align:center;padding:3px;border:1px solid #000;">${i + 1}</td>
        <td style="width:30%;text-align:center;padding:3px;border:1px solid #000;">${escapeHtml(e.nama_eskul)}</td>
        <td style="width:15%;text-align:center;padding:3px;border:1px solid #000;">${escapeHtml(e.predikat)}</td>
        <td style="width:50%;text-align:left;padding:3px;border:1px solid #000;">${escapeHtml(e.keterangan)}</td>
      </tr>`).join('')
      : `<tr><td style="width:5%;text-align:center;border:1px solid #000;">-</td><td style="width:30%;text-align:center;border:1px solid #000;">-</td><td style="width:15%;text-align:center;border:1px solid #000;">-</td><td style="width:50%;text-align:center;border:1px solid #000;">-</td></tr>`;

    const orgRows = siswa.organisasi.length > 0
      ? siswa.organisasi.map((o, i) => `
      <tr>
        <td style="width:5%;text-align:center;border:1px solid #000;">${i + 1}</td>
        <td style="width:95%;text-align:left;padding:3px;border:1px solid #000;">${escapeHtml(o.nama_organisasi)}</td>
      </tr>`).join('')
      : `<tr><td style="width:5%;text-align:center;border:1px solid #000;">-</td><td style="width:95%;text-align:center;border:1px solid #000;">-</td></tr>`;

    const presensiRows = siswa.presensi.map((p) => `
      <tr>
        <td style="width:60%;text-align:left;padding:3px;border:1px solid #000;">${escapeHtml(p.absen)}</td>
        <td style="width:40%;text-align:left;padding:3px;border:1px solid #000;">${p.jumlah > 0 ? p.jumlah : '-'} Hari</td>
      </tr>`).join('');

    const kenaikanKelas = siswa.isSemester2 ? `
    <div style="page-break-inside:avoid;">
      <table style="width:100%;border-collapse:collapse;margin-top:20px;">
        <tr><td style="width:100%;text-align:left;font-weight:bold;">KETERANGAN KENAIKAN KELAS</td></tr>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;" border="1">
        <tr>
          <td style="width:100%;text-align:left;padding:5px;height:35px;border:1px solid #000;">
            Berdasarkan Hasil Penilaian Semester Ganjil dan Genap Tahun Pelajaran ${escapeHtml(siswa.tahunPelajaran)}, maka Peserta Didik <br> dinyatakan : <b>Naik Ke Tingkat ${escapeHtml(siswa.tingkatNaik)}</b> / <b>Tinggal di Kelas ${escapeHtml(siswa.nama_kelas)}</b>
          </td>
        </tr>
      </table>
    </div>` : '';

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

      <h2 style="text-align:center;font-size:18px;margin:10px 0;">LAPORAN HASIL BELAJAR</h2>

      <table style="width:100%;border-collapse:collapse;" border="1">
        <tr style="background:#f5f3f3;">
          <td style="width:5%;text-align:center;vertical-align:middle;height:30px;font-weight:bold;border:1px solid #000;">No</td>
          <td style="width:30%;text-align:center;vertical-align:middle;height:30px;font-weight:bold;border:1px solid #000;">Mata Pelajaran</td>
          <td style="width:15%;text-align:center;vertical-align:middle;height:30px;font-weight:bold;border:1px solid #000;">Nilai</td>
          <td style="width:50%;text-align:center;vertical-align:middle;height:30px;font-weight:bold;border:1px solid #000;">Capaian Kompetensi</td>
        </tr>
        ${mapelRows}
      </table>

      ${siswa.prakerin.length > 0 ? `
      <div style="page-break-inside:avoid;">
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tr><td style="width:100%;text-align:left;font-weight:bold;">PRAKTIK KERJA INDUSTRI</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:10px;" border="1">
          <tr>
            <td style="width:5%;text-align:center;font-weight:bold;border:1px solid #000;">No</td>
            <td style="width:20%;text-align:center;font-weight:bold;border:1px solid #000;">Mitra DU/DI</td>
            <td style="width:15%;text-align:center;font-weight:bold;border:1px solid #000;">Lokasi</td>
            <td style="width:10%;text-align:center;font-weight:bold;border:1px solid #000;">Lamanya (Bulan)</td>
            <td style="width:50%;text-align:center;font-weight:bold;border:1px solid #000;">Keterangan</td>
          </tr>
          ${prakerinRows}
        </table>
      </div>` : ''}

      <div style="page-break-inside:avoid;">
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tr><td style="width:100%;text-align:left;font-weight:bold;">Kokurikuler</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:10px;" border="1">
          <tr>
            <td style="width:100%;text-align:left;padding:5px;height:35px;border:1px solid #000;">
              ${siswa.kokurikuler_text ? escapeHtml(siswa.kokurikuler_text) : '-'}
            </td>
          </tr>
        </table>
      </div>

      <div style="page-break-inside:avoid;">
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tr><td style="width:100%;text-align:left;font-weight:bold;">Ekstrakurikuler</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:10px;" border="1">
          <tr>
            <td style="width:5%;text-align:center;font-weight:bold;border:1px solid #000;">No</td>
            <td style="width:30%;text-align:center;font-weight:bold;border:1px solid #000;">Ekstrakurikuler</td>
            <td style="width:15%;text-align:center;font-weight:bold;border:1px solid #000;">Predikat</td>
            <td style="width:50%;text-align:center;font-weight:bold;border:1px solid #000;">Keterangan</td>
          </tr>
          ${eskulRows}
        </table>
      </div>

      <div style="page-break-inside:avoid;">
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tr><td style="width:100%;text-align:left;font-weight:bold;">Organisasi</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:10px;" border="1">
          <tr>
            <td style="width:5%;text-align:center;font-weight:bold;border:1px solid #000;">No</td>
            <td style="width:95%;text-align:center;font-weight:bold;border:1px solid #000;">Organisasi</td>
          </tr>
          ${orgRows}
        </table>
      </div>

      <div style="page-break-inside:avoid;">
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tr>
            <td style="width:50%;vertical-align:top;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="text-align:left;font-weight:bold;">Ketidakhadiran</td></tr>
              </table>
              <table style="width:100%;border-collapse:collapse;margin-top:10px;" border="1">
                ${presensiRows}
              </table>
            </td>
            <td style="width:50%;vertical-align:top;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="text-align:left;font-weight:bold;">Catatan Wali Kelas</td></tr>
              </table>
              <table style="width:100%;border-collapse:collapse;margin-top:10px;" border="1">
                <tr><td style="width:100%;text-align:left;height:54px;padding:5px;border:1px solid #000;">${siswa.catatan_wali ? escapeHtml(siswa.catatan_wali) : ''}</td></tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <div style="page-break-inside:avoid;">
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tr><td style="text-align:center;font-weight:bold;">Tanggapan Orang Tua/Wali Murid</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:10px;" border="1">
          <tr><td style="width:100%;text-align:left;height:35px;padding:5px;border:1px solid #000;">${siswa.tanggapan_ortu ? escapeHtml(siswa.tanggapan_ortu) : ''}</td></tr>
        </table>
      </div>

      ${kenaikanKelas}

      <div style="page-break-inside:avoid;">
        <table style="width:100%;border-collapse:collapse;margin-top:25px;">
          <tr>
            <td style="width:40%;text-align:center;padding:5px;">Mengetahui,</td>
            <td style="width:20%;"></td>
            <td style="width:40%;text-align:center;padding:5px;">${escapeHtml(siswa.lokasi)}, ${escapeHtml(siswa.tanggal_rapor)}</td>
          </tr>
          <tr>
            <td style="width:40%;text-align:center;padding:5px;">Orang Tua / Wali Peserta Didik</td>
            <td style="width:20%;"></td>
            <td style="width:40%;text-align:center;padding:5px;">Wali Kelas</td>
          </tr>
          <tr>
            <td style="width:40%;height:40px;"></td>
            <td style="width:20%;height:40px;"></td>
            <td style="width:40%;height:40px;"></td>
          </tr>
          <tr>
            <td style="width:40%;text-align:center;padding:5px;">(....................................................)</td>
            <td style="width:20%;"></td>
            <td style="width:40%;text-align:center;padding:5px;font-weight:bold;text-decoration:underline;">${escapeHtml(waliKelas.nama)}</td>
          </tr>
          <tr>
            <td style="width:40%;"></td>
            <td style="width:20%;"></td>
            <td style="width:40%;text-align:center;padding:5px;">NIP. ${escapeHtml(waliKelas.nip)}</td>
          </tr>
          <tr><td colspan="3" style="height:15px;"></td></tr>
          <tr><td colspan="3" style="text-align:center;padding:5px;">Mengesahkan,</td></tr>
          <tr><td colspan="3" style="text-align:center;padding:5px;">Kepala Sekolah,</td></tr>
          <tr><td colspan="3" style="text-align:center;height:55px;"></td></tr>
          <tr><td colspan="3" style="text-align:center;padding:5px;font-weight:bold;text-decoration:underline;">${escapeHtml(sekolah.nama_kepsek)}</td></tr>
          <tr><td colspan="3" style="text-align:center;padding:5px;">NIP. ${escapeHtml(sekolah.nip_kepsek)}</td></tr>
        </table>
      </div>
    </div>`;
  }).join('\n<div class="page-break"></div>\n');

  return wrapHtml(siswaPages);
}
