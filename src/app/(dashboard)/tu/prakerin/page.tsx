import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import PrakerinClient from './_components/prakerin-client';

async function getPrakerin() {
  const sekolah = await getSekolahWithFilter();
  const [rows]: any = await pool.query(`
    SELECT p.*, u.nama AS nama_user
    FROM prakerin p
    LEFT JOIN users u ON p.id_user = u.id_user
    WHERE p.tahun = ? AND p.semester = ?
    ORDER BY p.id_prakerin ASC
  `, [sekolah.tahun, sekolah.semester]);
  return rows;
}

async function getUsers() {
  const [rows]: any = await pool.query('SELECT id_user, nama, username FROM users ORDER BY nama ASC');
  return rows;
}

export default async function PrakerinPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const prakerin = await getPrakerin();
  const users = await getUsers();

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Prakerin</h4>
      <PrakerinClient prakerin={prakerin} users={users} />
    </div>
  );
}
