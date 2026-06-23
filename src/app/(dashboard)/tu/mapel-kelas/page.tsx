import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MapelKelasClient from './_components/mapel-kelas-client';

async function getData() {
  const [rows]: any = await pool.query(`
    SELECT mk.*, k.nama_kelas, m.nama_mapel, u.nama AS nama_guru
    FROM mapel_kelas mk
    JOIN kelas k ON mk.id_kelas = k.id_kelas
    JOIN mapel m ON mk.id_mapel = m.id_mapel
    LEFT JOIN users u ON mk.id_user = u.id_user
    ORDER BY mk.id_mapel_kelas DESC
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

async function getUser() {
  const [rows]: any = await pool.query('SELECT id_user, nama, username FROM users ORDER BY nama ASC');
  return rows;
}

export default async function MapelKelasPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const [data, refKelas, refMapel, refUser] = await Promise.all([getData(), getKelas(), getMapel(), getUser()]);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Mapel Kelas</h4>
      <MapelKelasClient data={data} refKelas={refKelas} refMapel={refMapel} refUser={refUser} />
    </div>
  );
}
