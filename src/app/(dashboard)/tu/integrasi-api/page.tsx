import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { JABATAN } from '@/lib/constants';
import { getApiKeys } from '@/lib/actions/api-key-actions';
import IntegrasiApiClient from './_components/integrasi-api-client';

export const dynamic = 'force-dynamic';

export default async function IntegrasiApiPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.jabatan !== JABATAN.SUPER_ADMIN && session.user.jabatan !== JABATAN.TU_ADMIN)
  ) {
    redirect('/login');
  }

  const apiKeys = await getApiKeys();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <IntegrasiApiClient initialKeys={apiKeys} />
    </div>
  );
}
