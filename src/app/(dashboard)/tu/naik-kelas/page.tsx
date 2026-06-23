import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import NaikKelasClient from './_components/naik-kelas-client';

async function getData() {
  const sekolah = await getSekolahWithFilter();
  const [rows]: any = await pool.query(`
    SELECT sk.*, s.nama_siswa, s.nisn, k.nama_kelas, t.tingkat,
      CASE WHEN sk.status = 1 THEN 'Aktif' ELSE 'Tidak Aktif' END AS status_label
    FROM siswa_kelas sk
    JOIN siswa s ON sk.id_siswa = s.id_siswa
    JOIN kelas k ON sk.id_kelas = k.id_kelas
    JOIN tingkat t ON sk.id_tingkat = t.id_tingkat
    WHERE sk.tahun = ? AND sk.semester = ?
    ORDER BY k.nama_kelas, s.nama_siswa
  `, [sekolah.tahun, sekolah.semester]);
  return rows;
}

async function getKelas() {
  const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas');
  return rows;
}

async function getTingkat() {
  const [rows]: any = await pool.query('SELECT id_tingkat, tingkat FROM tingkat ORDER BY id_tingkat');
  return rows;
}

export default async function NaikKelasPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const [data, refKelas, refTingkat] = await Promise.all([getData(), getKelas(), getTingkat()]);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Naik Kelas</h4>
      <NaikKelasClient data={data} refKelas={refKelas} refTingkat={refTingkat} />
    </div>
  );
}
