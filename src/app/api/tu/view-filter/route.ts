import { auth } from '@/lib/auth';
import { setViewFilter, clearViewFilter } from '@/lib/view-filter';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const action = formData.get('action') as string;

  const redirectTo = (formData.get('redirect') as string) || '/tu';
  // Prevent open redirect — only allow relative paths
  const safeRedirect = redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/tu';

  if (action === 'clear') {
    await clearViewFilter();
    return NextResponse.redirect(new URL(safeRedirect, req.url));
  }

  const tahun = formData.get('tahun') as string;
  const semester = formData.get('semester') as string;

  if (!tahun || !semester) {
    return NextResponse.json({ error: 'Missing tahun or semester' }, { status: 400 });
  }

  const result = await setViewFilter(tahun, semester);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.redirect(new URL(safeRedirect, req.url));
}
