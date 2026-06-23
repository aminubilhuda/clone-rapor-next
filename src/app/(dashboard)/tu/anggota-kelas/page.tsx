import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AnggotaKelasClient from './_components/anggota-kelas-client';

async function getData() {
  const [rows]: any = await pool.query(`
    SELECT sk.*, k.nama_kelas, s.nama_siswa, s.nis, s.nisn, t.tingkat,
      CASE WHEN sk.status = 1 THEN 'Aktif' ELSE 'Nonaktif' END AS status_label
    FROM siswa_kelas sk
    JOIN kelas k ON sk.id_kelas = k.id_kelas
    JOIN siswa s ON sk.id_siswa = s.id_siswa
    JOIN tingkat t ON sk.id_tingkat = t.id_tingkat
    ORDER BY sk.id_siswa_kelas DESC
  `);
  return rows;
}

async function getKelas() {
  const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
  return rows;
}

async function getSiswa() {
  const [rows]: any = await pool.query('SELECT id_siswa, nama_siswa, nisn FROM siswa ORDER BY nama_siswa ASC');
  return rows;
}

export default async function AnggotaKelasPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const [data, refKelas, refSiswa] = await Promise.all([getData(), getKelas(), getSiswa()]);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Anggota Kelas</h4>
      <AnggotaKelasClient data={data} refKelas={refKelas} refSiswa={refSiswa} />
    </div>
  );
}
