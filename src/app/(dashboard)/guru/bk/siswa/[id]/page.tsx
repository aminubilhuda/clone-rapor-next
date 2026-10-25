import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getBKInfoSiswa } from '@/lib/actions/bk-actions';
import {
  BIDANG_LABEL,
  JENIS_BK,
  JENIS_FIELDS,
  PESERTA_FIELD_LABEL,
  bidangToArray,
  formatKelamin,
  formatTanggal,
  getJenisConfig,
  isJenisLayananBK,
} from '@/lib/bk';

export default async function BKInfoSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');

  const { id } = await params;
  const idSiswa = Number(id);
  if (!idSiswa) notFound();

  const data = await getBKInfoSiswa(idSiswa);
  if (!data) notFound();

  const { siswa, sessions } = data;
  const byJenis = new Map<string, any[]>();
  for (const session of sessions) {
    const list = byJenis.get(session.jenis_layanan) ?? [];
    list.push(session);
    byJenis.set(session.jenis_layanan, list);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/guru/bk/siswa" className="text-xs text-[#6B7280] hover:text-[#DC2626] print:hidden">
            ← Data Siswa
          </Link>
          <h4 className="mt-1 text-xl font-semibold text-[#1A1A2E]">{siswa.nama_siswa}</h4>
          <p className="mt-1 text-sm text-[#6B7280]">
            {siswa.nama_kelas} · {siswa.nis ?? '—'} · {formatKelamin(siswa.kelamin)}
          </p>
        </div>
        <Link
          href={`/cetak/bk/siswa/${idSiswa}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak Info Siswa
        </Link>
      </div>

      <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-5 premium-shadow">
        <div className="flex items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.06)] pb-3">
          <h5 className="text-sm font-semibold text-[#1A1A2E]">Informasi Layanan Bimbingan dan Konseling</h5>
          <span className="text-xs text-[#9CA3AF]">{sessions.length} sesi</span>
        </div>

        {sessions.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#9CA3AF]">Belum ada layanan untuk siswa ini.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {JENIS_BK.map((jenis) => {
              const list = byJenis.get(jenis.key) ?? [];
              if (list.length === 0) return null;
              const config = getJenisConfig(jenis.key);
              const fields = isJenisLayananBK(jenis.key) ? JENIS_FIELDS[jenis.key].peserta : [];
              return (
                <section key={jenis.key}>
                  <h6 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
                    <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                    {config.label}
                    <span className="text-[11px] font-normal text-[#9CA3AF]">({list.length} sesi)</span>
                  </h6>
                  <div className="space-y-3">
                    {list.map((session: any, index: number) => (
                      <div key={session.id_layanan} className="rounded-lg border border-[rgba(0,0,0,0.06)] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-[#1A1A2E]">
                            Sesi {index + 1} · {formatTanggal(session.tanggal)}
                            {session.jam ? ` · ${String(session.jam).slice(0, 5)}` : ''}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {bidangToArray(session.bidang_bimbingan).map((b) => (
                              <span key={b} className="rounded-full bg-[#F8F9FB] px-2 py-0.5 text-[10px] text-[#6B7280]">
                                {BIDANG_LABEL[b]}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {fields
                            .map((field) => ({ label: PESERTA_FIELD_LABEL[field], value: session[field] as string | null }))
                            .filter((item) => item.value)
                            .map((item) => (
                              <div key={item.label}>
                                <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">{item.label}</p>
                                <p className="whitespace-pre-wrap text-xs text-[#1A1A2E]">{item.value}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
