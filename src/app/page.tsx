import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { JABATAN } from '@/lib/constants';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const jabatan = session.user.jabatan;
    if (jabatan === JABATAN.SUPER_ADMIN || jabatan === JABATAN.TU_ADMIN) redirect('/tu');
    if (jabatan === JABATAN.GURU) redirect('/guru');
    if (jabatan === JABATAN.SISWA) redirect('/siswa');
  }

  redirect('/login');
}
