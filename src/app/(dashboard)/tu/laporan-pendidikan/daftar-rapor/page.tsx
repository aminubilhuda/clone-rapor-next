import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import DaftarRaporClient from './_components/daftar-rapor-client';

async function getKelas() {
  const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
  return rows;
}

async function getSiswaKelas(tahun: number, semester: number) {
  const [rows]: any = await pool.query(`
    SELECT sk.id_siswa_kelas, sk.id_kelas, s.id_siswa, s.nama_siswa, s.nis, s.nisn
    FROM siswa_kelas sk
    JOIN siswa s ON sk.id_siswa = s.id_siswa
    WHERE sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL AND s.deleted_at IS NULL
    ORDER BY sk.id_kelas, s.nama_siswa ASC
  `, [tahun, semester]);
  return rows;
}

export default async function DaftarRaporPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');

  const sekolah = await getSekolahWithFilter();
  const [kelas, siswaKelas] = await Promise.all([
    getKelas(),
    getSiswaKelas(sekolah.tahun, sekolah.semester),
  ]);

  return (
    <div>
      <DaftarRaporClient refKelas={kelas} siswaKelas={siswaKelas} />
    </div>
  );
}
