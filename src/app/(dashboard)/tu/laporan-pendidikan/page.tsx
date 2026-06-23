import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';

export default async function LaporanPendidikanPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');

  const sekolah = await getSekolahWithFilter();
  const [countSiswa, countKelas, countUser, countMapel, countLulusan, pembagianRows, laporanWa]: any = await Promise.all([
    pool.query('SELECT COUNT(*) AS total_siswa FROM siswa WHERE aktif = 1'),
    pool.query('SELECT COUNT(*) AS total_kelas FROM kelas'),
    pool.query('SELECT COUNT(*) AS total_user FROM users'),
    pool.query('SELECT COUNT(*) AS total_mapel FROM mapel'),
    pool.query('SELECT COUNT(*) AS total_lulusan FROM lulusan WHERE tahun = ? AND semester = ?', [sekolah.tahun, sekolah.semester]),
    pool.query('SELECT * FROM pembagian_raport WHERE tahun = ? AND semester = ? ORDER BY id_pembagian DESC LIMIT 5', [sekolah.tahun, sekolah.semester]),
    pool.query('SELECT lw.*, u.nama AS nama_user FROM laporan_wa lw LEFT JOIN users u ON lw.kontak = u.username ORDER BY lw.id_laporan DESC LIMIT 5'),
  ]);
  const total_siswa = countSiswa[0]?.[0]?.total_siswa ?? 0;
  const total_kelas = countKelas[0]?.[0]?.total_kelas ?? 0;
  const total_user = countUser[0]?.[0]?.total_user ?? 0;
  const total_mapel = countMapel[0]?.[0]?.total_mapel ?? 0;
  const total_lulusan = countLulusan[0]?.[0]?.total_lulusan ?? 0;

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Laporan Pendidikan</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <DashboardCard label="Total Siswa Aktif" value={total_siswa} color="bg-blue-500" />
        <DashboardCard label="Total Kelas" value={total_kelas} color="bg-green-500" />
        <DashboardCard label="Total Pengguna" value={total_user} color="bg-purple-500" />
        <DashboardCard label="Total Mapel" value={total_mapel} color="bg-orange-500" />
        <DashboardCard label="Total Lulusan" value={total_lulusan} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg">
            <h5 className="font-semibold">Pembagian Raport</h5>
          </div>
          <div className="p-4">
            {pembagianRows?.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Tidak ada data</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Tahun</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Semester</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Tanggal MID</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Tanggal Rapor</th>
                  </tr>
                </thead>
                <tbody>
                  {(pembagianRows as any[]).map((r: any) => (
                    <tr key={r.id_pembagian} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{r.tahun}</td>
                      <td className="px-3 py-2">{r.semester}</td>
                      <td className="px-3 py-2">{new Date(r.tanggal_mid).toLocaleDateString('id-ID')}</td>
                      <td className="px-3 py-2">{new Date(r.tanggal_rapor).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg">
            <h5 className="font-semibold">Laporan WhatsApp Terbaru</h5>
          </div>
          <div className="p-4">
            {laporanWa?.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Tidak ada data</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Kontak</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Pengguna</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(laporanWa as any[]).map((r: any) => (
                    <tr key={r.id_laporan} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{r.kontak}</td>
                      <td className="px-3 py-2">{r.nama_user || '-'}</td>
                      <td className="px-3 py-2">{r.status_pengiriman}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-lg font-bold`}>
        {value}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
