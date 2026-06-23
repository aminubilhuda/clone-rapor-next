import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PiketHarianClient from './_components/piket-harian-client';

async function getData() {
  const [rows]: any = await pool.query(`
    SELECT ph.*, h.harian, u.nama AS nama_user
    FROM piket_harian ph
    JOIN harian h ON ph.id_harian = h.id_harian
    LEFT JOIN users u ON ph.id_user = u.id_user
    ORDER BY ph.id_piket_harian DESC
  `);
  return rows;
}

async function getHarian() {
  const [rows]: any = await pool.query('SELECT id_harian, harian FROM harian ORDER BY id_harian ASC');
  return rows;
}

async function getUser() {
  const [rows]: any = await pool.query('SELECT id_user, nama, username FROM users ORDER BY nama ASC');
  return rows;
}

export default async function PiketHarianPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const [data, refHarian, refUser] = await Promise.all([getData(), getHarian(), getUser()]);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Piket Harian</h4>
      <PiketHarianClient data={data} refHarian={refHarian} refUser={refUser} />
    </div>
  );
}
