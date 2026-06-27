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
    ORDER BY h.id_harian ASC, ph.id_piket_harian ASC
  `);
  return rows;
}

async function getUser() {
  const [rows]: any = await pool.query('SELECT id_user, nama, username FROM users WHERE deleted_at IS NULL ORDER BY nama ASC');
  return rows;
}

export default async function PiketHarianPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const [data, refUser] = await Promise.all([getData(), getUser()]);

  return (
    <div>
      <PiketHarianClient data={data} refUser={refUser} />
    </div>
  );
}
