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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pengaturan Rapor */}
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
          <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
            <h3 className="font-semibold text-[#1A1A2E]">Pengaturan Rapor</h3>
          </div>
          <div className="p-6">
            <form action="/api/tu/pengaturan" method="POST" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Tanggal Pembagian Rapor</label>
                <input type="date" name="tanggal_rapor" defaultValue={toDateInput(pembagian?.tanggal_rapor)} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Tanggal Pembagian Middle</label>
                <input type="date" name="tanggal_mid" defaultValue={toDateInput(pembagian?.tanggal_mid)} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Lokasi TTD Rapor</label>
                <select name="lokasi" defaultValue={sekolah?.lokasi || 1} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                  <option value={1}>Kabupaten</option>
                  <option value={2}>Kecamatan</option>
                  <option value={3}>Desa / Kelurahan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Tahun Pelajaran Aktif</label>
                <select name="tahun" defaultValue={sekolah?.tahun || ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                  {tahunPel.map((tp: any) => (
                    <option key={tp.id_tahun_pelajaran} value={tp.id_tahun_pelajaran}>{tp.tahun_pelajaran}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Semester Aktif</label>
                <select name="semester" defaultValue={sekolah?.semester || ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                  {semester.map((s: any) => (
                    <option key={s.id_semester} value={s.id_semester}>{s.semester}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="bg-[#DC2626] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] transition-all">
                Simpan Pengaturan
              </button>
            </form>
          </div>
        </div>

        {/* Tahun Pelajaran */}
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
          <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
            <h3 className="font-semibold text-[#1A1A2E]">Tahun Pelajaran</h3>
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.04)]">
                  <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">No</th>
                  <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Tahun Pelajaran</th>
                </tr>
              </thead>
              <tbody>
                {tahunPel.map((tp: any, i: number) => (
                  <tr key={tp.id_tahun_pelajaran} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                    <td className="px-3 py-3 text-sm text-[#1A1A2E]/70">{i + 1}</td>
                    <td className="px-3 py-3 text-sm text-[#1A1A2E]">{tp.tahun_pelajaran}</td>
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
