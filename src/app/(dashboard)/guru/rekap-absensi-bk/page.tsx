import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RekapAbsensiBKClient from './_components/rekap-absensi-bk-client';

export default async function RekapAbsensiBKPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');
  if (session.user.moto !== '1') redirect('/guru');

  return <RekapAbsensiBKClient />;
}
