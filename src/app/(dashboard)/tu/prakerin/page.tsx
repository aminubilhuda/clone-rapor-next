import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PrakerinClient from './_components/prakerin-client';

async function getPrakerin() {
  const [rows]: any = await pool.query(`
    SELECT p.*, u.nama AS nama_user
    FROM prakerin p
    LEFT JOIN users u ON p.id_user = u.id_user
    ORDER BY p.id_prakerin ASC
  `);
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
