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
  margin?: number[];
  colSpan?: number;
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

const parentOnly = (): SiswaMidRapor => ({
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
});

const parentOnlySemester = (): SiswaSemesterRapor => ({
  ...semesterSiswa,
  kelompok_mapels: [
    {
      huruf: 'B',
      kelompok: 'Mata Pelajaran Kejuruan',
      mapels: [
        mapelSemester('Rekayasa Perangkat Lunak', 0, {
          children: [
            mapelSemester('Basis Data', 82),
            mapelSemester('Pemrograman Web', 88),
          ],
        }),
      ],
    },
  ],
});

describe('pdfmake rapor dengan sub-mapel', () => {
  it('tengah semester menghitung induk satu nomor dan anak bernomor 1..n', () => {
    const table = subjectTable(
      createTengahSemesterRaporDefinition(
        [midSiswa],
        sekolah,
        '2026-2027',
        'Ganjil',
        { nama: 'Wali Kelas', nip: '19800101 200501 1 001' },
      ),
    );

    const induk = rowWith(table, 'Rekayasa Perangkat Lunak');
    expect(induk[0].text).toBe('2');
    expect(induk[1].bold).toBe(true);
    expect(induk[2].text).toBe('');
    expect(induk[3].text).toBe('');
    expect(induk[0].colSpan).toBeUndefined();

    const basis = rowWith(table, 'Basis Data');
    expect(basis[0].text).toBe('1');
    expect(basis[1].margin).toEqual([mm(5), 0, 0, 0]);
    const web = rowWith(table, 'Pemrograman Web');
    expect(web[0].text).toBe('2');
    expect(web[1].margin).toEqual([mm(5), 0, 0, 0]);
    expect(rowWith(table, 'Desain Visual')[0].text).toBe('3');
  });

  it('tengah semester memberi garis 2px sebelum dan sesudah blok induk', () => {
    const table = subjectTable(
      createTengahSemesterRaporDefinition(
        [midSiswa],
        sekolah,
        '2026-2027',
        'Ganjil',
        { nama: 'Wali Kelas', nip: '19800101 200501 1 001' },
      ),
    );
    const rows = table.table.body;
    const parentIndex = rows.findIndex((row) =>
      row.some((cell) => cell.text === 'Rekayasa Perangkat Lunak'),
    );
    const webIndex = rows.findIndex((row) =>
      row.some((cell) => cell.text === 'Pemrograman Web'),
    );

    expect(table.layout.hLineWidth(parentIndex)).toBe(2);
    expect(table.layout.hLineWidth(webIndex + 1)).toBe(2);
    expect(table.layout.hLineWidth(parentIndex + 1)).toBe(0.75);
    expect(table.layout.hLineWidth(webIndex)).toBe(0.75);

    const onlyParent = subjectTable(
      createTengahSemesterRaporDefinition(
        [parentOnly()],
        sekolah,
        '2026-2027',
        'Ganjil',
        { nama: 'Wali Kelas', nip: '19800101 200501 1 001' },
      ),
    );
    const onlyRows = onlyParent.table.body;
    const onlyParentIndex = onlyRows.findIndex((row) =>
      row.some((cell) => cell.text === 'Rekayasa Perangkat Lunak'),
    );
    expect(onlyParent.layout.hLineWidth(onlyParentIndex)).toBe(0.75);
    expect(onlyParent.layout.hLineWidth(onlyRows.length)).toBe(0.75);
  });

  it('semester menghitung induk satu nomor dan anak bernomor 1..n', () => {
    const table = subjectTable(
      createSemesterRaporDefinition(
        [semesterSiswa],
        sekolah,
        '2026-2027',
        'Ganjil',
        { nama: 'Wali Kelas', nip: '19800101 200501 1 001' },
      ),
    );

    const induk = rowWith(table, 'Rekayasa Perangkat Lunak');
    expect(induk[0].text).toBe('2');
    expect(induk[1].bold).toBe(true);
    expect(induk[2].text).toBe('');
    expect(induk[3].text).toBe('');
    expect(induk[0].colSpan).toBeUndefined();

    const basis = rowWith(table, 'Basis Data');
    expect(basis[0].text).toBe('1');
    expect(basis[1].margin).toEqual([mm(5), 0, 0, 0]);
    const web = rowWith(table, 'Pemrograman Web');
    expect(web[0].text).toBe('2');
    expect(web[1].margin).toEqual([mm(5), 0, 0, 0]);
    expect(rowWith(table, 'Desain Visual')[0].text).toBe('3');
  });

  it('semester memberi garis 2px sebelum dan sesudah blok induk', () => {
    const table = subjectTable(
      createSemesterRaporDefinition(
        [semesterSiswa],
        sekolah,
        '2026-2027',
        'Ganjil',
        { nama: 'Wali Kelas', nip: '19800101 200501 1 001' },
      ),
    );
    const rows = table.table.body;
    const parentIndex = rows.findIndex((row) =>
      row.some((cell) => cell.text === 'Rekayasa Perangkat Lunak'),
    );
    const webIndex = rows.findIndex((row) =>
      row.some((cell) => cell.text === 'Pemrograman Web'),
    );

    expect(table.layout.hLineWidth(parentIndex)).toBe(2);
    expect(table.layout.hLineWidth(webIndex + 2)).toBe(2);
    expect(table.layout.hLineWidth(parentIndex + 1)).toBe(0.75);
    expect(table.layout.hLineWidth(webIndex + 1)).toBe(0.75);

    const onlyParent = subjectTable(
      createSemesterRaporDefinition(
        [parentOnlySemester()],
        sekolah,
        '2026-2027',
        'Ganjil',
        { nama: 'Wali Kelas', nip: '19800101 200501 1 001' },
      ),
    );
    const onlyRows = onlyParent.table.body;
    const onlyParentIndex = onlyRows.findIndex((row) =>
      row.some((cell) => cell.text === 'Rekayasa Perangkat Lunak'),
    );
    expect(onlyParent.layout.hLineWidth(onlyParentIndex)).toBe(0.75);
    expect(onlyParent.layout.hLineWidth(onlyRows.length)).toBe(0.75);
  });
});
