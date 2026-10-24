import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { getRekapKelengkapanPembina, labelKelengkapan } from '@/lib/kelengkapan-ekstra';

function StatusBadge({ belum }: { belum: number }) {
  if (belum === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        Lengkap
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      {belum} belum lengkap
    </span>
  );
}

export default async function KelengkapanEkstraPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    redirect('/login');
  }

  const sekolah = await getSekolahWithFilter();
  const [tpRows]: any = await pool.query(
    'SELECT tahun_pelajaran FROM tahun_pelajaran WHERE id_tahun_pelajaran = ?',
    [sekolah.tahun],
  );
  const [smRows]: any = await pool.query(
    'SELECT semester FROM semester WHERE id_semester = ?',
    [sekolah.semester],
  );
  const tahunPelajaran = tpRows[0]?.tahun_pelajaran || '-';
  const semesterLabel = smRows[0]?.semester || '-';

  const rekap = await getRekapKelengkapanPembina(sekolah.tahun, sekolah.semester);
  const totalItem = rekap.reduce((n, p) => n + p.eskul.length + p.organisasi.length, 0);
  const totalBelum = rekap.reduce((n, p) => n + p.belumLengkap, 0);
  const pembinaBelum = rekap.filter((p) => p.belumLengkap > 0).length;

  return (
    <div>
      <h4 className="text-xl font-semibold text-[#1A1A2E]">Kelengkapan Ekstra &amp; Organisasi</h4>
      <p className="mt-1 text-sm text-[#6B7280]">
        Status pengisian anggota dan predikat oleh pembina — periode {semesterLabel} {tahunPelajaran}.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-4 premium-shadow">
          <div className="text-2xl font-bold text-[#1A1A2E]">{rekap.length}</div>
          <div className="mt-1 text-sm text-[#6B7280]">Pembina ekstra/organisasi</div>
        </div>
        <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-4 premium-shadow">
          <div className="text-2xl font-bold text-amber-600">{pembinaBelum}</div>
          <div className="mt-1 text-sm text-[#6B7280]">Pembina belum lengkap</div>
        </div>
        <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white p-4 premium-shadow">
          <div className="text-2xl font-bold text-[#1A1A2E]">
            {totalBelum}
            <span className="text-sm font-normal text-[#6B7280]"> / {totalItem}</span>
          </div>
          <div className="mt-1 text-sm text-[#6B7280]">Item belum lengkap</div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[rgba(0,0,0,0.04)] bg-white premium-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F8F9FB] text-left text-xs uppercase tracking-wide text-[#6B7280]">
                <th className="px-4 py-3">Pembina</th>
                <th className="px-4 py-3">Ekstrakurikuler</th>
                <th className="px-4 py-3">Organisasi</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rekap.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-[#6B7280]">
                    Belum ada pembina pada periode ini.
                  </td>
                </tr>
              )}
              {rekap.map((p) => (
                <tr key={p.idUser} className="border-b border-[rgba(0,0,0,0.04)] last:border-0 align-top">
                  <td className="px-4 py-3 font-medium text-[#1A1A2E]">{p.nama}</td>
                  <td className="px-4 py-3">
                    {p.eskul.length === 0 ? (
                      <span className="text-xs text-[#9CA3AF]">—</span>
                    ) : (
                      <ul className="space-y-1.5">
                        {p.eskul.map((item) => (
                          <li key={item.id} className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                                item.lengkap ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <span>
                              <span className="text-[#1A1A2E]">{item.nama}</span>
                              <span className="block text-xs text-[#6B7280]">
                                {labelKelengkapan(item)}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.organisasi.length === 0 ? (
                      <span className="text-xs text-[#9CA3AF]">—</span>
                    ) : (
                      <ul className="space-y-1.5">
                        {p.organisasi.map((item) => (
                          <li key={item.id} className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                                item.lengkap ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <span>
                              <span className="text-[#1A1A2E]">{item.nama}</span>
                              <span className="block text-xs text-[#6B7280]">
                                {labelKelengkapan(item)}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge belum={p.belumLengkap} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
