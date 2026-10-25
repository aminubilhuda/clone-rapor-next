import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function BKLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');
  return <>{children}</>;
}
