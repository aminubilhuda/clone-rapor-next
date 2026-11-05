import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAgendaBK } from '@/lib/actions/agenda-bk-actions';
import AgendaBKClient from './_components/agenda-bk-client';

export default async function AgendaBKPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');

  const rows = await getAgendaBK();
  return <AgendaBKClient rows={rows} />;
}
