import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import RombelClient from './_components/rombel-client';

async function getRombel(tahun: number, semester: number) {
  try {
    const [rows]: any = await pool.query(`
      SELECT k.id_kelas, k.nama_kelas, t.tingkat, kw.id_user AS wali_user_id, u.nama AS wali_nama
      FROM kelas k
      JOIN tingkat t ON k.id_tingkat = t.id_tingkat
      LEFT JOIN kelas_wali kw ON k.id_kelas = kw.id_kelas AND kw.tahun = ? AND kw.semester = ?
      LEFT JOIN users u ON kw.id_user = u.id_user
      ORDER BY k.id_kelas ASC
    `, [tahun, semester]);
    return rows;
  } catch (error) {
    console.error('Rombel fetch error:', error);
    return [];
  }
}

async function getUser() {
  try {
    const [rows]: any = await pool.query('SELECT id_user, nama FROM users WHERE deleted_at IS NULL ORDER BY nama ASC');
    return rows;
  } catch (error) {
    console.error('User fetch error:', error);
    return [];
  }
}

export default async function RombelPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');

  const sekolah = await getSekolahWithFilter();
  const [data, refUser] = await Promise.all([
    getRombel(sekolah.tahun, sekolah.semester),
    getUser(),
  ]);

  return (
    <div>
      <RombelClient data={data} refUser={refUser} tahun={sekolah.tahun} semester={sekolah.semester} />
    </div>
  );
}
