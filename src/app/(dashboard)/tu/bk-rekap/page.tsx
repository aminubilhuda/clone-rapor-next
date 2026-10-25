import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBKRekapTU } from '@/lib/actions/bk-actions';
import BKRekapClient from '@/app/(dashboard)/guru/bk/rekap/_components/bk-rekap-client';

export default async function BKRekapTUPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    redirect('/login');
  }

  const data = await getBKRekapTU();
  return <BKRekapClient classes={data.classes} idKelas={data.idKelas} rows={data.rows} forTU />;
}
