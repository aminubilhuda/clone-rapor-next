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

const mapelSemester = (
  nama_mapel: string,
  nilai: number,
  extra: Partial<SiswaSemesterRapor['kelompok_mapels'][number]['mapels'][number]> = {},
): SiswaSemesterRapor['kelompok_mapels'][number]['mapels'][number] => ({
  nama_mapel,
  nilai,
  deskripsi_max: '',
  tujuan_max: '',
  deskripsi_min: '',
  tujuan_min: '',
  ...extra,
});

function rowsOf(html: string): string[] {
  return html.match(/<tr[\s\S]*?<\/tr>/g) ?? [];
}

function rowWith(html: string, text: string): string {
  return rowsOf(html).find((row) => row.includes(text)) ?? '';
}

function midWithHierarchy(mapels: SiswaMidRapor['kelompok_mapels'][number]['mapels']) {
  return generateTengahSemesterRaporHTML(
    [
      {
        ...midSiswa,
        kelompok_mapels: [
          { huruf: 'B', kelompok: 'Mata Pelajaran Kejuruan', mapels },
        ],
      },
    ],
    sekolah,
    '2026-2027',
    'Ganjil',
    { nama: 'Wali Kelas', nip: '19800101 200501 1 001' }
  );
}

function semesterWithHierarchy(
  mapels: SiswaSemesterRapor['kelompok_mapels'][number]['mapels'],
) {
  return generateSemesterRaporHTML(
    [
      {
        ...semesterSiswa,
        kelompok_mapels: [
          { huruf: 'B', kelompok: 'Mata Pelajaran Kejuruan', mapels },
        ],
      },
    ],
    sekolah,
    '2026-2027',
    'Ganjil',
    { nama: 'Wali Kelas', nip: '19800101 200501 1 001' }
  );
}

const midParent = (): SiswaMidRapor['kelompok_mapels'][number]['mapels'][number] => ({
  nama_mapel: 'Rekayasa Perangkat Lunak',
  nilai: null,
  kktp: 70,
  children: [
    { nama_mapel: 'Basis Data', nilai: 82, kktp: 70 },
    { nama_mapel: 'Pemrograman Web', nilai: 88, kktp: 70 },
  ],
});

const semesterParent = (): SiswaSemesterRapor['kelompok_mapels'][number]['mapels'][number] =>
  mapelSemester('Rekayasa Perangkat Lunak', 0, {
    children: [
      mapelSemester('Basis Data', 82, {
        deskripsi_max: 'Baik dalam',
        tujuan_max: 'basis data.',
        deskripsi_min: 'Cukup dalam',
        tujuan_min: 'dasar basis data.',
      }),
      mapelSemester('Pemrograman Web', 88, {
        deskripsi_max: 'Baik dalam',
        tujuan_max: 'web.',
        deskripsi_min: 'Cukup dalam',
        tujuan_min: 'dasar web.',
      }),
    ],
  });

describe('rapor dengan sub-mapel', () => {
  it('tengah semester: nomor induk menggabung blok, anak bernomor inline', () => {
    const html = midWithHierarchy([
      { nama_mapel: 'Matematika', nilai: 80, kktp: 75 },
      midParent(),
      { nama_mapel: 'Desain Visual', nilai: 85, kktp: 70 },
    ]);

    const induk = rowWith(html, 'Rekayasa Perangkat Lunak');
    expect(induk).toMatch(/<td style="[^"]*vertical-align:top[^"]*" rowspan="3">2<\/td>/);
    expect(induk).toMatch(/font-weight:bold[^>]*>Rekayasa Perangkat Lunak/);
    expect(induk).toContain('background:#F3F4F6');
    expect(induk).toContain('&mdash;');
    expect(induk.match(/<td/g)).toHaveLength(4);

    const basis = rowWith(html, 'Basis Data');
    expect(basis).toContain('>1. Basis Data<');
    expect(basis).toContain('padding:4px 4px 4px 16px');
    expect(basis.match(/<td/g)).toHaveLength(3);
    expect(rowWith(html, 'Pemrograman Web')).toContain('>2. Pemrograman Web<');
    expect(rowWith(html, 'Desain Visual')).toMatch(/>3<\/td>/);
  });

  it('semester: nomor induk menggabung blok, anak bernomor inline', () => {
    const html = semesterWithHierarchy([
      mapelSemester('Matematika', 80),
      semesterParent(),
      mapelSemester('Desain Visual', 85),
    ]);

    const induk = rowWith(html, 'Rekayasa Perangkat Lunak');
    expect(induk).toMatch(/<td style="[^"]*vertical-align:top[^"]*" rowspan="5">2<\/td>/);
    expect(induk).toMatch(/font-weight:bold[^>]*>Rekayasa Perangkat Lunak/);
    expect(induk).toContain('background:#F3F4F6');
    expect(induk).toContain('&mdash;');
    expect(induk.match(/<td/g)).toHaveLength(4);

    const basis = rowWith(html, 'Basis Data');
    expect(basis).toContain('>1. Basis Data<');
    expect(basis).toContain('padding:3px 3px 3px 16px');
    expect(basis.match(/<td/g)).toHaveLength(3);
    expect(rowWith(html, 'Pemrograman Web')).toContain('>2. Pemrograman Web<');
    expect(rowWith(html, 'Desain Visual')).toMatch(/>3<\/td>/);
  });

  it('tidak ada garis 2px atau koma nyasar antarkelompok', () => {
    const hierarki = [
      midWithHierarchy([{ nama_mapel: 'Matematika', nilai: 80, kktp: 75 }, midParent()]),
      semesterWithHierarchy([mapelSemester('Matematika', 80), semesterParent()]),
      generateTengahSemesterRaporHTML([midSiswa], sekolah, '2026-2027', 'Ganjil', {
        nama: 'Wali Kelas',
        nip: '19800101 200501 1 001',
      }),
    ];

    for (const html of hierarki) {
      expect(html).not.toContain('2px solid');
      expect(html).not.toMatch(/<\/tr>,\s*<tr/);
    }
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
