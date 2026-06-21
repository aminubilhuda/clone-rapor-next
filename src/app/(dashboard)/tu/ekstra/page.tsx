import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EkstraClient from './_components/ekstra-client';

async function getEkstra() {
  const [eskul]: any = await pool.query('SELECT * FROM eskul ORDER BY id_eskul ASC');
  return eskul;
}

export default async function EkstraPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const ekstra = await getEkstra();

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Ekstrakurikuler</h4>
      <EkstraClient ekstra={ekstra} />
    </div>
  );
}
