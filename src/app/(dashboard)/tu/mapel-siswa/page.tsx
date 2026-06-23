import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MapelSiswaClient from './_components/mapel-siswa-client';

async function getData() {
  const [rows]: any = await pool.query(`
    SELECT ms.*, k.nama_kelas, m.nama_mapel, s.nama_siswa,
      CASE WHEN ms.aktif = 1 THEN 'Aktif' ELSE 'Nonaktif' END AS aktif_label
    FROM mapel_siswa ms
    JOIN kelas k ON ms.id_kelas = k.id_kelas
    JOIN mapel m ON ms.id_mapel = m.id_mapel
    JOIN siswa s ON ms.id_siswa = s.id_siswa
    ORDER BY ms.id_mapel_siswa DESC
  `);
  return rows;
}

async function getKelas() {
  const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
  return rows;
}

async function getMapel() {
  const [rows]: any = await pool.query('SELECT id_mapel, nama_mapel FROM mapel ORDER BY id_mapel ASC');
  return rows;
}

async function getSiswa() {
  const [rows]: any = await pool.query('SELECT id_siswa, nama_siswa, nisn FROM siswa ORDER BY nama_siswa ASC');
  return rows;
}

export default async function MapelSiswaPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const [data, refKelas, refMapel, refSiswa] = await Promise.all([getData(), getKelas(), getMapel(), getSiswa()]);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Mapel Pilihan Siswa</h4>
      <MapelSiswaClient data={data} refKelas={refKelas} refMapel={refMapel} refSiswa={refSiswa} />
    </div>
  );
}
