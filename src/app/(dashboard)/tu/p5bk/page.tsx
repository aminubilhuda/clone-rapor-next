import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TUPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  return (
    <div className="text-center py-20">
      <h4 className="text-xl font-semibold mb-4 text-gray-600">Halaman dalam Pengembangan</h4>
      <p className="text-gray-400">Halaman ini akan segera tersedia.</p>
    </div>
  );
}
