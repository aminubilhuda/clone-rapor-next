import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PengaturanClient from './_components/pengaturan-client';

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

  return (
    <div>
      <PengaturanClient sekolah={sekolah} semester={semester} tahunPel={tahunPel} pembagian={pembagian} />
    </div>
  );
}
