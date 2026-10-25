import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBKStats } from '@/lib/actions/bk-actions';
import { BIDANG_LABEL, JENIS_BK, formatTanggal, getJenisConfig } from '@/lib/bk';

export default async function BKDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');

  const stats = await getBKStats();
  const perJenis = stats.perJenis as { jenis: string; jumlah: number }[];
  const maxJenis = Math.max(1, ...perJenis.map((j) => j.jumlah));
  const jenisMap = new Map(perJenis.map((j) => [j.jenis, j.jumlah] as const));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-xl font-semibold text-[#1A1A2E]">Bimbingan Konseling</h4>
          <p className="mt-1 text-sm text-[#6B7280]">Ringkasan layanan BK pada periode aktif.</p>
        </div>
        <Link
          href="/guru/bk/layanan"
          className="inline-flex items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buka Layanan
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Sesi bulan ini</p>
          <p className="mt-2 text-3xl font-bold text-[#1A1A2E]">{stats.sesiBulanIni}</p>
          <p className="mt-1 text-xs text-[#6B7280]">Sesi layanan tercatat</p>
        </div>
        <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Siswa terlayani</p>
          <p className="mt-2 text-3xl font-bold text-[#1A1A2E]">{stats.siswaTerlayani}</p>
          <p className="mt-1 text-xs text-[#6B7280]">Siswa yang pernah mendapat layanan</p>
        </div>
        <div className="col-span-2 rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow sm:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Jenis aktif</p>
          <p className="mt-2 text-3xl font-bold text-[#1A1A2E]">{stats.perJenis.length}</p>
          <p className="mt-1 text-xs text-[#6B7280]">Dari 8 jenis layanan</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow">
          <h5 className="mb-4 text-sm font-semibold text-[#1A1A2E]">Layanan per jenis</h5>
          <div className="space-y-3">
            {JENIS_BK.map((jenis) => {
              const jumlah = jenisMap.get(jenis.key) ?? 0;
              const cfg = getJenisConfig(jenis.key);
              return (
                <div key={jenis.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">{cfg.short}</span>
                    <span className="font-semibold tabular-nums text-[#1A1A2E]">{jumlah}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#F1F2F5]">
                    <div
                      className="h-full rounded-full bg-[#DC2626]"
                      style={{ width: `${(jumlah / maxJenis) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow">
          <h5 className="mb-4 text-sm font-semibold text-[#1A1A2E]">Bidang bimbingan</h5>
          {stats.perBidang.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">Belum ada data bidang.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.perBidang.map((bidang) => (
                <span
                  key={bidang.bidang}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F8F9FB] px-3 py-1.5 text-xs font-medium text-[#1A1A2E]"
                >
                  {BIDANG_LABEL[bidang.bidang] ?? bidang.bidang}
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#DC2626]">
                    {bidang.jumlah}
                  </span>
                </span>
              ))}
            </div>
          )}

          <h5 className="mb-3 mt-6 text-sm font-semibold text-[#1A1A2E]">Layanan terbaru</h5>
          {stats.recent.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">Belum ada layanan.</p>
          ) : (
            <div className="divide-y divide-[rgba(0,0,0,0.04)]">
              {stats.recent.map((row: any) => (
                <Link
                  key={row.id_layanan}
                  href={`/guru/bk/layanan/${row.id_layanan}`}
                  className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-[#DC2626]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1A1A2E]">
                      {getJenisConfig(row.jenis_layanan).label}
                    </p>
                    <p className="truncate text-[11px] text-[#9CA3AF]">
                      {row.peserta} · {row.nama_kelas}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] tabular-nums text-[#6B7280]">
                    {formatTanggal(row.tanggal)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
