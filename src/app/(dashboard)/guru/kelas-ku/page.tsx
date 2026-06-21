import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getKelasKu() {
  const session = await auth();
  if (!session?.user?.id_user) return null;

  const [sekolahRows]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];

  const [mapelKelas]: any = await pool.query(`
    SELECT mk.*, m.nama_mapel, m.s_mapel, m.urut, k.nama_kelas
    FROM mapel_kelas mk
    JOIN mapel m ON mk.id_mapel = m.id_mapel
    JOIN kelas k ON mk.id_kelas = k.id_kelas
    WHERE mk.tahun = ? AND mk.semester = ? AND mk.id_user = ?
    ORDER BY m.urut ASC
  `, [sekolah.tahun, sekolah.semester, session.user.id_user]);

  return { mapelKelas, sekolah };
}

export default async function KelasKuPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const data = await getKelasKu();
  if (!data) return <div className="text-red-500">Gagal memuat data.</div>;

  const { mapelKelas, sekolah } = data;

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Daftar Mata Pelajaranku</h4>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
          Daftar Kelas dan Mata Pelajaran
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Mata Pelajaran</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kelas</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tujuan Pembelajaran</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Penilaian</th>
                </tr>
              </thead>
              <tbody>
                {mapelKelas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      Belum ada kelas atau mata pelajaran yang diampu.
                    </td>
                  </tr>
                ) : (
                  mapelKelas.map((mk: any, i: number) => (
                    <tr key={mk.id_mapel_kelas} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{mk.nama_mapel}</td>
                      <td className="px-4 py-3">{mk.nama_kelas}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`/guru/tujuan-pembelajaran?id_mapel_kelas=${mk.id_mapel_kelas}`}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-200 transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Lihat TP
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/guru/penilaian/${mk.id_mapel_kelas}`}
                          className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-green-200 transition"
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
