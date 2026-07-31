import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BroadcastForm from './_components/broadcast-form';

export default async function NotifikasiPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Kirim Notifikasi</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Kirim notifikasi push ke semua perangkat yang telah mengaktifkan notifikasi.
        </p>
      </div>
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] p-6">
        <BroadcastForm />
      </div>
    </div>
  );
}