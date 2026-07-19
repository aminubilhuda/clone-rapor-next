import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { redirect } from 'next/navigation';

async function getKelasKu(idUser: number) {
  const sekolah = await getSekolahWithFilter();

  const [mapelKelas]: any = await pool.query(`
    SELECT mk.*, m.nama_mapel, m.s_mapel, m.urut, k.nama_kelas,
      (SELECT COUNT(*) FROM tujuan_pembelajaran tp
       WHERE tp.tahun = mk.tahun AND tp.semester = mk.semester
         AND tp.id_mapel = mk.id_mapel AND tp.id_user = mk.id_user
         AND tp.id_kelas = mk.id_kelas) AS jumlah_tp
    FROM mapel_kelas mk
    JOIN mapel m ON mk.id_mapel = m.id_mapel
    JOIN kelas k ON mk.id_kelas = k.id_kelas
    WHERE mk.tahun = ? AND mk.semester = ? AND mk.id_user = ?
    ORDER BY m.urut ASC
  `, [sekolah.tahun, sekolah.semester, idUser]);

  return { mapelKelas, sekolah };
}

export default async function KelasKuPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3 || !session.user.id_user) redirect('/login');

  const data = await getKelasKu(session.user.id_user);
  if (!data) return <div className="text-red-500">Gagal memuat data.</div>;

  const { mapelKelas, sekolah } = data;

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6 text-[#1A1A2E]">Daftar Mata Pelajaranku</h4>

      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Daftar Kelas dan Mata Pelajaran</h3>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.04)]">
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">No</th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Mata Pelajaran</th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Kelas</th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Tujuan Pembelajaran</th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Penilaian</th>
                </tr>
              </thead>
              <tbody>
                {mapelKelas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[#6B7280]">
                      Belum ada kelas atau mata pelajaran yang diampu.
                    </td>
                  </tr>
                ) : (
                  mapelKelas.map((mk: any, i: number) => (
                    <tr key={mk.id_mapel_kelas} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-[#1A1A2E]">{mk.nama_mapel}</td>
                      <td className="px-4 py-3">{mk.nama_kelas}</td>
                      <td className="px-4 py-3">
                        {mk.jumlah_tp > 0 ? (
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-full min-w-[22px] h-[22px] px-1.5">
                            {mk.jumlah_tp} TP
                          </span>
                        ) : (
                          <span className="text-xs text-[#6B7280]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/guru/penilaian/${mk.id_mapel_kelas}`}
                          className="inline-flex items-center gap-1 bg-[#F8F9FB] text-[#1A1A2E] px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.08)] transition-all active:scale-[0.98]"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Nilai
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
