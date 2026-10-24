import { describe, expect, it } from 'vitest';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { createSemesterRaporDefinition } from '../pdf-templates/semester-pdfmake';
import type { SiswaSemesterRapor } from '../pdf-templates/semester-template';
import { createTengahSemesterRaporDefinition } from '../pdf-templates/tengah-semester-pdfmake';
import type { SiswaMidRapor } from '../pdf-templates/tengah-semester-template';
import { mm } from '../pdf-templates/pdfmake-runtime';

const sekolah = {
  nama_sekolah: 'SMK Negeri 1 Contoh',
  alamat: 'Jl. Pendidikan No. 1',
  logo: null,
  nama_kepsek: 'Kepala Sekolah',
  nip_kepsek: '19700101 199001 1 001',
};

interface TestCell {
  text?: string;
  bold?: boolean;
  rowSpan?: number;
  colSpan?: number;
  alignment?: string;
  verticalAlignment?: string;
  fillColor?: string;
  color?: string;
  margin?: number[];
}

interface TestSubjectTable {
  table: { body: TestCell[][] };
  layout: { hLineWidth: (row: number) => number };
}

function subjectTable(definition: TDocumentDefinitions): TestSubjectTable {
  const content = definition.content as unknown as Array<{
    section: { stack: TestSubjectTable[] };
  }>;
  return content[0].section.stack[3];
}

function rowWith(table: TestSubjectTable, text: string): TestCell[] {
  return table.table.body.find((row) => row.some((cell) => cell.text === text)) ?? [];
}

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
      huruf: 'B',
      kelompok: 'Mata Pelajaran Kejuruan',
      mapels: [
        { nama_mapel: 'Matematika', nilai: 80, kktp: 75 },
        {
          nama_mapel: 'Rekayasa Perangkat Lunak',
          nilai: null,
          kktp: 70,
          children: [
            { nama_mapel: 'Basis Data', nilai: 82, kktp: 70 },
            { nama_mapel: 'Pemrograman Web', nilai: 88, kktp: 70 },
          ],
        },
        { nama_mapel: 'Desain Visual', nilai: 85, kktp: 70 },
      ],
    },
  ],
  presensi: [{ absen: 'Sakit', jumlah: 1 }],
  catatan_wali: '',
  wali_kelas: 'Wali Kelas',
  nip_wali: '19800101 200501 1 001',
  tanggal_mid: '23 Oktober 2026',
  lokasi: 'Contoh',
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

const semesterSiswa: SiswaSemesterRapor = {
  ...midSiswa,
  id_tingkat: 2,
  kelompok_mapels: [
    {
      huruf: 'B',
      kelompok: 'Mata Pelajaran Kejuruan',
      mapels: [
        mapelSemester('Matematika', 80),
        mapelSemester('Rekayasa Perangkat Lunak', 0, {
          children: [
            mapelSemester('Basis Data', 82),
            mapelSemester('Pemrograman Web', 88),
          ],
        }),
        mapelSemester('Desain Visual', 85),
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

const waliKelas = { nama: 'Wali Kelas', nip: '19800101 200501 1 001' };

describe('pdfmake rapor dengan sub-mapel', () => {
  it('semester: nomor induk menggabung blok, anak bernomor inline', () => {
    const table = subjectTable(
      createSemesterRaporDefinition([semesterSiswa], sekolah, '2026-2027', 'Ganjil', waliKelas),
    );

    const induk = rowWith(table, 'Rekayasa Perangkat Lunak');
    expect(induk[0]).toMatchObject({
      text: '2',
      rowSpan: 5,
      alignment: 'center',
      verticalAlignment: 'top',
      margin: [0, mm(1.2), 0, 0],
    });
    expect(induk[1]).toMatchObject({
      text: 'Rekayasa Perangkat Lunak',
      bold: true,
      fillColor: '#F3F4F6',
    });
    expect(induk[2].text).toBe('—');
    expect(induk[3].text).toBe('');

    const basis = rowWith(table, '1. Basis Data');
    expect(basis[0].text).toBeUndefined();
    expect(basis[1]).toMatchObject({
      text: '1. Basis Data',
      rowSpan: 2,
      margin: [mm(4), 0, 0, 0],
    });
    expect(rowWith(table, '2. Pemrograman Web')[1].text).toBe('2. Pemrograman Web');
    expect(rowWith(table, 'Desain Visual')[0].text).toBe('3');
  });

  it('semester: semua garis tabel 0.75 tanpa separator tebal', () => {
    const table = subjectTable(
      createSemesterRaporDefinition([semesterSiswa], sekolah, '2026-2027', 'Ganjil', waliKelas),
    );

    for (let row = 0; row <= table.table.body.length; row += 1) {
      expect(table.layout.hLineWidth(row)).toBe(0.75);
    }
  });

  it('tengah semester: nomor induk menggabung blok, anak bernomor inline', () => {
    const table = subjectTable(
      createTengahSemesterRaporDefinition([midSiswa], sekolah, '2026-2027', 'Ganjil', waliKelas),
    );

    const induk = rowWith(table, 'Rekayasa Perangkat Lunak');
    expect(induk[0]).toMatchObject({
      text: '2',
      rowSpan: 3,
      alignment: 'center',
      verticalAlignment: 'top',
      margin: [0, mm(1.2), 0, 0],
    });
    expect(induk[1]).toMatchObject({
      text: 'Rekayasa Perangkat Lunak',
      bold: true,
      fillColor: '#F3F4F6',
    });
    expect(induk[2].text).toBe('—');

    const basis = rowWith(table, '1. Basis Data');
    expect(basis[0].text).toBeUndefined();
    expect(basis[1]).toMatchObject({
      text: '1. Basis Data',
      margin: [mm(4), 0, 0, 0],
    });
    expect(rowWith(table, '2. Pemrograman Web')[1].text).toBe('2. Pemrograman Web');
    expect(rowWith(table, 'Desain Visual')[0].text).toBe('3');
  });
});
