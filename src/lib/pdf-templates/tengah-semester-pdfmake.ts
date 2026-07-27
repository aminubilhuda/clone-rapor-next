import type {
  Content,
  CustomTableLayout,
  DynamicContent,
  TableCell,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import type { SekolahInfo } from './rapor-template';
import type {
  SiswaMidRapor,
} from './tengah-semester-template';
import { mm, pdfMake } from './pdfmake-runtime';

const PAGE_SIZE = {
  width: mm(210),
  height: mm(330),
};
const PAGE_MARGINS: [number, number, number, number] = [
  mm(14.5),
  mm(6.2),
  mm(15.7),
  mm(17),
];
const RIGHT_INFORMATION_VALUE_WIDTH = mm(15.2);
const RIGHT_INFORMATION_WIDTH = mm(27 + 4 + 15.2);

const borderlessLayout: CustomTableLayout = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};

const borderedLayout: CustomTableLayout = {
  hLineWidth: () => 0.75,
  vLineWidth: () => 0.75,
  hLineColor: () => '#000000',
  vLineColor: () => '#000000',
  paddingLeft: () => mm(1.4),
  paddingRight: () => mm(1.4),
  paddingTop: () => mm(1),
  paddingBottom: () => mm(1),
};

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function getPredikat(nilai: number | null, kktp: number): string {
  if (nilai === null || nilai === 0) return '-';
  if (nilai < 60) return 'D';
  if (nilai < kktp) return 'C';
  if (nilai <= 84) return 'B';
  return 'A';
}

function informationSide(
  rows: Array<[string, unknown]>,
  options: {
    valueWidth?: number | '*';
    noWrapValues?: boolean;
  } = {},
): Content {
  return {
    table: {
      widths: [mm(27), mm(4), options.valueWidth ?? '*'],
      body: rows.map(([label, value]) => [
        { text: label, noWrap: true },
        { text: ':', alignment: 'center' },
        {
          text: displayValue(value).toUpperCase(),
          alignment: 'left',
          noWrap: options.noWrapValues ?? false,
        },
      ]),
    },
    layout: {
      ...borderlessLayout,
      paddingRight: (columnIndex: number) => columnIndex === 0 ? mm(1) : 0,
      paddingTop: () => mm(0.7),
      paddingBottom: () => mm(0.7),
    },
  };
}

function studentInformation(
  siswa: SiswaMidRapor,
  sekolah: SekolahInfo,
  tahunPelajaran: string,
  semesterLabel: string,
): Content {
  return {
    columns: [
      {
        width: '*',
        stack: [informationSide([
          ['Nama', siswa.nama_siswa],
          ['NIS / NISN', `${siswa.nis || '-'} / ${siswa.nisn || '-'}`],
          ['Nama Sekolah', sekolah.nama_sekolah],
          ['Alamat', sekolah.alamat],
        ])],
      },
      { text: '', width: mm(5) },
      {
        width: RIGHT_INFORMATION_WIDTH,
        stack: [informationSide([
          ['Kelas', siswa.nama_kelas],
          ['Fase', siswa.fase],
          ['Semester', semesterLabel],
          ['Tahun Pelajaran', tahunPelajaran],
        ], {
          valueWidth: RIGHT_INFORMATION_VALUE_WIDTH,
          noWrapValues: true,
        })],
      },
    ],
    columnGap: 0,
    fontSize: 9,
  };
}

function divider(): Content {
  return {
    canvas: [
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: mm(179.8),
        y2: 0,
        lineWidth: 0.75,
        lineColor: '#555555',
      },
      {
        type: 'line',
        x1: 0,
        y1: 2,
        x2: mm(179.8),
        y2: 2,
        lineWidth: 0.75,
        lineColor: '#555555',
      },
    ],
    margin: [0, mm(2), 0, mm(3.5)],
  };
}

function subjectTable(siswa: SiswaMidRapor): Content {
  const body: TableCell[][] = [[
    { text: 'No', bold: true, alignment: 'center', fillColor: '#FFFEC5' },
    { text: 'Mata Pelajaran', bold: true, alignment: 'center', fillColor: '#FFFEC5' },
    { text: 'Nilai', bold: true, alignment: 'center', fillColor: '#FFFEC5' },
    { text: 'Predikat', bold: true, alignment: 'center', fillColor: '#FFFEC5' },
  ]];

  for (const kelompok of siswa.kelompok_mapels) {
    body.push([
      {
        text: `${displayValue(kelompok.huruf)}. ${displayValue(kelompok.kelompok)}`,
        colSpan: 4,
        bold: true,
        fillColor: '#FFFEC5',
      },
      {},
      {},
      {},
    ]);

    kelompok.mapels.forEach((mapel, index) => {
      const nilai = mapel.nilai ?? 0;
      body.push([
        { text: String(index + 1), alignment: 'center' },
        { text: displayValue(mapel.nama_mapel) },
        {
          text: String(nilai || 0),
          alignment: 'center',
          color: mapel.nilai === null || nilai < mapel.kktp ? '#ff0000' : '#000000',
        },
        {
          text: getPredikat(mapel.nilai, mapel.kktp),
          alignment: 'center',
        },
      ]);
    });
  }

  return {
    table: {
      headerRows: 1,
      widths: [mm(9), '*', mm(25), mm(25)],
      body,
      dontBreakRows: true,
    },
    layout: borderedLayout,
    fontSize: 9,
  };
}

function attendanceTable(siswa: SiswaMidRapor): Content {
  const rows: TableCell[][] = [
    [
      { text: 'Absen', bold: true },
      { text: 'Jumlah', bold: true },
    ],
    ...siswa.presensi.map((presensi) => [
      { text: displayValue(presensi.absen) },
      { text: `${presensi.jumlah > 0 ? presensi.jumlah : '-'} Hari` },
    ]),
  ];

  return {
    columns: [
      {
        width: '50%',
        table: {
          widths: ['50%', '50%'],
          body: rows,
        },
        layout: borderedLayout,
      },
      { text: '', width: '*' },
    ],
    fontSize: 9,
  };
}

function academicNote(siswa: SiswaMidRapor): Content[] {
  if (!siswa.catatan_wali) return [];
  return [
    {
      text: 'CATATAN AKADEMIK',
      bold: true,
      fontSize: 9,
      margin: [0, mm(5), 0, mm(1.5)],
    },
    {
      table: {
        widths: ['*'],
        heights: [mm(9)],
        body: [[{ text: siswa.catatan_wali }]],
      },
      layout: borderedLayout,
      fontSize: 9,
    },
  ];
}

function signatureArea(
  siswa: SiswaMidRapor,
  sekolah: SekolahInfo,
  waliKelas: { nama: string; nip: string },
): Content {
  return {
    stack: [
      {
        columns: [
          {
            width: '40%',
            stack: [
              { text: 'Mengetahui,' },
              { text: 'Orang Tua / Wali Peserta Didik', margin: [0, mm(2), 0, 0] },
              { text: ' ', margin: [0, 0, 0, mm(12)] },
              { text: '(....................................................)' },
            ],
            alignment: 'center',
          },
          { text: '', width: '20%' },
          {
            width: '40%',
            stack: [
              { text: `${displayValue(siswa.lokasi)}, ${displayValue(siswa.tanggal_mid)}` },
              { text: 'Wali Kelas', margin: [0, mm(2), 0, 0] },
              { text: ' ', margin: [0, 0, 0, mm(12)] },
              {
                text: displayValue(waliKelas.nama),
                bold: true,
                decoration: 'underline',
              },
              { text: `NIP. ${displayValue(waliKelas.nip)}`, margin: [0, mm(1), 0, 0] },
            ],
            alignment: 'center',
          },
        ],
      },
      {
        stack: [
          { text: 'Mengesahkan,' },
          { text: 'Kepala Sekolah,', margin: [0, mm(2), 0, 0] },
          { text: ' ', margin: [0, 0, 0, mm(12)] },
          {
            text: displayValue(sekolah.nama_kepsek),
            bold: true,
            decoration: 'underline',
          },
        ],
        alignment: 'center',
        margin: [0, mm(5), 0, 0],
      },
    ],
    fontSize: 9,
    unbreakable: true,
    margin: [0, mm(7), 0, 0],
  };
}

function studentFooter(siswa: SiswaMidRapor): DynamicContent {
  const identity = `${displayValue(siswa.nama_kelas)} | ${displayValue(siswa.nama_siswa)} | ${displayValue(siswa.nis)}${siswa.nisn ? `/${siswa.nisn}` : ''}`;
  return (currentPage, pageCount) => ({
    stack: [
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: mm(179.8),
            y2: 0,
            lineWidth: 0.75,
            lineColor: '#555555',
          },
          {
            type: 'line',
            x1: 0,
            y1: 2,
            x2: mm(179.8),
            y2: 2,
            lineWidth: 0.75,
            lineColor: '#555555',
          },
        ],
      },
      {
        columns: [
          { text: identity, width: '*' },
          { text: `Halaman: ${currentPage} / ${pageCount}`, width: 'auto', alignment: 'right' },
        ],
        margin: [0, mm(3.4), 0, 0],
      },
    ],
    font: 'Roboto',
    italics: true,
    fontSize: 9,
    margin: [mm(14.5), 0, mm(15.7), 0],
  });
}

function studentContent(
  siswa: SiswaMidRapor,
  sekolah: SekolahInfo,
  tahunPelajaran: string,
  semesterLabel: string,
  waliKelas: { nama: string; nip: string },
): Content {
  return {
    stack: [
      studentInformation(siswa, sekolah, tahunPelajaran, semesterLabel),
      divider(),
      {
        text: 'LAPORAN HASIL BELAJAR TENGAH SEMESTER',
        alignment: 'center',
        bold: true,
        fontSize: 13.5,
        margin: [0, 0, 0, mm(3)],
      },
      subjectTable(siswa),
      {
        text: 'KETIDAKHADIRAN',
        bold: true,
        fontSize: 9,
        margin: [0, mm(5), 0, mm(1.5)],
      },
      attendanceTable(siswa),
      ...academicNote(siswa),
      signatureArea(siswa, sekolah, waliKelas),
    ],
  };
}

export function createTengahSemesterRaporDefinition(
  siswaList: SiswaMidRapor[],
  sekolah: SekolahInfo,
  tahunPelajaran: string,
  semesterLabel: string,
  waliKelas: { nama: string; nip: string },
): TDocumentDefinitions {
  if (siswaList.length === 0) {
    throw new Error('Tidak ada data siswa untuk Rapor Tengah Semester');
  }

  return {
    pageSize: PAGE_SIZE,
    pageMargins: PAGE_MARGINS,
    defaultStyle: {
      font: 'Roboto',
      fontSize: 9,
      lineHeight: 1.1,
      color: '#000000',
    },
    info: {
      title: 'Rapor Tengah Semester',
      subject: 'Laporan Hasil Belajar Tengah Semester',
      author: displayValue(sekolah.nama_sekolah),
      creator: 'E-Rapor SMK',
    },
    content: siswaList.map((siswa) => ({
      section: studentContent(siswa, sekolah, tahunPelajaran, semesterLabel, waliKelas),
      pageSize: PAGE_SIZE,
      pageMargins: PAGE_MARGINS,
      footer: studentFooter(siswa),
    })),
  };
}

export async function generateTengahSemesterRaporPdf(
  siswaList: SiswaMidRapor[],
  sekolah: SekolahInfo,
  tahunPelajaran: string,
  semesterLabel: string,
  waliKelas: { nama: string; nip: string },
): Promise<Buffer> {
  return pdfMake.createPdf(
    createTengahSemesterRaporDefinition(
      siswaList,
      sekolah,
      tahunPelajaran,
      semesterLabel,
      waliKelas,
    ),
  ).getBuffer();
}
