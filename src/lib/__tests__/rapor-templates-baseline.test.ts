import { describe, it, expect } from 'vitest';
import {
  generateTengahSemesterRaporHTML,
  type SiswaMidRapor,
} from '../pdf-templates/tengah-semester-template';
import {
  generateSemesterRaporHTML,
  type SiswaSemesterRapor,
} from '../pdf-templates/semester-template';

const sekolah = {
  nama_sekolah: 'SMK Negeri 1 Contoh',
  alamat: 'Jl. Pendidikan No. 1',
  logo: null,
  nama_kepsek: 'Kepala Sekolah',
  nip_kepsek: '19700101 199001 1 001',
};

const midSiswa: SiswaMidRapor = {
  id_siswa: 1,
  nama_siswa: 'Siswa Contoh',
  nis: '123',
  nisn: '456',
  nama_kelas: 'XI RPL',
  fase: 'F',
  id_kelas: 1,
  kelompok_mapels: [
    {
      huruf: 'A',
      kelompok: 'Mata Pelajaran Umum',
      mapels: [
        { nama_mapel: 'Matematika', nilai: 80, kktp: 75 },
        { nama_mapel: 'Bahasa Indonesia', nilai: 85, kktp: 75 },
      ],
    },
    {
      huruf: 'B',
      kelompok: 'Mata Pelajaran Kejuruan',
      mapels: [
        { nama_mapel: 'Rekayasa Perangkat Lunak', nilai: 78, kktp: 70 },
        { nama_mapel: 'Basis Data', nilai: 82, kktp: 70 },
      ],
    },
  ],
  presensi: [{ absen: 'Sakit', jumlah: 1 }],
  catatan_wali: 'Catatan contoh.',
  wali_kelas: 'Wali Kelas',
  nip_wali: '19800101 200501 1 001',
  tanggal_mid: '23 Oktober 2026',
  lokasi: 'Contoh',
};

const semesterSiswa: SiswaSemesterRapor = {
  ...midSiswa,
  id_tingkat: 2,
  kelompok_mapels: [
    {
      huruf: 'A',
      kelompok: 'Mata Pelajaran Umum',
      mapels: [
        {
          nama_mapel: 'Matematika',
          nilai: 80,
          deskripsi_max: 'Baik dalam',
          tujuan_max: 'menyelesaikan persamaan.',
          deskripsi_min: 'Cukup dalam',
          tujuan_min: 'menyelesaikan operasi dasar.',
        },
      ],
    },
    {
      huruf: 'B',
      kelompok: 'Mata Pelajaran Kejuruan',
      mapels: [
        {
          nama_mapel: 'Rekayasa Perangkat Lunak',
          nilai: 78,
          deskripsi_max: 'Baik dalam',
          tujuan_max: 'merancang aplikasi.',
          deskripsi_min: 'Cukup dalam',
          tujuan_min: 'menggunakan alat dasar.',
        },
      ],
    },
  ],
  prakerin: [],
  kokurikuler_text: '',
  eskul: [],
  organisasi: [],
  tanggapan_ortu: '',
  tanggal_rapor: '20 Desember 2026',
  isSemester2: false,
  tingkatNaik: 'XII',
  tahunPelajaran: '2026-2027',
};

describe('rapor dengan sub-mapel', () => {
  it('tengah semester menampilkan induk sebagai header dan anak bernomor ulang', () => {
    const siswa: SiswaMidRapor = {
      ...midSiswa,
      kelompok_mapels: [
        {
          huruf: 'B',
          kelompok: 'Mata Pelajaran Kejuruan',
          mapels: [
            {
              nama_mapel: 'Rekayasa Perangkat Lunak',
              nilai: null,
              kktp: 70,
              children: [
                { nama_mapel: 'Basis Data', nilai: 82, kktp: 70 },
                { nama_mapel: 'Pemrograman Web', nilai: 88, kktp: 70 },
              ],
            },
          ],
        },
      ],
    };

    const html = generateTengahSemesterRaporHTML(
      [siswa],
      sekolah,
      '2026-2027',
      'Ganjil',
      { nama: 'Wali Kelas', nip: '19800101 200501 1 001' }
    );

    expect(html).toContain(
      '<td colspan="4" style="padding:5px;font-weight:bold;border:1px solid #000;">Rekayasa Perangkat Lunak</td>'
    );
    expect(html).toContain('>Basis Data</td>');
    expect(html).toContain('>Pemrograman Web</td>');
    expect(html).toMatch(/>1<\/td><td[^>]*>Basis Data/);
    expect(html).toMatch(/>2<\/td><td[^>]*>Pemrograman Web/);
  });

  it('semester menampilkan induk tanpa nilai', () => {
    const siswa: SiswaSemesterRapor = {
      ...semesterSiswa,
      kelompok_mapels: [
        {
          huruf: 'B',
          kelompok: 'Mata Pelajaran Kejuruan',
          mapels: [
            {
              nama_mapel: 'Rekayasa Perangkat Lunak',
              nilai: 0,
              deskripsi_max: '',
              tujuan_max: '',
              deskripsi_min: '',
              tujuan_min: '',
              children: [
                {
                  nama_mapel: 'Basis Data',
                  nilai: 82,
                  deskripsi_max: 'Baik dalam',
                  tujuan_max: 'basis data.',
                  deskripsi_min: 'Cukup dalam',
                  tujuan_min: 'dasar basis data.',
                },
              ],
            },
          ],
        },
      ],
    };

    const html = generateSemesterRaporHTML(
      [siswa],
      sekolah,
      '2026-2027',
      'Ganjil',
      { nama: 'Wali Kelas', nip: '19800101 200501 1 001' }
    );

    expect(html).toContain(
      '<td colspan="4" style="padding:5px;font-weight:bold;border:1px solid #000;">Rekayasa Perangkat Lunak</td>'
    );
    expect(html).toContain('>Basis Data</td>');
  });
});

describe('baseline rapor tanpa hierarki', () => {
  it('tengah semester tidak berubah', () => {
    expect(
      generateTengahSemesterRaporHTML([midSiswa], sekolah, '2026-2027', 'Ganjil', {
        nama: 'Wali Kelas',
        nip: '19800101 200501 1 001',
      })
    ).toMatchSnapshot();
  });

  it('semester tidak berubah', () => {
    expect(
      generateSemesterRaporHTML([semesterSiswa], sekolah, '2026-2027', 'Ganjil', {
        nama: 'Wali Kelas',
        nip: '19800101 200501 1 001',
      })
    ).toMatchSnapshot();
  });
});
