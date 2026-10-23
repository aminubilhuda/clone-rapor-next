import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import MapelKelasClient from './_components/mapel-kelas-client';

async function getData() {
  try {
    const sekolah = await getSekolahWithFilter();
    const [rows]: any = await pool.query(`
      SELECT mk.*, k.nama_kelas, m.nama_mapel, m.parent_id,
        p.nama_mapel AS nama_induk, u.nama AS nama_guru
      FROM mapel_kelas mk
      JOIN kelas k ON mk.id_kelas = k.id_kelas
      JOIN mapel m ON mk.id_mapel = m.id_mapel
      LEFT JOIN mapel p ON m.parent_id = p.id_mapel
      LEFT JOIN users u ON mk.id_user = u.id_user
      WHERE mk.tahun = ? AND mk.semester = ?
      ORDER BY k.nama_kelas ASC,
        COALESCE(p.urut, m.urut) ASC,
        (m.parent_id IS NULL) DESC,
        m.urut ASC,
        COALESCE(p.nama_mapel, m.nama_mapel) ASC,
        m.id_mapel ASC
    `, [sekolah.tahun, sekolah.semester]);
    return rows;
  } catch (error) {
    console.error('Mapel kelas data fetch error:', error);
    return [];
  }
}

async function getKelas() {
  try {
    const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
    return rows;
  } catch (error) {
    console.error('Kelas fetch error:', error);
    return [];
  }
}

async function getMapel(tahun: number, semester: number) {
  try {
    const [rows]: any = await pool.query(`
      SELECT m.id_mapel, m.nama_mapel, m.parent_id, p.nama_mapel AS nama_induk
      FROM mapel m
      LEFT JOIN mapel p ON m.parent_id = p.id_mapel
      WHERE NOT EXISTS (
          SELECT 1
          FROM mapel c
          JOIN mapel_kelas ck ON ck.id_mapel = c.id_mapel
          WHERE c.parent_id = m.id_mapel
            AND ck.tahun = ? AND ck.semester = ? AND ck.deleted_at IS NULL
        )
      ORDER BY COALESCE(p.urut, m.urut) ASC,
        (m.parent_id IS NULL) DESC,
        m.urut ASC,
        COALESCE(p.nama_mapel, m.nama_mapel) ASC,
        m.id_mapel ASC
    `, [tahun, semester]);
    return rows;
  } catch (error) {
    console.error('Mapel fetch error:', error);
    return [];
  }
}

async function getUser() {
  try {
    const [rows]: any = await pool.query('SELECT id_user, nama, username FROM users WHERE deleted_at IS NULL ORDER BY nama ASC');
    return rows;
  } catch (error) {
    console.error('User fetch error:', error);
    return [];
  }
}

export default async function MapelKelasPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');
  const sekolah = await getSekolahWithFilter();
  const [data, refKelas, refMapel, refUser] = await Promise.all([
    getData(),
    getKelas(),
    getMapel(sekolah.tahun, sekolah.semester),
    getUser(),
  ]);

  return (
    <div>
      <MapelKelasClient data={data} refKelas={refKelas} refMapel={refMapel} refUser={refUser} />
    </div>
  );
}
