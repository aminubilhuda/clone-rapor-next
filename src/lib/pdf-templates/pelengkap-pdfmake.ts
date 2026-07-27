import { existsSync, readFileSync } from 'fs';
import { basename, join } from 'path';
import type {
  Content,
  CustomTableLayout,
  TableCell,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { mm, pdfMake } from './pdfmake-runtime';
import type {
  PelengkapSekolahInfo,
  PelengkapSiswaInfo,
} from './pelengkap-template';

const PAGE_WIDTH = mm(210);
const PAGE_HEIGHT = mm(330);
const PAGE_MARGINS: [number, number, number, number] = [
  mm(17),
  mm(16),
  mm(17),
  mm(14),
];
const UPLOAD_DIRECTORY = join(process.cwd(), 'public', 'uploads', 'sekolah');
const FALLBACK_PROVINCE_LOGO = 'logo-provinsi-jawa-timur.png';

const borderlessLayout: CustomTableLayout = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};

const identityBoxLayout: CustomTableLayout = {
  hLineWidth: () => 0.75,
  vLineWidth: () => 0.75,
  hLineColor: () => '#000000',
  vLineColor: () => '#000000',
  paddingLeft: () => mm(4),
  paddingRight: () => mm(4),
  paddingTop: () => mm(1.8),
  paddingBottom: () => mm(1.8),
};

const transferTableLayout: CustomTableLayout = {
  hLineWidth: () => 0.75,
  vLineWidth: () => 0.75,
  hLineColor: () => '#000000',
  vLineColor: () => '#000000',
  paddingLeft: () => mm(2),
  paddingRight: () => mm(2),
  paddingTop: () => mm(2),
  paddingBottom: () => mm(2),
};

const noteLayout: CustomTableLayout = {
  hLineWidth: () => 0.75,
  vLineWidth: () => 0.75,
  hLineColor: () => '#777777',
  vLineColor: () => '#777777',
  paddingLeft: () => mm(4),
  paddingRight: () => mm(4),
  paddingTop: () => mm(4),
  paddingBottom: () => mm(4),
};

function displayValue(input: unknown): string {
  if (input === null || input === undefined || input === '' || input === '0') return '-';
  return String(input);
}

function formatTanggal(input: string | Date | null): string {
  if (!input) return '-';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return displayValue(input);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

function imageDataUri(fileName: string | null): string | null {
  if (!fileName) return null;
  const safeName = basename(fileName);
  if (!safeName || safeName !== fileName) return null;

  const filePath = join(UPLOAD_DIRECTORY, safeName);
  if (!existsSync(filePath)) return null;

  const data = readFileSync(filePath);
  let mimeType: 'image/png' | 'image/jpeg' | null = null;
  if (
    data.length >= 8
    && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    mimeType = 'image/png';
  } else if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    mimeType = 'image/jpeg';
  }

  return mimeType ? `data:${mimeType};base64,${data.toString('base64')}` : null;
}

function provinceLogo(sekolah: PelengkapSekolahInfo): string {
  const configured = imageDataUri(sekolah.logo_prov);
  const fallback = imageDataUri(FALLBACK_PROVINCE_LOGO);
  if (!configured && !fallback) {
    throw new Error('Logo Provinsi Jawa Timur tidak tersedia');
  }
  return configured || fallback as string;
}

function fixedImage(
  image: string,
  widthMm: number,
  heightMm: number,
  marginTopMm = 0,
): Content {
  return {
    table: {
      widths: ['*'],
      heights: [mm(heightMm)],
      body: [[{
        image,
        fit: [mm(widthMm), mm(heightMm)],
        alignment: 'center',
        margin: [0, marginTopMm ? mm(marginTopMm) : 0, 0, 0],
      }]],
    },
    layout: borderlessLayout,
  };
}

function schoolLogoContent(logo: string | null): Content {
  if (logo) return fixedImage(logo, 40, 40);
  return {
    table: {
      widths: ['*'],
      heights: [mm(40)],
      body: [[{
        text: 'Logo Kosong',
        alignment: 'center',
        bold: true,
        fontSize: 11,
        margin: [0, mm(15), 0, 0],
      }]],
    },
    layout: borderlessLayout,
  };
}

function identityBox(text: string): Content {
  return {
    columns: [
      { text: '', width: '*' },
      {
        width: mm(105),
        table: {
          widths: ['*'],
          body: [[{
            text,
            alignment: 'center',
            bold: true,
            fontSize: 13,
          }]],
        },
        layout: identityBoxLayout,
      },
      { text: '', width: '*' },
    ],
    columnGap: 0,
  };
}

function pageHeading(text: string): Content {
  return {
    text,
    alignment: 'center',
    bold: true,
    decoration: 'underline',
    fontSize: 14,
    margin: [0, mm(4), 0, mm(8)],
  };
}

function informationRow(number: string, label: string, value: unknown): TableCell[] {
  return [
    { text: number, alignment: 'right' },
    { text: label },
    { text: ':', alignment: 'center' },
    { text: displayValue(value), bold: true },
  ];
}

function informationTable(body: TableCell[][], compact = false): Content {
  const verticalPadding = compact ? mm(1.15) : mm(2.15);
  return {
    table: {
      widths: [mm(8), mm(58), mm(5), '*'],
      body,
    },
    layout: {
      ...borderlessLayout,
      paddingLeft: () => mm(1),
      paddingRight: () => mm(1),
      paddingTop: () => verticalPadding,
      paddingBottom: () => verticalPadding,
    },
    fontSize: compact ? 9.4 : 10.5,
  };
}

function approvalBlock(
  sekolah: PelengkapSekolahInfo,
  dateText = '................................',
  compact = false,
): Content {
  return {
    stack: [
      { text: `${displayValue(sekolah.kabupaten)}, ${dateText}`, margin: [0, 0, 0, mm(1)] },
      { text: 'Kepala Sekolah,' },
      { text: ' ', margin: [0, 0, 0, compact ? mm(11) : mm(19)] },
      { text: displayValue(sekolah.nama_kepsek), bold: true, decoration: 'underline' },
      { text: `NIP. ${displayValue(sekolah.nip_kepsek)}`, margin: [0, mm(1), 0, 0] },
    ],
    fontSize: 10,
  };
}

function buildCover(
  siswa: PelengkapSiswaInfo,
  sekolah: PelengkapSekolahInfo,
  logoProvinsi: string,
  logoSekolah: string | null,
  pageBreak: boolean,
): Content {
  return {
    stack: [
      fixedImage(logoProvinsi, 36, 51),
      {
        stack: [
          { text: 'RAPOR', bold: true },
          { text: 'SEKOLAH MENENGAH KEJURUAN', bold: true, margin: [0, mm(1.5), 0, 0] },
          { text: '(SMK)', bold: true, margin: [0, mm(1.5), 0, 0] },
        ],
        alignment: 'center',
        fontSize: 14,
        lineHeight: 1.2,
        margin: [0, mm(7), 0, 0],
      },
      {
        stack: [schoolLogoContent(logoSekolah)],
        margin: [0, mm(8), 0, 0],
      },
      {
        stack: [
          { text: 'KOMPETENSI KEAHLIAN', bold: true },
          {
            text: displayValue(siswa.kompetensi_keahlian),
            bold: true,
            margin: [0, mm(2), 0, 0],
          },
        ],
        alignment: 'center',
        fontSize: 13,
        lineHeight: 1.25,
        margin: [mm(13), mm(8), mm(13), 0],
      },
      {
        stack: [
          { text: 'Nama Peserta Didik', bold: true },
          {
            stack: [identityBox(displayValue(siswa.nama_siswa).toUpperCase())],
            margin: [0, mm(3), 0, 0],
          },
          { text: 'NISN / NIS', bold: true, margin: [0, mm(5), 0, 0] },
          {
            stack: [identityBox(`${displayValue(siswa.nisn)} / ${displayValue(siswa.nis)}`)],
            margin: [0, mm(3), 0, 0],
          },
        ],
        alignment: 'center',
        fontSize: 13,
        margin: [0, mm(7), 0, 0],
      },
      {
        text: 'KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH\nREPUBLIK INDONESIA',
        alignment: 'center',
        bold: true,
        fontSize: 13,
        lineHeight: 1.12,
        margin: [0, mm(57), 0, 0],
      },
    ],
    pageBreak: pageBreak ? 'before' : undefined,
  };
}

function buildSchoolPage(
  siswa: PelengkapSiswaInfo,
  sekolah: PelengkapSekolahInfo,
): Content {
  return {
    stack: [
      pageHeading('KETERANGAN TENTANG SEKOLAH'),
      informationTable([
        informationRow('1.', 'Nama Sekolah', sekolah.nama_sekolah),
        informationRow('2.', 'NPSN', sekolah.npsn),
        informationRow('3.', 'Alamat Sekolah', sekolah.alamat),
        informationRow('4.', 'Desa / Kelurahan', sekolah.desa),
        informationRow('5.', 'Kecamatan', sekolah.kecamatan),
        informationRow('6.', 'Kabupaten / Kota', sekolah.kabupaten),
        informationRow('7.', 'Provinsi', sekolah.provinsi),
        informationRow('8.', 'Nomor Telepon', sekolah.kontak),
        informationRow('9.', 'Website', sekolah.website),
        informationRow('10.', 'E-mail', sekolah.email),
        informationRow('11.', 'Kompetensi Keahlian', siswa.kompetensi_keahlian),
      ]),
      {
        columns: [
          { text: '', width: '*' },
          { stack: [approvalBlock(sekolah)], width: mm(70) },
        ],
        margin: [0, mm(16), 0, 0],
      },
    ],
    pageBreak: 'before',
  };
}

function buildStudentPage(
  siswa: PelengkapSiswaInfo,
  sekolah: PelengkapSekolahInfo,
): Content {
  const tempatTanggalLahir = [
    siswa.tempat_lahir || '',
    formatTanggal(siswa.tanggal_lahir),
  ].filter(Boolean).join(', ');

  return {
    stack: [
      pageHeading('KETERANGAN TENTANG DIRI PESERTA DIDIK'),
      informationTable([
        informationRow('1.', 'Nama Peserta Didik (Lengkap)', siswa.nama_siswa),
        informationRow('2.', 'Nomor Induk / NISN', `${siswa.nis || '-'} / ${siswa.nisn || '-'}`),
        informationRow('3.', 'NIK', siswa.nik_pd),
        informationRow('4.', 'Nomor Kartu Keluarga', siswa.nkk),
        informationRow('5.', 'Tempat dan Tanggal Lahir', tempatTanggalLahir),
        informationRow('6.', 'Jenis Kelamin', siswa.jenis_kelamin),
        informationRow('7.', 'Agama', siswa.agama),
        informationRow('8.', 'Anak ke', siswa.anak_ke),
        informationRow('9.', 'Jumlah Saudara Kandung', siswa.jumlah_saudara),
        informationRow('10.', 'Alamat Peserta Didik', siswa.alamat),
        informationRow('11.', 'Nomor Telepon', siswa.kontak_siswa),
        informationRow('12.', 'Sekolah Asal', siswa.sekolah_asal),
        informationRow('13.', 'Diterima di sekolah ini', ''),
        informationRow('', 'a. Di kelas', siswa.terima_kelas || siswa.nama_kelas),
        informationRow('', 'b. Pada tanggal', formatTanggal(siswa.terima_tanggal)),
        informationRow('14.', 'Nama Orang Tua', ''),
        informationRow('', 'a. Ayah', siswa.nama_ayah),
        informationRow('', 'b. Ibu', siswa.nama_ibu),
        informationRow('15.', 'Alamat Orang Tua', siswa.alamat_orang_tua),
        informationRow('16.', 'Pekerjaan Orang Tua', ''),
        informationRow('', 'a. Ayah', siswa.pekerjaan_ayah),
        informationRow('', 'b. Ibu', siswa.pekerjaan_ibu),
        informationRow('17.', 'Nama Wali', siswa.nama_wali),
        informationRow('18.', 'Alamat Wali', siswa.alamat_wali),
        informationRow('19.', 'Pekerjaan Wali', siswa.pekerjaan_wali),
      ], true),
      {
        columns: [
          {
            width: mm(55),
            stack: [{
              table: {
                widths: [mm(30)],
                heights: [mm(40)],
                body: [[{
                  text: 'Pas Foto\n3 x 4',
                  alignment: 'center',
                  color: '#555555',
                  margin: [0, mm(13), 0, 0],
                }]],
              },
              layout: identityBoxLayout,
            }],
            margin: [mm(15), 0, 0, 0],
          },
          { text: '', width: '*' },
          {
            width: mm(70),
            stack: [approvalBlock(sekolah, formatTanggal(siswa.terima_tanggal), true)],
          },
        ],
        margin: [0, mm(8), mm(8), 0],
      },
    ],
    pageBreak: 'before',
  };
}

function transferSignatureCell(): TableCell {
  return {
    stack: [
      { text: '................................, ........................' },
      { text: 'Kepala Sekolah,', margin: [0, mm(1), 0, 0] },
      { text: ' ', margin: [0, 0, 0, mm(25)] },
      { text: '(................................................)' },
    ],
  };
}

function buildTransferPage(siswa: PelengkapSiswaInfo): Content {
  const emptyTransferRow = (): TableCell[] => [
    { text: '' },
    { text: '' },
    { text: '' },
    transferSignatureCell(),
  ];

  return {
    stack: [
      pageHeading('KETERANGAN PINDAH SEKOLAH'),
      {
        text: [
          'Nama Peserta Didik: ',
          { text: displayValue(siswa.nama_siswa).toUpperCase(), bold: true },
          '     NIS / NISN: ',
          { text: `${displayValue(siswa.nis)} / ${displayValue(siswa.nisn)}`, bold: true },
        ],
        margin: [0, 0, 0, mm(6)],
      },
      {
        table: {
          headerRows: 1,
          widths: ['16%', '17%', '27%', '40%'],
          heights: (rowIndex: number) => rowIndex === 0 ? 'auto' : mm(62),
          body: [
            [
              { text: 'Tanggal', bold: true, alignment: 'center' },
              { text: 'Kelas yang Ditinggalkan', bold: true, alignment: 'center' },
              { text: 'Sebab-sebab Keluar atau Atas Permintaan', bold: true, alignment: 'center' },
              {
                text: 'Tanda Tangan Kepala Sekolah, Stempel, dan Tanda Tangan Orang Tua/Wali',
                bold: true,
                alignment: 'center',
              },
            ],
            emptyTransferRow(),
            emptyTransferRow(),
            emptyTransferRow(),
          ],
        },
        layout: transferTableLayout,
        fontSize: 8.5,
      },
      {
        table: {
          widths: ['*'],
          body: [[{
            text: [
              { text: 'Catatan: ', bold: true },
              'Buku Laporan Hasil Belajar dibawa oleh peserta didik apabila pindah sekolah dan menjadi dokumen berkelanjutan di sekolah penerima.',
            ],
          }]],
        },
        layout: noteLayout,
        fontSize: 9,
        margin: [0, mm(8), 0, 0],
      },
    ],
    pageBreak: 'before',
  };
}

export function createPelengkapRaporDefinition(
  siswaList: PelengkapSiswaInfo[],
  sekolah: PelengkapSekolahInfo,
): TDocumentDefinitions {
  if (siswaList.length === 0) {
    throw new Error('Tidak ada data siswa untuk Pelengkap Rapor');
  }

  const logoProvinsi = provinceLogo(sekolah);
  const logoSekolah = imageDataUri(sekolah.logo);
  const content: Content[] = [];

  siswaList.forEach((siswa, index) => {
    content.push(
      buildCover(siswa, sekolah, logoProvinsi, logoSekolah, index > 0),
      buildSchoolPage(siswa, sekolah),
      buildStudentPage(siswa, sekolah),
      buildTransferPage(siswa),
    );
  });

  return {
    pageSize: {
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
    },
    pageMargins: PAGE_MARGINS,
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      lineHeight: 1.35,
      color: '#000000',
    },
    info: {
      title: 'Pelengkap Rapor',
      subject: 'Pelengkap Rapor Peserta Didik',
      author: displayValue(sekolah.nama_sekolah),
      creator: 'E-Rapor SMK',
    },
    content,
  };
}

export async function generatePelengkapRaporPdf(
  siswaList: PelengkapSiswaInfo[],
  sekolah: PelengkapSekolahInfo,
): Promise<Buffer> {
  const definition = createPelengkapRaporDefinition(siswaList, sekolah);
  return pdfMake.createPdf(definition).getBuffer();
}
