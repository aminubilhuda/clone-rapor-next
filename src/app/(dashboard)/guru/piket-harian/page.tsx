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
      <h4 className="text-xl font-semibold mb-6 text-[#1A1A2E]">Jadwal Piket Harian</h4>

      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Jadwal Piket Saya</h3>
        </div>
        <div className="p-4">
          {data.length === 0 ? (
            <div className="text-center py-8 text-[#6B7280]">
              Anda belum memiliki jadwal piket harian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.04)]">
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">No</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Hari</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d: any, i: number) => (
                    <tr key={d.id_piket_harian} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-[#1A1A2E]">{d.harian}</td>
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
