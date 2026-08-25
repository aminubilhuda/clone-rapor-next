import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import KokurikulerClient from './_components/kokurikuler-client';

async function getData() {
  try {
    const sekolah = await getSekolahWithFilter();
    const [rows]: any = await pool.query(`
      SELECT 
        pk.id_proyek_kelas,
        pk.kode,
        pk.tahun,
        pk.semester,
        pk.id_kelas,
        pk.id_tema,
        pk.id_user,
        pk.judul_proyek,
        pk.deskripsi_singkat,
        k.nama_kelas,
        COALESCE(u.nama, '-') AS nama_pembina,
        COALESCE(dim_cnt.total_dimensi, 0) AS total_dimensi,
        COALESCE(siswa_cnt.total_siswa, 0) AS total_siswa
      FROM proyek_kelas pk
      JOIN kelas k ON pk.id_kelas = k.id_kelas
      LEFT JOIN users u ON pk.id_user = u.id_user
      LEFT JOIN (
        SELECT id_proyek_kelas, COUNT(*) AS total_dimensi
        FROM proyek_tujuan
        WHERE deleted_at IS NULL
        GROUP BY id_proyek_kelas
      ) dim_cnt ON pk.id_proyek_kelas = dim_cnt.id_proyek_kelas
      LEFT JOIN (
        SELECT sk.id_kelas, COUNT(DISTINCT sk.id_siswa) AS total_siswa
        FROM siswa_kelas sk
        JOIN siswa s ON sk.id_siswa = s.id_siswa
        WHERE sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL AND s.deleted_at IS NULL
        GROUP BY sk.id_kelas
      ) siswa_cnt ON pk.id_kelas = siswa_cnt.id_kelas
      WHERE pk.tahun = ? AND pk.semester = ? AND pk.deleted_at IS NULL
      ORDER BY pk.id_proyek_kelas DESC
    `, [sekolah.tahun, sekolah.semester, sekolah.tahun, sekolah.semester]);
    return rows;
  } catch (error) {
    console.error('Kokurikuler data fetch error:', error);
    return [];
  }
}

async function getKelas() {
  try {
    const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
    return rows;
  } catch {
    return [];
  }
}

async function getUsers() {
  try {
    const [rows]: any = await pool.query(
      'SELECT id_user, nama, username FROM users WHERE deleted_at IS NULL ORDER BY nama ASC'
    );
    return rows;
  } catch {
    return [];
  }
}

export default async function KokurikulerPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');

  const [data, refKelas, refUser] = await Promise.all([
    getData(),
    getKelas(),
    getUsers(),
  ]);

  return (
    <div>
      <KokurikulerClient
        data={data}
        refKelas={refKelas}
        refUser={refUser}
      />
    </div>
  );
}
