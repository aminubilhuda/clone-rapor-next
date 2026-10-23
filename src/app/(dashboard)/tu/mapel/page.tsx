import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MapelClient from './_components/mapel-client';

async function getMapel() {
  try {
    const [mapel]: any = await pool.query(`
      SELECT m.*, km.huruf, km.kelompok AS nama_kelompok,
        p.nama_mapel AS nama_induk,
        (SELECT COUNT(*) FROM mapel c WHERE c.parent_id = m.id_mapel) AS jumlah_anak
      FROM mapel m
      JOIN kelompok_mapel km ON m.id_kelompok = km.id_kelompok
      LEFT JOIN mapel p ON m.parent_id = p.id_mapel
      ORDER BY COALESCE(p.urut, m.urut) ASC,
        COALESCE(p.id_mapel, m.id_mapel) ASC,
        (m.parent_id IS NULL) DESC,
        m.urut ASC,
        m.nama_mapel ASC,
        m.id_mapel ASC
    `);
    return mapel;
  } catch (error) {
    console.error('Mapel fetch error:', error);
    return [];
  }
}

async function getKelompok() {
  try {
    const [kelompok]: any = await pool.query('SELECT * FROM kelompok_mapel');
    return kelompok;
  } catch (error) {
    console.error('Kelompok fetch error:', error);
    return [];
  }
}

export default async function MapelPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');
  const [mapel, kelompok] = await Promise.all([getMapel(), getKelompok()]);

  return (
    <div>
      <MapelClient mapel={mapel} refKelompok={kelompok} />
    </div>
  );
}
