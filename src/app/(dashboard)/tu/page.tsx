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
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardStat icon="school" value={stats.npsn} label="NPSN / Profil Sekolah" color="green" />
        <CardStat icon="users" value={stats.jmlGuru} label="Tenaga Pendidik" color="blue" />
        <CardStat icon="students" value={stats.jmlSiswa} label="Peserta Didik" color="yellow" />
        <CardStat icon="database" value={stats.jmlKelas} label="Kelas / Rombel" color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardStat icon="book" value={stats.jmlMapel} label="Mata Pelajaran" color="green" />
        <CardStat icon="building" value={stats.jmlPrakerin} label="Praktik Kerja Industri" color="blue" />
        <CardStat icon="star" value={stats.jmlEskul} label="Ekstrakurikuler" color="yellow" />
        <CardStat icon="database" value={stats.jmlJurusan} label="Jurusan" color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardStat icon="users" value={stats.jmlMutasiMasuk} label="Mutasi Masuk" color="green" />
        <CardStat icon="users" value={stats.jmlMutasiKeluar} label="Mutasi Keluar" color="blue" />
        <CardStat icon="users" value={stats.jmlLulusan} label="Lulusan" color="yellow" />
      </div>

      {/* Rapor Statistics */}
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.04)] flex items-center justify-between">
          <h5 className="font-semibold text-[#1A1A2E] text-sm">Statistik Rapor</h5>
          <span className="text-xs text-[#6B7280]">
            Tahun {stats.tahunPelajaran} - Semester {stats.semester}
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#F8F9FB] rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-red-500 mb-0.5">{stats.sudahDinilai}</div>
              <div className="text-[11px] text-[#6B7280]">Sudah Dinilai</div>
            </div>
            <div className="bg-[#F8F9FB] rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-emerald-600 mb-0.5">{stats.rataNilai}</div>
              <div className="text-[11px] text-[#6B7280]">Rata-rata Nilai</div>
            </div>
            <div className="bg-[#F8F9FB] rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-amber-600 mb-0.5">{stats.rataMid}</div>
              <div className="text-[11px] text-[#6B7280]">Rata-rata Tengah Semester</div>
            </div>
            <div className="bg-[#F8F9FB] rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-[#1A1A2E] mb-0.5">
                {formatDate(stats.tanggalRapor)}
              </div>
              <div className="text-[11px] text-[#6B7280]">Pembagian Rapor</div>
            </div>
            <div className="bg-[#F8F9FB] rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-[#1A1A2E] mb-0.5">
                {formatDate(stats.tanggalMid)}
              </div>
              <div className="text-[11px] text-[#6B7280]">Pembagian Raport Tengah</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
