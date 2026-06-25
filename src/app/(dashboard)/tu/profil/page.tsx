import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { redirect } from 'next/navigation';
import ProfilForm from './_components/profil-form';

async function getProfil() {
  try {
    const sekolah = await getSekolahWithFilter();
    const [kepalaRows]: any = await pool.query(
      'SELECT * FROM kepala_sekolah WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );
    const [semesterRows]: any = await pool.query('SELECT * FROM semester WHERE id_semester = ?', [sekolah.semester]);
    const [tahunRows]: any = await pool.query('SELECT * FROM tahun_pelajaran WHERE id_tahun_pelajaran = ?', [sekolah.tahun]);
    return { sekolah, kepala: kepalaRows[0], semester: semesterRows[0], tahun: tahunRows[0] };
  } catch (e) {
    return null;
  }
}

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');

  const data = await getProfil();
  if (!data) return <div className="text-red-500">Gagal memuat data.</div>;

  const { sekolah, kepala, tahun, semester: sem } = data;

  return (
    <div>
      {sekolah.is_historical_view && (
        <div className="mb-4 text-sm text-yellow-600 bg-yellow-50 rounded-xl px-4 py-2 border border-yellow-200">
          Histori: {sem?.semester} {tahun?.tahun_pelajaran}
        </div>
      )}

      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Data Sekolah</h3>
        </div>
        <div className="p-6">
          <ProfilForm sekolah={sekolah} kepala={kepala} />
        </div>
      </div>

      {kepala && (
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] mt-6">
          <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
            <h3 className="font-semibold text-[#1A1A2E]">Kepala Sekolah</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Nama Kepala Sekolah</label>
                <input defaultValue={kepala.nama} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">NIP</label>
                <input defaultValue={kepala.nip} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
