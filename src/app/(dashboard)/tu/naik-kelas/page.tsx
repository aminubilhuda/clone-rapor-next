import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import NaikKelasClient from './_components/naik-kelas-client';

async function getData() {
  try {
    const sekolah = await getSekolahWithFilter();
    const [rows]: any = await pool.query(`
      SELECT sk.*, s.nama_siswa, s.nisn, k.nama_kelas, t.tingkat,
        CASE WHEN sk.status = 1 THEN 'Aktif' ELSE 'Tidak Aktif' END AS status_label
      FROM siswa_kelas sk
      JOIN siswa s ON sk.id_siswa = s.id_siswa
      JOIN kelas k ON sk.id_kelas = k.id_kelas
      JOIN tingkat t ON sk.id_tingkat = t.id_tingkat
      WHERE sk.tahun = ? AND sk.semester = ? AND s.deleted_at IS NULL
        AND sk.deleted_at IS NULL AND s.aktif = 1
      ORDER BY k.nama_kelas, s.nama_siswa
    `, [sekolah.tahun, sekolah.semester]);
    return rows;
  } catch (error) {
    console.error('Naik kelas data fetch error:', error);
    return [];
  }
}

async function getKelas() {
  try {
    const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas, id_tingkat FROM kelas ORDER BY nama_kelas');
    return rows;
  } catch (error) {
    console.error('Kelas fetch error:', error);
    return [];
  }
}

async function getTingkat() {
  try {
    const [rows]: any = await pool.query('SELECT id_tingkat, tingkat, akhir FROM tingkat ORDER BY id_tingkat');
    return rows;
  } catch (error) {
    console.error('Tingkat fetch error:', error);
    return [];
  }
}

export default async function NaikKelasPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');
  const [data, refKelas, refTingkat] = await Promise.all([getData(), getKelas(), getTingkat()]);

  return (
    <div>
      <NaikKelasClient data={data} refKelas={refKelas} refTingkat={refTingkat} />
    </div>
  );
}
