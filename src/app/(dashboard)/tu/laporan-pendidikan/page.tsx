import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import LegerClient from './_components/leger-client';

async function getLeger(tahun: number, semester: number) {
  const [rows]: any = await pool.query(`
    SELECT nmp.id_nilai_mata_pelajaran AS id, nmp.id_kelas, nmp.id_mapel, nmp.id_siswa,
      nmp.nilai AS nilai_akhir,
      s.nama_siswa, s.nis, s.nisn,
      m.nama_mapel, m.s_mapel AS singkatan, m.urut, k.nama_kelas
    FROM nilai_mata_pelajaran nmp
    JOIN siswa s ON nmp.id_siswa = s.id_siswa
    JOIN mapel m ON nmp.id_mapel = m.id_mapel
    JOIN kelas k ON nmp.id_kelas = k.id_kelas
    WHERE nmp.tahun = ? AND nmp.semester = ? AND s.deleted_at IS NULL
    ORDER BY k.nama_kelas, s.nama_siswa, m.urut ASC
  `, [tahun, semester]);
  return rows;
}

async function getKelas() {
  const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
  return rows;
}

async function getNilaiKelas(tahun: number, semester: number) {
  const [rows]: any = await pool.query(
    'SELECT * FROM nilai_kelas WHERE tahun = ? AND semester = ?',
    [tahun, semester]
  );
  return rows;
}

export default async function LegerNilaiPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');

  const sekolah = await getSekolahWithFilter();
  const [data, kelas, nilaiKelas] = await Promise.all([
    getLeger(sekolah.tahun, sekolah.semester),
    getKelas(),
    getNilaiKelas(sekolah.tahun, sekolah.semester),
  ]);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Leger Nilai</h4>
      <LegerClient data={data} refKelas={kelas} refNilaiKelas={nilaiKelas} />
    </div>
  );
}
