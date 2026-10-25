import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBKRekap } from '@/lib/actions/bk-actions';
import BKSiswaClient from './_components/bk-siswa-client';

export default async function BKSiswaPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');

  const data = await getBKRekap();
  return <BKSiswaClient classes={data.classes} idKelas={data.idKelas} rows={data.rows} />;
}
