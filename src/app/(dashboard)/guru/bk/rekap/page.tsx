import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBKRekap } from '@/lib/actions/bk-actions';
import BKRekapClient from './_components/bk-rekap-client';

export default async function BKRekapPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');

  const data = await getBKRekap();
  return <BKRekapClient classes={data.classes} idKelas={data.idKelas} rows={data.rows} />;
}
