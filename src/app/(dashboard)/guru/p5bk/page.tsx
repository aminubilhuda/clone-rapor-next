import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';

async function getData(idUser: number) {
  const sekolah = await getSekolahWithFilter();

  const [proyek]: any = await pool.query(`
    SELECT pk.*, k.nama_kelas, pt.tema
    FROM proyek_kelas pk
    JOIN kelas k ON pk.id_kelas = k.id_kelas
    JOIN proyek_tema pt ON pk.id_tema = pt.id_tema
    WHERE pk.id_user = ? AND pk.tahun = ? AND pk.semester = ?
    ORDER BY pk.id_proyek_kelas DESC
  `, [idUser, sekolah.tahun, sekolah.semester]);

  return { proyek, sekolah };
}

export default async function P5BKPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const data = await getData(session.user.id_user!);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">P5BK</h4>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
          Daftar Proyek P5BK
        </div>
        <div className="p-5">
          {data.proyek.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Anda belum memiliki proyek P5BK.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Kelas</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tema</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Judul Proyek</th>
                  </tr>
                </thead>
                <tbody>
                  {data.proyek.map((p: any, i: number) => (
                    <tr key={p.id_proyek_kelas} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{p.nama_kelas}</td>
                      <td className="px-4 py-3">{p.tema}</td>
                      <td className="px-4 py-3">{p.judul_proyek}</td>
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
