import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const jabatan = session.user.jabatan;
    if (jabatan === 1 || jabatan === 2) redirect('/tu'); // ponytail: jabatan=1 treated as TU admin
    if (jabatan === 3) redirect('/guru');
  }

  redirect('/login');
}
