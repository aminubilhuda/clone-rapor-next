import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getGuruDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const idUser = session.user.id_user;

  try {
    const [sekolahRows]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = 1');
    const sekolah = sekolahRows[0];

    const [userRows]: any = await pool.query('SELECT * FROM users WHERE id_user = ?', [idUser]);
    const user = userRows[0];

    const [kelasWaliRows]: any = await pool.query(
      'SELECT kw.*, k.nama_kelas FROM kelas_wali kw JOIN kelas k ON kw.id_kelas = k.id_kelas WHERE kw.tahun = ? AND kw.semester = ? AND kw.id_user = ?',
      [sekolah.tahun, sekolah.semester, idUser]
    );
    const jumlahWali = kelasWaliRows.length;
    const dataKelas = kelasWaliRows[0] || null;

    const [mapelKelasRows]: any = await pool.query(
      'SELECT * FROM mapel_kelas WHERE tahun = ? AND semester = ? AND id_user = ?',
      [sekolah.tahun, sekolah.semester, idUser]
    );
    const jumlahKelasAmpuh = mapelKelasRows.length;

    let jumlahAnggotaKelas = 0;
    if (dataKelas) {
      const [anggotaRows]: any = await pool.query(
        'SELECT COUNT(*) as count FROM siswa_kelas WHERE tahun = ? AND semester = ? AND id_kelas = ? AND deleted_at IS NULL',
        [sekolah.tahun, sekolah.semester, dataKelas.id_kelas]
      );
      jumlahAnggotaKelas = anggotaRows[0].count;
    }

    const [semesterRows]: any = await pool.query('SELECT * FROM semester WHERE id_semester = ?', [sekolah.semester]);
    const [tahunRows]: any = await pool.query('SELECT * FROM tahun_pelajaran WHERE id_tahun_pelajaran = ?', [sekolah.tahun]);

    return {
      user,
      sekolah,
      stats: {
        jumlahKelasAmpuh,
        jumlahWali,
        jumlahAnggotaKelas,
        namaKelas: dataKelas?.nama_kelas || null,
        semester: semesterRows[0]?.semester,
        tahunPelajaran: tahunRows[0]?.tahun_pelajaran,
      },
    };
  } catch (error) {
    console.error('Guru dashboard error:', error);
    return null;
  }
}

export default async function GuruDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const data = await getGuruDashboard();
  if (!data) {
    return <div className="text-center py-20 text-red-500">Gagal memuat data dashboard.</div>;
  }

  const { user, stats } = data;

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Dashboard Guru</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{stats.jumlahKelasAmpuh}</div>
              <div className="text-sm text-gray-500 mt-1">Kelas Ampuh Ku</div>
            </div>
          </div>
        </div>

        {stats.jumlahWali > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">{stats.jumlahAnggotaKelas}</div>
                <div className="text-sm text-gray-500 mt-1">Anggota Kelas Ku ({stats.namaKelas})</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-emerald-600">
              {user?.nama?.charAt(0)?.toUpperCase() || 'G'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Selamat datang, {user?.nama || 'Guru'}!
            </h3>
            <p className="text-sm text-gray-500">
              Tahun Pelajaran {stats.tahunPelajaran} - Semester {stats.semester}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-4">
          <p className="text-gray-600">
            Gunakan menu di samping untuk mengakses fitur-fitur penilaian, tujuan pembelajaran, dan cetak rapor.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <a href="/guru/kelas-ku" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <span className="text-sm font-medium text-blue-700">Penilaian Angka</span>
            </a>
            <a href="/guru/tujuan-pembelajaran" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <span className="text-sm font-medium text-green-700">Tujuan Pembelajaran</span>
            </a>
            {stats.jumlahWali > 0 && (
              <>
                <a href="/guru/catatan-rapor" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                  <span className="text-sm font-medium text-purple-700">Cetak Rapor</span>
                </a>
                <a href="/guru/lager-nilai-kelas" className="block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition">
                  <span className="text-sm font-medium text-orange-700">Leger Nilai</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
