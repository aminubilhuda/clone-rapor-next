import { auth } from '@/lib/auth';
import { setViewFilter, clearViewFilter } from '@/lib/view-filter';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const action = formData.get('action') as string;

  if (action === 'clear') {
    await clearViewFilter();
    return NextResponse.redirect(new URL('/tu', req.url));
  }

  const tahun = formData.get('tahun') as string;
  const semester = formData.get('semester') as string;

  if (!tahun || !semester) {
    return NextResponse.json({ error: 'Missing tahun or semester' }, { status: 400 });
  }

  await setViewFilter(tahun, semester);
  return NextResponse.redirect(new URL('/tu', req.url));
}
