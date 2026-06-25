import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import AnggotaKelasClient from './_components/anggota-kelas-client';

async function getData() {
  const sekolah = await getSekolahWithFilter();
  const [rows]: any = await pool.query(`
    SELECT k.id_kelas, k.nama_kelas, COUNT(sk.id_siswa_kelas) AS jumlah_anggota
    FROM kelas k
    LEFT JOIN siswa_kelas sk ON k.id_kelas = sk.id_kelas
      AND sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL
    GROUP BY k.id_kelas, k.nama_kelas
    ORDER BY k.nama_kelas ASC
  `, [sekolah.tahun, sekolah.semester]);
  return rows;
}

async function getSiswa() {
  const [rows]: any = await pool.query('SELECT id_siswa, nama_siswa, nisn FROM siswa WHERE deleted_at IS NULL ORDER BY nama_siswa ASC');
  return rows;
}

async function getAnggotaKelas() {
  const sekolah = await getSekolahWithFilter();
  const [rows]: any = await pool.query(`
    SELECT sk.id_siswa_kelas, sk.id_kelas, sk.id_siswa, s.nama_siswa, s.nisn
    FROM siswa_kelas sk
    JOIN siswa s ON sk.id_siswa = s.id_siswa
    WHERE sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL AND s.deleted_at IS NULL
  `, [sekolah.tahun, sekolah.semester]);
  return rows;
}

export default async function AnggotaKelasPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const [data, refSiswa, anggotaKelas] = await Promise.all([getData(), getSiswa(), getAnggotaKelas()]);

  return (
    <div>
      <AnggotaKelasClient data={data} refSiswa={refSiswa} anggotaKelas={anggotaKelas} />
    </div>
  );
}
