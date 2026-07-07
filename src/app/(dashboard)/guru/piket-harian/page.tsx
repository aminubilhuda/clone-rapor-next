import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getData(idUser: number) {
  const [rows]: any = await pool.query(`
    SELECT ph.*, h.harian
    FROM piket_harian ph
    JOIN harian h ON ph.id_harian = h.id_harian
    WHERE ph.id_user = ?
    ORDER BY ph.id_harian ASC
  `, [idUser]);
  return rows;
}

export default async function PiketHarianPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const data = await getData(session.user.id_user!);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Jadwal Piket Harian</h4>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
          Jadwal Piket Saya
        </div>
        <div className="p-5">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Anda belum memiliki jadwal piket harian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Hari</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d: any, i: number) => (
                    <tr key={d.id_piket_harian} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{d.harian}</td>
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
