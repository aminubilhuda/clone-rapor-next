import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { getAgendaBK } from '@/lib/actions/agenda-bk-actions';
import { BIDANG_LABEL, bidangToArray } from '@/lib/bk';
import { formatAgendaDate, formatAgendaRange, groupAgendaByWeek } from '@/lib/agenda-bk';
import PrintToolbar from '@/app/cetak/bk/siswa/[id]/_components/print-toolbar';

export const dynamic = 'force-dynamic';

const CSS = `
  @page { size: A4 landscape; margin: 8mm 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #eef0f3; }
  .sheet {
    width: 297mm; max-width: 100%; min-height: 210mm; margin: 16px auto; padding: 8mm 10mm;
    background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,.12);
    font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #000;
  }
  .kop { text-align: center; line-height: 1.25; }
  .kop-school { font-size: 15pt; font-weight: bold; letter-spacing: .4px; }
  .kop-address { font-size: 8pt; }
  .kop-rule { border-top: 2px solid #000; margin: 5px 0 8px; }
  .doc-title { text-align: center; font-weight: bold; font-size: 13pt; letter-spacing: .8px; margin: 6px 0 2px; }
  .doc-sub { text-align: center; font-size: 9pt; margin-bottom: 8px; }
  .identitas { border-collapse: collapse; font-size: 9.5pt; margin-bottom: 6px; }
  .identitas td { padding: 1px 6px 1px 0; vertical-align: top; }
  .identitas .label { width: 120px; }
  .identitas .colon { width: 8px; }
  .week-block { break-inside: avoid; page-break-inside: avoid; margin-top: 8px; }
  .week-title { font-size: 10pt; font-weight: bold; margin: 0 0 3px; }
  .agenda-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 8pt; margin-bottom: 4px; }
  .agenda-table th, .agenda-table td { border: 1px solid #000; padding: 2px 3px; vertical-align: top; }
  .agenda-table th { background: #d9ead3; text-align: center; font-weight: bold; font-size: 8pt; }
  .agenda-table td.center { text-align: center; }
  .agenda-table .nowrap { white-space: nowrap; }
  .ttd { display: flex; justify-content: space-between; gap: 20mm; margin-top: 12px; font-size: 10pt; break-inside: avoid; page-break-inside: avoid; }
  .ttd-col { width: 45%; }
  .ttd-space { height: 38px; }
  .ttd-name { font-weight: bold; text-decoration: underline; }
  @media print {
    body { background: #fff; }
    .no-print { display: none !important; }
    .sheet { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
  }
`;

export default async function CetakAgendaBKPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');

  const [rows, sekolah] = await Promise.all([getAgendaBK(), getSekolahWithFilter()]);

  const [[petugas]]: any = await pool.query(
    'SELECT nama, nip FROM users WHERE id_user = ? LIMIT 1',
    [session.user.id_user],
  );
  const [[kepsek]]: any = await pool.query(
    `SELECT nama, nip FROM kepala_sekolah
     WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
     ORDER BY id_kepala_sekolah DESC LIMIT 1`,
    [sekolah.tahun, sekolah.semester],
  );
  const [[tahunRow]]: any = await pool.query(
    'SELECT tahun_pelajaran FROM tahun_pelajaran WHERE id_tahun_pelajaran = ? AND deleted_at IS NULL LIMIT 1',
    [sekolah.tahun],
  );

  const semesterLabel = Number(sekolah.semester) === 1 ? 'Ganjil' : 'Genap';
  const tahunPelajaran = String(tahunRow?.tahun_pelajaran ?? '').replace('-', '/');
  const tanggalCetak = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date());
  const weeks = groupAgendaByWeek(rows);
  const periode = rows.length
    ? formatAgendaRange(
        new Date(`${rows[0].tanggal}T00:00:00Z`),
        new Date(`${rows[rows.length - 1].tanggal}T00:00:00Z`),
      )
    : '—';

  return (
    <div>
      <style>{CSS}</style>
      <PrintToolbar backHref="/guru/bk/agenda" title="Agenda Harian BK" />

      <div className="sheet">
        <div className="kop">
          <div className="kop-school">{String(sekolah.nama_sekolah ?? '').toUpperCase()}</div>
          <div className="kop-address">
            {[sekolah.alamat, sekolah.desa ? `Desa ${sekolah.desa}` : '', sekolah.kecamatan ? `Kec. ${sekolah.kecamatan}` : '']
              .filter(Boolean)
              .join(' ')}
          </div>
        </div>
        <div className="kop-rule" />

        <div className="doc-title">AGENDA HARIAN BIMBINGAN DAN KONSELING</div>
        <div className="doc-sub">
          Tahun Pelajaran {tahunPelajaran || '—'} — Semester {semesterLabel}
        </div>

        <table className="identitas">
          <tbody>
            <tr>
              <td className="label">Nama Sekolah</td>
              <td className="colon">:</td>
              <td>{sekolah.nama_sekolah || '—'}</td>
            </tr>
            <tr>
              <td className="label">Guru BK</td>
              <td className="colon">:</td>
              <td>{petugas?.nama || session.user.name || '—'}</td>
            </tr>
            <tr>
              <td className="label">Sasaran</td>
              <td className="colon">:</td>
              <td>Peserta didik kelas X, satu jurusan per hari</td>
            </tr>
            <tr>
              <td className="label">Periode</td>
              <td className="colon">:</td>
              <td>{periode}</td>
            </tr>
            <tr>
              <td className="label">Durasi</td>
              <td className="colon">:</td>
              <td>1 JP = 45 menit. Dalam kelas: 1 JP; luar kelas: 2 JP</td>
            </tr>
            <tr>
              <td className="label">Bidang Layanan</td>
              <td className="colon">:</td>
              <td>Pribadi, sosial, belajar, karier</td>
            </tr>
          </tbody>
        </table>

        {weeks.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>Belum ada agenda pada periode ini.</p>
        ) : (
          weeks.map((week) => (
            <section key={week.key} className="week-block">
              <p className="week-title">
                {week.label} ({week.range})
              </p>
              <table className="agenda-table">
                <colgroup>
                  <col style={{ width: '4%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '21%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '14%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Hari/Tanggal</th>
                    <th>Waktu</th>
                    <th>Jenis Kegiatan/Layanan</th>
                    <th>Bidang</th>
                    <th>Sasaran</th>
                    <th>Hasil</th>
                    <th>Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody>
                  {week.rows.map((row, index) => (
                    <tr key={row.id_agenda}>
                      <td className="center">{index + 1}</td>
                      <td className="nowrap">{formatAgendaDate(row.tanggal)}</td>
                      <td>{row.waktu || '—'}</td>
                      <td>{row.jenis_kegiatan}</td>
                      <td>
                        {bidangToArray(row.bidang)
                          .map((b) => BIDANG_LABEL[b] ?? b)
                          .join(', ') || '—'}
                      </td>
                      <td>{row.sasaran || '—'}</td>
                      <td>{row.hasil || '—'}</td>
                      <td>{row.tindak_lanjut || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))
        )}

        <div className="ttd">
          <div className="ttd-col">
            <div>Mengetahui,</div>
            <div>Kepala Sekolah</div>
            <div className="ttd-space" />
            <div className="ttd-name">{kepsek?.nama || '........................'}</div>
            <div>NIP. {kepsek?.nip || '........................'}</div>
          </div>
          <div className="ttd-col">
            <div>{sekolah.kabupaten || 'Tuban'}, {tanggalCetak}</div>
            <div>Guru Bimbingan dan Konseling,</div>
            <div className="ttd-space" />
            <div className="ttd-name">{petugas?.nama || session.user.name || '........................'}</div>
            <div>NIP. {petugas?.nip || '........................'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
