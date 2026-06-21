import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MapelClient from './_components/mapel-client';

async function getMapel() {
  const [mapel]: any = await pool.query(`
    SELECT m.*, km.huruf, km.kelompok as nama_kelompok

    FROM mapel m
    JOIN kelompok_mapel km ON m.id_kelompok = km.id_kelompok
    ORDER BY m.urut ASC
  `);
  return mapel;
}

async function getKelompok() {
  const [kelompok]: any = await pool.query('SELECT * FROM kelompok_mapel');
  return kelompok;
}

export default async function MapelPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const [mapel, kelompok] = await Promise.all([getMapel(), getKelompok()]);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Mata Pelajaran</h4>
      <MapelClient mapel={mapel} refKelompok={kelompok} />
    </div>
  );
}
