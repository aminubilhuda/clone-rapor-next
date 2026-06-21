import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function getData() {
  const [sekolahRows]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = 1');
  const [semesterRows]: any = await pool.query('SELECT * FROM semester');
  const [tahunRows]: any = await pool.query('SELECT * FROM tahun_pelajaran ORDER BY id_tahun_pelajaran ASC');
  const [pembagianRows]: any = await pool.query('SELECT * FROM pembagian_raport WHERE tahun = ? AND semester = ?', [sekolahRows[0]?.tahun, sekolahRows[0]?.semester]);
  return {
    sekolah: sekolahRows[0],
    semester: semesterRows,
    tahunPel: tahunRows,
    pembagian: pembagianRows[0],
  };
}

export default async function PengaturanPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');

  const { sekolah, semester, tahunPel, pembagian } = await getData();

  // Helper: format date from MySQL (Date object) to YYYY-MM-DD string for input[type=date]
  const toDateInput = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val.split('T')[0];
    if (val instanceof Date) return val.toISOString().split('T')[0];
    return String(val).split('T')[0];
  };

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Pengaturan</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pengaturan Rapor */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="bg-red-600 text-white px-5 py-3 rounded-t-lg font-semibold">
            Pengaturan Rapor
          </div>
          <div className="p-5">
            <form action="/api/tu/pengaturan" method="POST">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembagian Rapor</label>
                <input type="date" name="tanggal_rapor" defaultValue={toDateInput(pembagian?.tanggal_rapor)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembagian Middle</label>
                <input type="date" name="tanggal_mid" defaultValue={toDateInput(pembagian?.tanggal_mid)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi TTD Rapor</label>
                <select name="lokasi" defaultValue={sekolah?.lokasi || 1} className="w-full border rounded px-3 py-2 text-sm">
                  <option value={1}>Kabupaten</option>
                  <option value={2}>Kecamatan</option>
                  <option value={3}>Desa / Kelurahan</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Pelajaran Aktif</label>
                <select name="tahun" defaultValue={sekolah?.tahun || ''} className="w-full border rounded px-3 py-2 text-sm">
                  {tahunPel.map((tp: any) => (
                    <option key={tp.id_tahun_pelajaran} value={tp.id_tahun_pelajaran}>{tp.tahun_pelajaran}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester Aktif</label>
                <select name="semester" defaultValue={sekolah?.semester || ''} className="w-full border rounded px-3 py-2 text-sm">
                  {semester.map((s: any) => (
                    <option key={s.id_semester} value={s.id_semester}>{s.semester}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition">
                Simpan Pengaturan
              </button>
            </form>
          </div>
        </div>

        {/* Tahun Pelajaran */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="bg-green-600 text-white px-5 py-3 rounded-t-lg font-semibold">
            Tahun Pelajaran
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-3 py-2">No</th>
                  <th className="text-left px-3 py-2">Tahun Pelajaran</th>
                </tr>
              </thead>
              <tbody>
                {tahunPel.map((tp: any, i: number) => (
                  <tr key={tp.id_tahun_pelajaran} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{tp.tahun_pelajaran}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
