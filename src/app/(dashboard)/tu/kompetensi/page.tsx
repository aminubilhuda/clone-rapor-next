import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import KompetensiClient from './_components/kompetensi-client';

async function getKompetensi() {
  try {
    const [kompetensi]: any = await pool.query('SELECT * FROM kompetensi_keahlian ORDER BY id_kompetensi_keahlian ASC');
    return kompetensi;
  } catch (error) {
    console.error('Kompetensi fetch error:', error);
    return [];
  }
}

export default async function KompetensiPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');
  const kompetensi = await getKompetensi();

  return (
    <div>
      <KompetensiClient kompetensi={kompetensi} />
    </div>
  );
}
