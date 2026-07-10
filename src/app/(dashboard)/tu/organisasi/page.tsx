import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import OrganisasiClient from './_components/organisasi-client';

async function getOrganisasi(tahun: number, semester: number) {
  try {
    const [rows]: any = await pool.query(`
      SELECT o.*, u.nama AS nama_pembina, po.id_user AS pembina_user_id
      FROM organisasi o
      LEFT JOIN pembina_organisasi po ON o.id_organisasi = po.id_organisasi AND po.tahun = ? AND po.semester = ?
      LEFT JOIN users u ON po.id_user = u.id_user
      WHERE o.deleted_at IS NULL
      ORDER BY o.id_organisasi ASC
    `, [tahun, semester]);
    return rows;
  } catch (error) {
    console.error('Organisasi fetch error:', error);
    return [];
  }
}

async function getUsers() {
  try {
    const [rows]: any = await pool.query('SELECT id_user, nama, username FROM users WHERE deleted_at IS NULL ORDER BY nama ASC');
    return rows;
  } catch (error) {
    console.error('Users fetch error:', error);
    return [];
  }
}

async function getSiswa() {
  try {
    const [rows]: any = await pool.query('SELECT id_siswa, nisn, nama_siswa FROM siswa WHERE deleted_at IS NULL ORDER BY nama_siswa ASC');
    return rows;
  } catch (error) {
    console.error('Siswa fetch error:', error);
    return [];
  }
}

async function getSiswaOrganisasi(tahun: number, semester: number) {
  try {
    const [rows]: any = await pool.query(`
      SELECT so.*, s.nama_siswa, s.nisn
      FROM siswa_organisasi so
      JOIN siswa s ON so.id_siswa = s.id_siswa
      WHERE so.tahun = ? AND so.semester = ?
      ORDER BY so.id_organisasi, s.nama_siswa ASC
    `, [tahun, semester]);
    return rows;
  } catch (error) {
    console.error('Siswa organisasi fetch error:', error);
    return [];
  }
}

export default async function OrganisasiPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');
  const sekolah = await getSekolahWithFilter();
  const [organisasi, users, refSiswa, siswaOrganisasi] = await Promise.all([
    getOrganisasi(sekolah.tahun, sekolah.semester),
    getUsers(),
    getSiswa(),
    getSiswaOrganisasi(sekolah.tahun, sekolah.semester),
  ]);

  return (
    <div>
      <OrganisasiClient organisasi={organisasi} users={users} refSiswa={refSiswa} siswaOrganisasi={siswaOrganisasi} tahun={sekolah.tahun} semester={sekolah.semester} />
    </div>
  );
}
