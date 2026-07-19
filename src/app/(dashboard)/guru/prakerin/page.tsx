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
      <h4 className="text-xl font-semibold mb-6 text-[#1A1A2E]">Prakerin</h4>

      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Daftar Prakerin yang Dibimbing</h3>
        </div>
        <div className="p-4">
          {data.prakerin.length === 0 ? (
            <div className="text-center py-8 text-[#6B7280]">
              Anda belum memiliki data prakerin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.04)]">
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">No</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Mitra</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Lokasi</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Tanggal Mulai</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Tanggal Akhir</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Instruktur</th>
                  </tr>
                </thead>
                <tbody>
                  {data.prakerin.map((p: any, i: number) => (
                    <tr key={p.id_prakerin} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-[#1A1A2E]">{p.mitra}</td>
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
