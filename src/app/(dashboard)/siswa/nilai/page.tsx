import { getNilaiSiswa } from '@/lib/siswa-portal-data';

export default async function NilaiSiswaPage() {
  const data = await getNilaiSiswa();
  const nilaiTerisi = data.nilai.filter((item) => item.nilai !== null && item.nilai > 0);
  const rataRata = nilaiTerisi.length
    ? Math.round(nilaiTerisi.reduce((total, item) => total + (item.nilai || 0), 0) / nilaiTerisi.length)
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#1A1A2E]">Nilai Saya</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {data.siswa.nama_siswa} · {data.siswa.nama_kelas} · {data.periode.nama_semester} {data.periode.tahun_pelajaran}
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Rata-rata Nilai', rataRata || '-'],
          ['Mata Pelajaran', data.nilai.length],
          ['Sudah Dinilai', nilaiTerisi.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-black/[0.04] bg-white p-5 premium-shadow">
            <p className="text-sm text-[#6B7280]">{label}</p>
            <p className="mt-2 text-3xl font-bold text-[#1A1A2E]">{value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white premium-shadow">
        <div className="border-b border-black/[0.04] px-5 py-4">
          <h2 className="font-semibold text-[#1A1A2E]">Daftar Nilai Mata Pelajaran</h2>
          <p className="mt-1 text-xs text-[#6B7280]">Nilai semester pada periode aktif</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-[#F8F9FB] text-xs uppercase tracking-wide text-[#6B7280]">
              <tr>
                <th className="w-16 px-5 py-3 text-center">No</th>
                <th className="px-5 py-3">Mata Pelajaran</th>
                <th className="w-28 px-5 py-3 text-center">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {data.nilai.length ? data.nilai.map((item, index) => (
                <tr key={`${item.nama_mapel}-${index}`} className="hover:bg-[#F8F9FB]/70">
                  <td className="px-5 py-3 text-center text-[#9CA3AF]">{index + 1}</td>
                  <td className="px-5 py-3 font-medium text-[#1A1A2E]">{item.nama_mapel}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex min-w-11 justify-center rounded-lg px-2.5 py-1 font-semibold ${
                      !item.nilai ? 'bg-gray-100 text-gray-500' : item.nilai < 75 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {item.nilai || '-'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="px-5 py-12 text-center text-[#9CA3AF]">Belum ada data nilai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
