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
      <h4 className="text-xl font-semibold mb-6">
        Profile Sekolah
        {sekolah.is_historical_view && (
          <span className="ml-2 text-sm text-yellow-600 font-normal">
            (Histori: {sem?.semester} {tahun?.tahun_pelajaran})
          </span>
        )}
      </h4>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
          Data Sekolah
        </div>
        <div className="p-5">
          <ProfilForm sekolah={sekolah} kepala={kepala} />
        </div>
      </div>

      {kepala && (
        <div className="bg-white rounded-lg shadow border border-gray-200 mt-6">
          <div className="bg-green-600 text-white px-5 py-3 rounded-t-lg font-semibold">
            Kepala Sekolah
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kepala Sekolah</label>
                <input defaultValue={kepala.nama} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                <input defaultValue={kepala.nip} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
