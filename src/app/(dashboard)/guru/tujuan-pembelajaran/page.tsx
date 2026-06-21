import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DataTable from '@/components/ui/data-table';

interface PageProps {
  searchParams: Promise<{ id_mapel_kelas?: string }>;
}

async function getData(id_mapel_kelas: string | undefined, idUser: number) {
  const [sekolahRows]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];

  if (id_mapel_kelas) {
    const [mkRows]: any = await pool.query(`
      SELECT mk.*, m.nama_mapel, k.nama_kelas
      FROM mapel_kelas mk
      JOIN mapel m ON mk.id_mapel = m.id_mapel
      JOIN kelas k ON mk.id_kelas = k.id_kelas
      WHERE mk.id_mapel_kelas = ?
    `, [id_mapel_kelas]);

    if (mkRows.length === 0) return null;
    const mk = mkRows[0];

    const [tpRows]: any = await pool.query(
      'SELECT * FROM tujuan_pembelajaran WHERE tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? ORDER BY urut ASC',
      [sekolah.tahun, sekolah.semester, mk.id_kelas, mk.id_mapel]
    );

    return { sekolah, mapelKelas: mk, tp: tpRows, mode: 'detail' as const };
  }

  // Show list of mapel kelas for this user
  const [mapelKelas]: any = await pool.query(`
    SELECT mk.*, m.nama_mapel, k.nama_kelas
    FROM mapel_kelas mk
    JOIN mapel m ON mk.id_mapel = m.id_mapel
    JOIN kelas k ON mk.id_kelas = k.id_kelas
    WHERE mk.tahun = ? AND mk.semester = ? AND mk.id_user = ?
  `, [sekolah.tahun, sekolah.semester, idUser]);

  return { sekolah, mapelKelas, mode: 'list' as const };
}

export default async function TujuanPembelajaranPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const { id_mapel_kelas } = await searchParams;
  const data = await getData(id_mapel_kelas, session.user.id_user!);

  if (!data) return <div className="text-red-500">Data tidak ditemukan.</div>;

  if (data.mode === 'detail') {
    return (
      <div>
        <div className="mb-4">
          <a href="/guru/tujuan-pembelajaran" className="text-blue-600 hover:underline text-sm">
            &larr; Kembali ke daftar
          </a>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
            Tujuan Pembelajaran {data.mapelKelas.nama_mapel} - {data.mapelKelas.nama_kelas}
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3">No</th>
                    <th className="text-left px-4 py-3">Tujuan Pembelajaran</th>
                    <th className="text-left px-4 py-3">KKTP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tp.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-400">
                        Belum ada tujuan pembelajaran. Silahkan tambah melalui aplikasi PHP.
                      </td>
                    </tr>
                  ) : (
                    data.tp.map((t: any, i: number) => (
                      <tr key={t.id_tujuan} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3">{t.tujuan}</td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                            {t.kktp}
                          </span>
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

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Tujuan Pembelajaran</h4>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
          Pilih Mata Pelajaran
        </div>
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3">No</th>
                <th className="text-left px-4 py-3">Mata Pelajaran</th>
                <th className="text-left px-4 py-3">Kelas</th>
                <th className="text-left px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.mapelKelas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                data.mapelKelas.map((mk: any, i: number) => (
                  <tr key={mk.id_mapel_kelas} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">{mk.nama_mapel}</td>
                    <td className="px-4 py-3">{mk.nama_kelas}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`/guru/tujuan-pembelajaran?id_mapel_kelas=${mk.id_mapel_kelas}`}
                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-200 transition"
                      >
                        Lihat TP
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
  );
}
