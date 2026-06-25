import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import EkstraClient from './_components/ekstra-client';

async function getEkstra(tahun: number, semester: number) {
  const [rows]: any = await pool.query(`
    SELECT e.*, u.nama AS nama_pembina, pe.id_user AS pembina_user_id
    FROM eskul e
    LEFT JOIN pembina_eskul pe ON e.id_eskul = pe.id_eskul AND pe.tahun = ? AND pe.semester = ?
    LEFT JOIN users u ON pe.id_user = u.id_user
    ORDER BY e.id_eskul ASC
  `, [tahun, semester]);
  return rows;
}

async function getUsers() {
  const [rows]: any = await pool.query('SELECT id_user, nama, username FROM users WHERE deleted_at IS NULL ORDER BY nama ASC');
  return rows;
}

async function getSiswa() {
  const [rows]: any = await pool.query('SELECT id_siswa, nisn, nama_siswa FROM siswa WHERE deleted_at IS NULL ORDER BY nama_siswa ASC');
  return rows;
}

async function getSiswaEkstra(tahun: number, semester: number) {
  const [rows]: any = await pool.query(`
    SELECT se.*, s.nama_siswa, s.nisn
    FROM siswa_eskul se
    JOIN siswa s ON se.id_siswa = s.id_siswa
    WHERE se.tahun = ? AND se.semester = ?
    ORDER BY se.id_eskul, s.nama_siswa ASC
  `, [tahun, semester]);
  return rows;
}

export default async function EkstraPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const sekolah = await getSekolahWithFilter();
  const [ekstra, users, refSiswa, siswaEkstra] = await Promise.all([
    getEkstra(sekolah.tahun, sekolah.semester),
    getUsers(),
    getSiswa(),
    getSiswaEkstra(sekolah.tahun, sekolah.semester),
  ]);

  return (
    <div>
      <EkstraClient ekstra={ekstra} users={users} refSiswa={refSiswa} siswaEkstra={siswaEkstra} tahun={sekolah.tahun} semester={sekolah.semester} />
    </div>
  );
}
