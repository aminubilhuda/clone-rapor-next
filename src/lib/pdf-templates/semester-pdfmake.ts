import type {
  Content,
  CustomTableLayout,
  DynamicContent,
  TableCell,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import type { SekolahInfo } from './rapor-template';
import type { SiswaSemesterRapor } from './semester-template';
import { mm, pdfMake } from './pdfmake-runtime';

const PAGE_SIZE = { width: mm(210), height: mm(330) };
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

function value(input: unknown): string {
  return input === null || input === undefined || input === '' ? '-' : String(input);
}

function informationSide(
  rows: Array<[string, unknown]>,
  options: {
    valueWidth?: number | '*';
    valueAlignment?: 'left' | 'right';
    noWrapValues?: boolean;
  } = {},
): Content {
  return {
    table: {
      widths: [mm(27), mm(4), options.valueWidth ?? '*'],
      body: rows.map(([label, input]) => [
        { text: label, noWrap: true },
        { text: ':', alignment: 'center' },
        {
          text: value(input).toUpperCase(),
          alignment: options.valueAlignment ?? 'left',
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
  siswa: SiswaSemesterRapor,
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
          valueAlignment: 'left',
          noWrapValues: true,
        })],
      },
    ],
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

function competenceText(description: string, goal: string): string {
  return [description, goal].filter(Boolean).join(' ').trim();
}

function subjectTable(siswa: SiswaSemesterRapor): Content {
  const headerColor = '#E4E6EB';
  const body: TableCell[][] = [[
    { text: 'No', bold: true, alignment: 'center', fillColor: headerColor },
    { text: 'Mata Pelajaran', bold: true, alignment: 'center', fillColor: headerColor },
    { text: 'Nilai', bold: true, alignment: 'center', fillColor: headerColor },
    { text: 'Capaian Kompetensi', bold: true, alignment: 'center', fillColor: headerColor },
  ]];

  for (const kelompok of siswa.kelompok_mapels) {
    body.push([
      {
        text: `${value(kelompok.huruf)}. ${value(kelompok.kelompok)}`,
        colSpan: 4,
        bold: true,
      },
      {},
      {},
      {},
    ]);

    kelompok.mapels.forEach((mapel, index) => {
      const nilai = Math.round(Number(mapel.nilai) || 0);
      const nilaiColor = nilai === 0 || nilai < 75 ? '#ff0000' : '#000000';
      body.push([
        { text: String(index + 1), rowSpan: 2, alignment: 'center', margin: [0, mm(4), 0, 0] },
        {
          text: value(mapel.nama_mapel),
          rowSpan: 2,
          alignment: 'left',
          verticalAlignment: 'middle',
        },
        {
          text: String(nilai),
          rowSpan: 2,
          alignment: 'center',
          color: nilaiColor,
          margin: [0, mm(4), 0, 0],
        },
        {
          text: competenceText(mapel.deskripsi_max, mapel.tujuan_max),
        },
      ]);
      body.push([
        {},
        {},
        {},
        {
          text: competenceText(mapel.deskripsi_min, mapel.tujuan_min),
        },
      ]);
    });
  }

  return {
    table: {
      headerRows: 1,
      widths: [mm(9), mm(45), mm(18), '*'],
      body,
      dontBreakRows: true,
    },
    layout: borderedLayout,
    fontSize: 9,
  };
}

function heading(text: string, top = 5): Content {
  return {
    text,
    bold: true,
    margin: [0, mm(top), 0, mm(2.5)],
  };
}

function prakerinTable(siswa: SiswaSemesterRapor): Content[] {
  const rows: TableCell[][] = [[
    { text: 'No', bold: true, alignment: 'center' },
    { text: 'Mitra DU/DI', bold: true, alignment: 'center' },
    { text: 'Lokasi', bold: true, alignment: 'center' },
    { text: 'Lamanya (Bulan)', bold: true, alignment: 'center' },
    { text: 'Keterangan', bold: true, alignment: 'center' },
  ]];

  if (siswa.prakerin.length === 0) {
    rows.push(Array.from({ length: 5 }, () => ({ text: '-', alignment: 'center' })));
  } else {
    siswa.prakerin.forEach((item, index) => {
      rows.push([
        { text: String(index + 1), alignment: 'center' },
        { text: value(item.mitra) },
        { text: value(item.lokasi), alignment: 'center' },
        { text: value(item.durasi), alignment: 'center' },
        { text: value(item.keterangan) },
      ]);
    });
  }

  return [
    heading('PRAKTIK KERJA INDUSTRI'),
    {
      table: {
        headerRows: 1,
        widths: [mm(9), mm(35), mm(26), mm(24), '*'],
        body: rows,
        dontBreakRows: true,
      },
      layout: borderedLayout,
    },
  ];
}

function cocurricularBlock(siswa: SiswaSemesterRapor): Content[] {
  return [
    heading('Kokurikuler'),
    {
      table: {
        widths: ['*'],
        heights: [mm(12)],
        body: [[{ text: siswa.kokurikuler_text || '-' }]],
      },
      layout: borderedLayout,
    },
  ];
}

function extracurricularTable(siswa: SiswaSemesterRapor): Content {
  const headerColor = '#E4E6EB';
  const rows: TableCell[][] = [[
    { text: 'No', bold: true, alignment: 'center', fillColor: headerColor },
    { text: 'Ekstrakurikuler', bold: true, alignment: 'center', fillColor: headerColor },
    { text: 'Predikat', bold: true, alignment: 'center', fillColor: headerColor },
    { text: 'Keterangan', bold: true, alignment: 'center', fillColor: headerColor },
  ]];

  if (siswa.eskul.length === 0) {
    rows.push(Array.from({ length: 4 }, () => ({ text: '-', alignment: 'center' })));
  } else {
    siswa.eskul.forEach((item, index) => {
      rows.push([
        { text: String(index + 1), alignment: 'center' },
        { text: value(item.nama_eskul), alignment: 'center' },
        { text: value(item.predikat), alignment: 'center' },
        { text: value(item.keterangan) },
      ]);
    });
  }

  return {
    table: {
      headerRows: 1,
      widths: [mm(9), mm(50), mm(25), '*'],
      body: rows,
      dontBreakRows: true,
    },
    layout: borderedLayout,
    margin: [0, mm(4), 0, 0],
  };
}

function organizationTable(siswa: SiswaSemesterRapor): Content {
  const headerColor = '#E4E6EB';
  const rows: TableCell[][] = [[
    { text: 'No', bold: true, alignment: 'center', fillColor: headerColor },
    { text: 'Organisasi', bold: true, alignment: 'center', fillColor: headerColor },
  ]];

  if (siswa.organisasi.length === 0) {
    rows.push([
      { text: '-', alignment: 'center' },
      { text: '-', alignment: 'center' },
    ]);
  } else {
    siswa.organisasi.forEach((item, index) => {
      rows.push([
        { text: String(index + 1), alignment: 'center' },
        { text: value(item.nama_organisasi) },
      ]);
    });
  }

  return {
    table: {
      headerRows: 1,
      widths: [mm(9), '*'],
      body: rows,
      dontBreakRows: true,
    },
    layout: borderedLayout,
    margin: [0, mm(4), 0, 0],
  };
}

function attendanceTable(siswa: SiswaSemesterRapor): Content {
  const headerColor = '#E4E6EB';
  const rows: TableCell[][] = [[
    { text: 'Absen', bold: true, fillColor: headerColor },
    { text: 'Jumlah', bold: true, fillColor: headerColor },
  ]];

  siswa.presensi.forEach((item) => {
    rows.push([
      { text: value(item.absen) },
      { text: `${item.jumlah > 0 ? item.jumlah : '-'} Hari` },
    ]);
  });

  return {
    table: {
      widths: ['60%', '40%'],
      body: rows,
      dontBreakRows: true,
    },
    layout: borderedLayout,
    margin: [0, mm(4), 0, 0],
  };
}

function notesAndDecision(siswa: SiswaSemesterRapor): Content[] {
  const content: Content[] = [
    {
      stack: [
        heading('CATATAN WALI KELAS', 4),
        {
          table: {
            widths: ['*'],
            heights: [mm(18)],
            body: [[{ text: siswa.catatan_wali || '' }]],
          },
          layout: borderedLayout,
        },
      ],
      unbreakable: true,
    },
    {
      stack: [
        {
          text: 'Tanggapan Orang Tua/Wali Murid',
          bold: true,
          alignment: 'center',
          margin: [0, mm(5), 0, mm(2.5)],
        },
        {
          table: {
            widths: ['*'],
            heights: [mm(14)],
            body: [[{ text: siswa.tanggapan_ortu || '' }]],
          },
          layout: borderedLayout,
        },
      ],
      unbreakable: true,
    },
  ];

  if (siswa.isSemester2) {
    content.push({
      stack: [
        heading('Keputusan'),
        {
          table: {
            widths: ['*'],
            body: [[{
              text: [
                `Berdasarkan Hasil Penilaian Semester Ganjil dan Genap Tahun Pelajaran ${value(siswa.tahunPelajaran)}, maka Peserta Didik\n`,
                'dinyatakan : ',
                { text: `Naik Ke Tingkat ${value(siswa.tingkatNaik)}`, bold: true },
                ' / ',
                { text: `Tinggal di Kelas ${value(siswa.nama_kelas)}`, bold: true },
              ],
            }]],
          },
          layout: borderedLayout,
        },
      ],
      unbreakable: true,
    });
  }

  return content;
}

function signatureArea(
  siswa: SiswaSemesterRapor,
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
              { text: `${value(siswa.lokasi)}, ${value(siswa.tanggal_rapor)}` },
              { text: 'Wali Kelas', margin: [0, mm(2), 0, 0] },
              { text: ' ', margin: [0, 0, 0, mm(12)] },
              {
                text: value(waliKelas.nama),
                bold: true,
                decoration: 'underline',
              },
              { text: `NIP. ${value(waliKelas.nip)}`, margin: [0, mm(1), 0, 0] },
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
            text: value(sekolah.nama_kepsek),
            bold: true,
            decoration: 'underline',
          },
          { text: `NIP. ${value(sekolah.nip_kepsek)}`, margin: [0, mm(1), 0, 0] },
        ],
        alignment: 'center',
        margin: [0, mm(5), 0, 0],
      },
    ],
    unbreakable: true,
    margin: [0, mm(7), 0, 0],
  };
}

function studentFooter(siswa: SiswaSemesterRapor): DynamicContent {
  const identity = `${value(siswa.nama_kelas)} | ${value(siswa.nama_siswa)} | ${value(siswa.nis)}${siswa.nisn ? `/${siswa.nisn}` : ''}`;
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
    italics: true,
    fontSize: 9,
    margin: [mm(14.5), 0, mm(15.7), 0],
  });
}

function studentContent(
  siswa: SiswaSemesterRapor,
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
        text: 'LAPORAN HASIL BELAJAR',
        alignment: 'center',
        bold: true,
        fontSize: 13.5,
        margin: [0, 0, 0, mm(3)],
      },
      subjectTable(siswa),
      ...prakerinTable(siswa),
      ...cocurricularBlock(siswa),
      extracurricularTable(siswa),
      organizationTable(siswa),
      attendanceTable(siswa),
      ...notesAndDecision(siswa),
      signatureArea(siswa, sekolah, waliKelas),
    ],
  };
}

export function createSemesterRaporDefinition(
  siswaList: SiswaSemesterRapor[],
  sekolah: SekolahInfo,
  tahunPelajaran: string,
  semesterLabel: string,
  waliKelas: { nama: string; nip: string },
): TDocumentDefinitions {
  if (siswaList.length === 0) {
    throw new Error('Tidak ada data siswa untuk Rapor Semester');
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
      title: 'Rapor Semester',
      subject: 'Laporan Hasil Belajar',
      author: value(sekolah.nama_sekolah),
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

export async function generateSemesterRaporPdf(
  siswaList: SiswaSemesterRapor[],
  sekolah: SekolahInfo,
  tahunPelajaran: string,
  semesterLabel: string,
  waliKelas: { nama: string; nip: string },
): Promise<Buffer> {
  return pdfMake.createPdf(
    createSemesterRaporDefinition(
      siswaList,
      sekolah,
      tahunPelajaran,
      semesterLabel,
      waliKelas,
    ),
  ).getBuffer();
}
