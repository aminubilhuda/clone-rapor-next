import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const jabatan = session.user.jabatan;
    if (jabatan === 2) redirect('/tu');
    if (jabatan === 3) redirect('/guru');
  }

  redirect('/login');
}
