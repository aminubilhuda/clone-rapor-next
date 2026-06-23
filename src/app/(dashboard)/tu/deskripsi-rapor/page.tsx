import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DeskripsiClient from './_components/deskripsi-client';

async function getDeskripsi() {
  const [rows]: any = await pool.query('SELECT * FROM deskripsi_rapor ORDER BY id_deskripsi ASC');
  return rows;
}

export default async function DeskripsiRaporPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const deskripsi = await getDeskripsi();

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Deskripsi Rapor</h4>
      <DeskripsiClient deskripsi={deskripsi} />
    </div>
  );
}
