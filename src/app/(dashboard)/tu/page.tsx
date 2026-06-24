import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import CardStat from './_components/card-stat';

async function getStats() {
  try {
    const sekolah = await getSekolahWithFilter();

    const [userRows]: any = await pool.query('SELECT * FROM users WHERE deleted_at IS NULL');
    const jmlGuru = userRows.length;

    const [siswaKelasRows]: any = await pool.query(
      'SELECT COUNT(DISTINCT id_siswa) as count FROM siswa_kelas WHERE tahun = ? AND semester = ? AND status = 1 AND deleted_at IS NULL',
      [sekolah.tahun, sekolah.semester]
    );
    const jmlSiswa = siswaKelasRows[0].count;

    const [kelasRows]: any = await pool.query('SELECT * FROM kelas');
    const jmlKelas = kelasRows.length;

    const [mapelRows]: any = await pool.query('SELECT * FROM mapel');
    const jmlMapel = mapelRows.length;

    const [prakerinRows]: any = await pool.query('SELECT * FROM prakerin');
    const jmlPrakerin = prakerinRows.length;

    const [eskulRows]: any = await pool.query('SELECT * FROM eskul');
    const jmlEskul = eskulRows.length;

    const [kompetensiRows]: any = await pool.query('SELECT * FROM kompetensi_keahlian');
    const jmlJurusan = kompetensiRows.length;

    const [mutasiMasukRows]: any = await pool.query('SELECT * FROM mutasi_masuk');
    const jmlMutasiMasuk = mutasiMasukRows.length;

    const [mutasiKeluarRows]: any = await pool.query('SELECT * FROM mutasi_keluar');
    const jmlMutasiKeluar = mutasiKeluarRows.length;

    const [lulusanRows]: any = await pool.query('SELECT * FROM lulusan');
    const jmlLulusan = lulusanRows.length;

    // Rapor stats
    const [rataKelasRows]: any = await pool.query(
      'SELECT ROUND(AVG(nilai), 2) AS rata FROM nilai_kelas WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );

    const [rataMidRows]: any = await pool.query(
      'SELECT ROUND(AVG(nilai), 2) AS rata FROM nilai_kelas_mid WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );

    const [sudahDinilaiRows]: any = await pool.query(
      'SELECT COUNT(DISTINCT id_siswa) as count FROM nilai_kelas WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );

    const [pembagianRows]: any = await pool.query(
      'SELECT * FROM pembagian_raport WHERE tahun = ? AND semester = ?',
      [sekolah.tahun, sekolah.semester]
    );
    const pembagian = pembagianRows[0];

    const [semesterRows]: any = await pool.query('SELECT * FROM semester WHERE id_semester = ?', [sekolah.semester]);
    const semester = semesterRows[0];

    const [tahunRows]: any = await pool.query('SELECT * FROM tahun_pelajaran WHERE id_tahun_pelajaran = ?', [sekolah.tahun]);
    const tahun = tahunRows[0];

    return {
      sekolah,
      stats: {
        jmlGuru,
        jmlSiswa,
        jmlKelas,
        jmlMapel,
        jmlPrakerin,
        jmlEskul,
        jmlJurusan,
        jmlMutasiMasuk,
        jmlMutasiKeluar,
        jmlLulusan,
        rataNilai: rataKelasRows[0]?.rata || '-',
        rataMid: rataMidRows[0]?.rata || '-',
        sudahDinilai: sudahDinilaiRows[0]?.count || 0,
        tanggalRapor: pembagian?.tanggal_rapor || '-',
        tanggalMid: pembagian?.tanggal_mid || '-',
        tahunPelajaran: tahun?.tahun_pelajaran || '-',
        semester: semester?.semester || '-',
        npsn: sekolah.npsn,
      },
    };
  } catch (error) {
    console.error('Dashboard error:', error);
    return { sekolah: null, stats: null };
  }
}

export default async function TUDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');

  const { sekolah, stats } = await getStats();

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Gagal memuat data dashboard. Periksa koneksi database.</p>
      </div>
    );
  }

  const formatDate = (val: any): string => {
    if (!val || val === '-') return '-';
    const d = typeof val === 'string' ? new Date(val + 'T00:00:00') : new Date(val);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Dashboard Tata Usaha</h4>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardStat icon="school" value={stats.npsn} label="NPSN / Profil Sekolah" color="green" />
        <CardStat icon="users" value={stats.jmlGuru} label="Tenaga Pendidik" color="blue" />
        <CardStat icon="students" value={stats.jmlSiswa} label="Peserta Didik" color="yellow" />
        <CardStat icon="database" value={stats.jmlKelas} label="Kelas / Rombel" color="blue" />
      </div>

      {/* Stat Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardStat icon="book" value={stats.jmlMapel} label="Mata Pelajaran" color="green" />
        <CardStat icon="building" value={stats.jmlPrakerin} label="Praktik Kerja Industri" color="blue" />
        <CardStat icon="star" value={stats.jmlEskul} label="Ekstrakurikuler" color="yellow" />
        <CardStat icon="database" value={stats.jmlJurusan} label="Jurusan" color="blue" />
      </div>

      {/* Stat Cards Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <CardStat icon="users" value={stats.jmlMutasiMasuk} label="Mutasi Masuk" color="green" />
        <CardStat icon="users" value={stats.jmlMutasiKeluar} label="Mutasi Keluar" color="blue" />
        <CardStat icon="users" value={stats.jmlLulusan} label="Lulusan" color="yellow" />
      </div>

      {/* Rapor Statistics Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg">
          <h5 className="font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistik Rapor
            <small className="ml-auto text-blue-200">
              Tahun {stats.tahunPelajaran} - Semester {stats.semester}
            </small>
          </h5>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="border rounded p-3 text-center bg-gray-50">
              <div className="text-blue-600 text-xl font-bold mb-1">{stats.sudahDinilai}</div>
              <small className="text-gray-500">Sudah Dinilai</small>
            </div>
            <div className="border rounded p-3 text-center bg-gray-50">
              <div className="text-green-600 text-xl font-bold mb-1">{stats.rataNilai}</div>
              <small className="text-gray-500">Rata-rata Nilai</small>
            </div>
            <div className="border rounded p-3 text-center bg-gray-50">
              <div className="text-yellow-600 text-xl font-bold mb-1">{stats.rataMid}</div>
              <small className="text-gray-500">Rata-rata Tengah Semester</small>
            </div>
            <div className="border rounded p-3 text-center bg-gray-50">
              <div className="text-red-600 text-xl font-bold mb-1">
                {formatDate(stats.tanggalRapor)}
              </div>
              <small className="text-gray-500">Pembagian Rapor</small>
            </div>
            <div className="border rounded p-3 text-center bg-gray-50">
              <div className="text-gray-600 text-xl font-bold mb-1">
                {formatDate(stats.tanggalMid)}
              </div>
              <small className="text-gray-500">Pembagian Raport Tengah</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
