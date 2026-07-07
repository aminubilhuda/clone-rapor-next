import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';

async function getData(idUser: number) {
  const sekolah = await getSekolahWithFilter();

  const [prakerin]: any = await pool.query(`
    SELECT p.*, u.nama AS nama_user
    FROM prakerin p
    LEFT JOIN users u ON p.id_user = u.id_user
    WHERE p.id_user = ? AND p.tahun = ? AND p.semester = ?
    ORDER BY p.id_prakerin DESC
  `, [idUser, sekolah.tahun, sekolah.semester]);

  return { prakerin, sekolah };
}

export default async function PrakerinPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const data = await getData(session.user.id_user!);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Prakerin</h4>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
          Daftar Prakerin yang Dibimbing
        </div>
        <div className="p-5">
          {data.prakerin.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Anda belum memiliki data prakerin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Mitra</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Lokasi</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tanggal Mulai</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tanggal Akhir</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Instruktur</th>
                  </tr>
                </thead>
                <tbody>
                  {data.prakerin.map((p: any, i: number) => (
                    <tr key={p.id_prakerin} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{p.mitra}</td>
                      <td className="px-4 py-3">{p.lokasi}</td>
                      <td className="px-4 py-3">{new Date(p.tanggal_mulai).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3">{new Date(p.tanggal_akhir).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3">{p.instruktur}</td>
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
