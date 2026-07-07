import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';

async function getData(idUser: number) {
  const sekolah = await getSekolahWithFilter();

  const [rows]: any = await pool.query(`
    SELECT nk.*, pk.judul_proyek, k.nama_kelas, dk.dimensi
    FROM nilai_kokurikuler nk
    JOIN proyek_kelas pk ON nk.id_proyek_kelas = pk.id_proyek_kelas
    JOIN kelas k ON pk.id_kelas = k.id_kelas
    LEFT JOIN dimensi_kokurikuler dk ON nk.id_proyek_tujuan = dk.id_dimensi
    WHERE pk.id_user = ? AND nk.tahun = ? AND nk.semester = ?
    ORDER BY nk.id_nilai_kokurikuler DESC
  `, [idUser, sekolah.tahun, sekolah.semester]);

  return { rows, sekolah };
}

export default async function KokurikulerPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const data = await getData(session.user.id_user!);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Kokurikuler</h4>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
          Daftar Kokurikuler
        </div>
        <div className="p-5">
          {data.rows.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Anda belum memiliki data kokurikuler.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Proyek</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Kelas</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Dimensi</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r: any, i: number) => (
                    <tr key={r.id_nilai_kokurikuler} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{r.judul_proyek}</td>
                      <td className="px-4 py-3">{r.nama_kelas}</td>
                      <td className="px-4 py-3">{r.dimensi || '-'}</td>
                      <td className="px-4 py-3">{r.nilai}</td>
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
