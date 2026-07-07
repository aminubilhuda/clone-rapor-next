import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import GuruEkstraDetail from './_components/guru-ekstra-detail';

interface PageProps {
  searchParams: Promise<{ id_eskul?: string }>;
}

async function getList(idUser: number) {
  const sekolah = await getSekolahWithFilter();
  const [rows]: any = await pool.query(`
    SELECT e.*, u.nama AS nama_pembina
    FROM pembina_eskul pe
    JOIN eskul e ON pe.id_eskul = e.id_eskul
    LEFT JOIN users u ON pe.id_user = u.id_user
    WHERE pe.id_user = ? AND pe.tahun = ? AND pe.semester = ?
    ORDER BY e.nama_eskul ASC
  `, [idUser, sekolah.tahun, sekolah.semester]);
  return { rows, sekolah };
}

async function getDetail(idEskul: number) {
  const sekolah = await getSekolahWithFilter();
  const [eskulRows]: any = await pool.query('SELECT * FROM eskul WHERE id_eskul = ?', [idEskul]);
  if (eskulRows.length === 0) return null;
  return { eskul: eskulRows[0], sekolah };
}

async function getSiswa() {
  const [rows]: any = await pool.query('SELECT id_siswa, nisn, nama_siswa FROM siswa WHERE deleted_at IS NULL ORDER BY nama_siswa ASC');
  return rows;
}

async function getSiswaEkstra(tahun: number, semester: number) {
  const [rows]: any = await pool.query(`
    SELECT se.*, s.nama_siswa, s.nisn
    FROM siswa_eskul se
    JOIN siswa s ON se.id_siswa = s.id_siswa
    WHERE se.tahun = ? AND se.semester = ?
    ORDER BY se.id_eskul, s.nama_siswa ASC
  `, [tahun, semester]);
  return rows;
}

export default async function EkstraPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const { id_eskul } = await searchParams;

  if (id_eskul) {
    const sekolah = await getSekolahWithFilter();
    const [data, refSiswa, siswaEkstra] = await Promise.all([
      getDetail(Number(id_eskul)),
      getSiswa(),
      getSiswaEkstra(sekolah.tahun, sekolah.semester),
    ]);
    if (!data) return <div className="text-red-500">Data tidak ditemukan.</div>;

    return (
      <GuruEkstraDetail
        eskul={data.eskul}
        siswa={refSiswa}
        siswaEkstra={siswaEkstra}
        tahun={sekolah.tahun}
        semester={sekolah.semester}
      />
    );
  }

  const data = await getList(session.user.id_user!);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Ekstrakurikuler</h4>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
          Daftar Ekstrakurikuler yang Dibina
        </div>
        <div className="p-5">
          {data.rows.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Anda belum memiliki ekstrakurikuler yang dibina.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ekstrakurikuler</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((e: any, i: number) => (
                    <tr key={e.id_eskul} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{e.nama_eskul}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`/guru/ekstra?id_eskul=${e.id_eskul}`}
                          className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-200 transition"
                        >
                          Lihat Peserta
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
