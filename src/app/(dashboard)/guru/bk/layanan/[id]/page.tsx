import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getBKLayananDetail } from '@/lib/actions/bk-actions';
import {
  BIDANG_LABEL,
  HEADER_FIELD_LABEL,
  JENIS_FIELDS,
  PESERTA_FIELD_LABEL,
  bidangToArray,
  formatKelamin,
  formatTanggal,
  getJenisConfig,
  isJenisLayananBK,
} from '@/lib/bk';

export default async function BKDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');

  const { id } = await params;
  const idLayanan = Number(id);
  if (!idLayanan) notFound();

  const detail = await getBKLayananDetail(idLayanan);
  if (!detail) notFound();

  const { header, peserta } = detail;
  const jenis = header.jenis_layanan;
  if (!isJenisLayananBK(jenis)) notFound();
  const config = getJenisConfig(jenis);
  const fields = JENIS_FIELDS[jenis];

  const headerEntries = fields.header
    .map((field) => ({
      label: HEADER_FIELD_LABEL[field],
      value: header[field] as string | null,
    }))
    .filter((item) => item.value);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={`/guru/bk/layanan?jenis=${jenis}&kelas=${header.id_kelas}`} className="text-xs text-[#6B7280] hover:text-[#DC2626] print:hidden">
            ← Kembali ke grid
          </Link>
          <h4 className="mt-1 text-xl font-semibold text-[#1A1A2E]">{config.label}</h4>
          <p className="mt-1 text-sm text-[#6B7280]">
            {formatTanggal(header.tanggal_fmt)} · {header.nama_kelas} · {peserta.length} siswa
          </p>
        </div>
        <Link
          href={`/guru/bk/layanan?jenis=${jenis}&kelas=${header.id_kelas}&sesi=${idLayanan}&siswa=${peserta[0]?.id_siswa ?? 0}`}
          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-3 py-2 text-xs font-medium text-[#1A1A2E] transition-colors hover:border-[#DC2626] hover:text-[#DC2626] print:hidden"
        >
          Edit sesi
        </Link>
      </div>

      <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow">
        <h5 className="mb-3 text-sm font-semibold text-[#1A1A2E]">Informasi Sesi</h5>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">Tanggal</p>
            <p className="text-sm text-[#1A1A2E]">{formatTanggal(header.tanggal_fmt)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">Jam</p>
            <p className="text-sm text-[#1A1A2E]">{header.jam ? String(header.jam).slice(0, 5) : '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">Kelas</p>
            <p className="text-sm text-[#1A1A2E]">{header.nama_kelas}</p>
          </div>
          {headerEntries.map((item) => (
            <div key={item.label}>
              <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">{item.label}</p>
              <p className="whitespace-pre-wrap text-sm text-[#1A1A2E]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {peserta.map((row: any) => (
          <div key={row.id_siswa} className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#1A1A2E]">{row.nama_siswa}</p>
                <p className="text-[11px] text-[#9CA3AF]">{row.nis ?? '—'} · {formatKelamin(row.kelamin)}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {bidangToArray(row.bidang_bimbingan).map((b) => (
                  <span key={b} className="rounded-full bg-[#F8F9FB] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">
                    {BIDANG_LABEL[b]}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.peserta
                .map((field) => ({ label: PESERTA_FIELD_LABEL[field], value: row[field] as string | null }))
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">{item.label}</p>
                    <p className="whitespace-pre-wrap text-sm text-[#1A1A2E]">{item.value}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
