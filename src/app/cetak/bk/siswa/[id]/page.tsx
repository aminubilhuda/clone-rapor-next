import { Fragment } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { getBKInfoSiswa } from '@/lib/actions/bk-actions';
import {
  BIDANG_LABEL,
  JENIS_BK,
  bidangToArray,
  type JenisLayananBK,
} from '@/lib/bk';
import PrintToolbar from './_components/print-toolbar';

export const dynamic = 'force-dynamic';

interface RowDef {
  label: string;
  field: string;
  header?: boolean;
}

const ROWS: Record<JenisLayananBK, RowDef[]> = {
  konseling_individu: [
    { label: 'Permasalahan', field: 'permasalahan' },
    { label: 'Arahan', field: 'arahan' },
    { label: 'Tindak lanjut', field: 'tindak_lanjut' },
  ],
  konseling_kelompok: [
    { label: 'Permasalahan', field: 'permasalahan' },
    { label: 'Arahan', field: 'arahan' },
    { label: 'Tindak lanjut', field: 'tindak_lanjut' },
  ],
  mediasi: [
    { label: 'Permasalahan', field: 'permasalahan' },
    { label: 'Arahan', field: 'arahan' },
    { label: 'Tindak lanjut', field: 'tindak_lanjut' },
    { label: 'Pelaksana', field: 'pelaksana', header: true },
  ],
  konsultasi: [
    { label: 'Topik', field: 'topik' },
    { label: 'Pelaksana yang dituju', field: 'pelaksana_dituju' },
    { label: 'Hasil', field: 'hasil' },
  ],
  catatan_anekdot: [
    { label: 'Peristiwa', field: 'peristiwa' },
    { label: 'Tempat', field: 'tempat', header: true },
    { label: 'Informan', field: 'informan' },
  ],
  konferensi_kasus: [
    { label: 'Permasalahan', field: 'permasalahan' },
    { label: 'Arahan', field: 'arahan' },
    { label: 'Tindak lanjut', field: 'tindak_lanjut' },
    { label: 'Pihak-pihak yang terlibat', field: 'pihak_terlibat', header: true },
  ],
  home_visit: [
    { label: 'Tujuan home visit', field: 'tujuan', header: true },
    { label: 'Hasil home visit', field: 'hasil' },
    { label: 'Petugas', field: 'petugas', header: true },
  ],
  referal: [
    { label: 'Permasalahan', field: 'permasalahan' },
    { label: 'Pembinaan yang sudah dilakukan', field: 'pembinaan' },
    { label: 'Referal', field: 'referal' },
    { label: 'Dirujuk ke', field: 'dirujuk_ke' },
  ],
};

function tanggalPanjang(value: string | null | undefined, jam: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const formatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);
  return jam ? `${formatted}, pukul ${String(jam).slice(0, 5)}` : formatted;
}

const CSS = `
  @page { size: A4; margin: 10mm 12mm 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #eef0f3; }
  .sheet {
    width: 210mm; min-height: 297mm; margin: 16px auto; padding: 10mm 12mm;
    background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,.12);
    font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; color: #000;
  }
  .kop { display: table; width: 100%; table-layout: fixed; }
  .kop-logo { display: table-cell; width: 64px; vertical-align: middle; text-align: center; }
  .kop-logo img { width: 62px; height: auto; }
  .kop-center { display: table-cell; vertical-align: middle; text-align: center; line-height: 1.2; padding: 0 4px; }
  .kop-line1 { font-size: 11pt; }
  .kop-line2 { font-size: 10pt; }
  .kop-school { font-size: 15pt; font-weight: bold; letter-spacing: .5px; margin: 1px 0; }
  .kop-address, .kop-contact { font-size: 8pt; line-height: 1.25; overflow-wrap: anywhere; }
  .kop-rule { border-top: 2px solid #000; margin: 4px 0 8px; }
  .doc-title {
    background: #f4cccc; border: 1px solid #000; text-align: center;
    font-weight: bold; font-size: 14pt; letter-spacing: 1.5px; padding: 3px 0; margin: 8px 0 10px;
  }
  .identitas { border-collapse: collapse; margin: 6px 0 4px; font-size: 11pt; }
  .identitas td { padding: 1px 5px 1px 0; vertical-align: top; }
  .narasi { margin: 8px 0 10px; font-size: 10.5pt; line-height: 1.4; }
  .bk-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt; }
  .bk-table th, .bk-table td { border: 1px solid #000; padding: 2px 5px; vertical-align: top; }
  .bk-table th { background: #d9ead3; text-align: center; font-weight: bold; font-size: 10.5pt; padding: 3px; }
  .bk-table td.ke { width: 52px; text-align: center; font-weight: bold; }
  .ke-0 { background: #e8e6f5; }
  .ke-1 { background: #d9eaf7; }
  .ke-2 { background: #fce4d6; }
  .label { width: 130px; }
  .value { white-space: pre-wrap; }
  .ttd { margin: 18px 0 0 auto; width: 62%; font-size: 10.5pt; line-height: 1.4; }
  .ttd-space { height: 46px; }
  .ttd-name { font-weight: bold; text-decoration: underline; }
  .bk-section { break-inside: avoid; page-break-inside: avoid; }
  @media print {
    body { background: #fff; }
    .no-print { display: none !important; }
    .sheet { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
  }
`;

export default async function BKInfoCetakPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');

  const { id } = await params;
  const idSiswa = Number(id);
  if (!idSiswa) notFound();

  const [data, sekolah] = await Promise.all([
    getBKInfoSiswa(idSiswa),
    getSekolahWithFilter(),
  ]);
  if (!data) notFound();

  const [[petugas]]: any = await pool.query(
    'SELECT nama, nip FROM users WHERE id_user = ? LIMIT 1',
    [session.user.id_user],
  );
  const [[tahunRow]]: any = await pool.query(
    'SELECT tahun_pelajaran FROM tahun_pelajaran WHERE id_tahun_pelajaran = ? AND deleted_at IS NULL LIMIT 1',
    [sekolah.tahun],
  );

  const { siswa, sessions } = data;
  const semesterLabel = Number(sekolah.semester) === 1 ? 'Ganjil' : 'Genap';
  const tahunPelajaran = String(tahunRow?.tahun_pelajaran ?? '').replace('-', '/');
  const tanggalCetak = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date());

  const byJenis = new Map<string, any[]>();
  for (const row of sessions) {
    const list = byJenis.get(row.jenis_layanan) ?? [];
    list.push(row);
    byJenis.set(row.jenis_layanan, list);
  }

  const isNegeri = String(sekolah.status_sekolah ?? '').toLowerCase() !== 'swasta';
  const line1 = isNegeri
    ? `PEMERINTAH PROVINSI ${String(sekolah.provinsi || 'JAWA TIMUR').toUpperCase()}`
    : `YAYASAN ${String(sekolah.yayasan || '').toUpperCase()}`;
  const line2 = isNegeri ? 'DINAS PENDIDIKAN' : 'SEKOLAH MENENGAH KEJURUAN';

  const alamatLine = [
    sekolah.alamat,
    sekolah.desa ? `Desa ${sekolah.desa}` : '',
    sekolah.kecamatan ? `Kec. ${sekolah.kecamatan}` : '',
    `${sekolah.kabupaten ?? ''} ${sekolah.kode_pos ?? ''}`.trim(),
  ]
    .filter(Boolean)
    .join(' ');

  const teleponLine = [
    sekolah.kontak ? `Telp. ${sekolah.kontak}` : '',
    sekolah.nomor_fax ? `Fax. ${sekolah.nomor_fax}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const kontakLine = [
    sekolah.website ? `Website: ${sekolah.website}` : '',
    sekolah.email ? `E-mail: ${sekolah.email}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <style>{CSS}</style>
      <PrintToolbar backHref={`/guru/bk/siswa/${idSiswa}`} title={`Info Layanan BK - ${siswa.nama_siswa}`} />

      <div className="sheet">
        <div className="kop">
          <div className="kop-logo">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo statis untuk cetak */}
            <img src="/logo-provinsi-jawa-timur.png" alt="Logo provinsi" />
          </div>
          <div className="kop-center">
            <div className="kop-line1">{line1}</div>
            <div className="kop-line2">{line2}</div>
            <div className="kop-school">{String(sekolah.nama_sekolah ?? '').toUpperCase()}</div>
            <div className="kop-address">{alamatLine}</div>
            {teleponLine && <div className="kop-address">{teleponLine}</div>}
            {kontakLine && <div className="kop-contact">{kontakLine}</div>}
          </div>
          <div className="kop-logo">
            {sekolah.logo && (
              // eslint-disable-next-line @next/next/no-img-element -- logo sekolah dari upload
              <img src={`/api/uploads/sekolah/${sekolah.logo}`} alt="Logo sekolah" />
            )}
          </div>
        </div>
        <div className="kop-rule" />

        <div className="doc-title">INFORMASI LAYANAN BIMBINGAN DAN KONSELING</div>

        <table className="identitas">
          <tbody>
            <tr>
              <td>Nama</td>
              <td>:</td>
              <td><strong>{siswa.nama_siswa}</strong></td>
            </tr>
            <tr>
              <td>Kelas</td>
              <td>:</td>
              <td><strong>{siswa.nama_kelas}</strong></td>
            </tr>
          </tbody>
        </table>

        <p className="narasi">
          Layanan Bimbingan dan Konseling yang sudah diterima oleh siswa selama semester{' '}
          {semesterLabel} tahun pelajaran {tahunPelajaran}.
        </p>

        {JENIS_BK.map((jenis) => {
          const list = (byJenis.get(jenis.key) ?? []).slice();
          const slots = Math.max(3, list.length);
          return (
            <section key={jenis.key} className="bk-section">
              <table className="bk-table">
                <thead>
                  <tr>
                    <th colSpan={3}>{jenis.label.toUpperCase()}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: slots }).map((_, index) => {
                    const row = list[index];
                    const values: { label: string; value: string }[] = [
                      {
                        label: 'Hari, tanggal',
                        value: row ? tanggalPanjang(row.tanggal, row.jam) : '',
                      },
                      ...ROWS[jenis.key].map((def) => ({
                        label: def.label,
                        value: row ? String(row[def.field] ?? '') : '',
                      })),
                      {
                        label: 'Bidang Bimbingan',
                        value: row
                          ? bidangToArray(row.bidang_bimbingan)
                              .map((b) => BIDANG_LABEL[b] ?? b)
                              .join(', ')
                          : '',
                      },
                    ];

                    return (
                      <Fragment key={index}>
                        {values.map((item, rowIndex) => (
                          <tr key={`${index}-${rowIndex}`}>
                            {rowIndex === 0 && (
                              <td rowSpan={values.length} className={`ke ke-${index % 3}`}>
                                Ke : {index + 1}
                              </td>
                            )}
                            <td className="label">{item.label}</td>
                            <td className="value">: {item.value}</td>
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}

        <div className="ttd">
          <div>
            {sekolah.kabupaten ?? 'Tuban'}, {tanggalCetak}
          </div>
          <div>Guru Bimbingan dan Konseling,</div>
          <div className="ttd-space" />
          <div className="ttd-name">{petugas?.nama ?? session.user.name ?? ''}</div>
          <div>NIP. {petugas?.nip || '................'}</div>
        </div>
      </div>
    </div>
  );
}
