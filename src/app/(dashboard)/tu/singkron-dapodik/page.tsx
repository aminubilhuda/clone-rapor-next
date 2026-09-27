import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SingkronClient from './_components/singkron-client';

async function getData() {
  try {
    const [configRows]: any = await pool.query('SELECT * FROM dapodik_config WHERE id = 1 LIMIT 1');
    const [logRows]: any = await pool.query('SELECT * FROM dapodik_log ORDER BY id DESC LIMIT 50');

    let config = null;
    if (configRows[0]) {
      const { token, ...rest } = configRows[0];
      config = {
        ...rest,
        has_token: Boolean(token),
        token_preview: token ? `${String(token).slice(0, 4)}••••` : null,
      };
    }

    return { config, logs: logRows };
  } catch (error) {
    console.error('Singkron DAPODIK data fetch error:', error);
    return { config: null, logs: [] };
  }
}

export default async function SingkronDapodikPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');

  const { config, logs } = await getData();

  return (
    <div>
      <SingkronClient config={config} logs={logs} />
    </div>
  );
}
