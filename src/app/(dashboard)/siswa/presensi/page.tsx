import { getPresensiSiswa } from '@/lib/siswa-portal-data';

export default async function PresensiSiswaPage() {
  const data = await getPresensiSiswa();
  const ketidakhadiran = data.presensi
    .filter((item) => item.absen.trim().toLowerCase() !== 'hadir')
    .reduce((total, item) => total + item.jumlah, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#1A1A2E]">Presensi Saya</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {data.siswa.nama_siswa} · {data.siswa.nama_kelas} · {data.periode.nama_semester} {data.periode.tahun_pelajaran}
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.presensi.map((item) => (
          <div key={item.absen} className="rounded-2xl border border-black/[0.04] bg-white p-5 premium-shadow">
            <p className="text-sm text-[#6B7280]">{item.absen}</p>
            <p className="mt-2 text-3xl font-bold text-[#1A1A2E]">{item.jumlah}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">Hari</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-black/[0.04] bg-white p-6 premium-shadow">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-[#1A1A2E]">Ringkasan Kehadiran</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Akumulasi pada periode akademik aktif.</p>
          </div>
          <div className="rounded-xl bg-amber-50 px-5 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Total Ketidakhadiran</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{ketidakhadiran} hari</p>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border border-black/[0.06]">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FB] text-left text-xs uppercase text-[#6B7280]">
              <tr>
                <th className="px-4 py-3">Status Presensi</th>
                <th className="px-4 py-3 text-right">Jumlah Hari</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {data.presensi.map((item) => (
                <tr key={item.absen}>
                  <td className="px-4 py-3 font-medium text-[#1A1A2E]">{item.absen}</td>
                  <td className="px-4 py-3 text-right text-[#6B7280]">{item.jumlah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
