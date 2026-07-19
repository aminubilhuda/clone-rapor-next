'use server';

import { cookies } from 'next/headers';

export async function getViewFilter() {
  const cookieStore = await cookies();
  const tahun = cookieStore.get('view_tahun')?.value;
  const semester = cookieStore.get('view_semester')?.value;
  return { tahun, semester };
}

export async function setViewFilter(tahun: string, semester: string) {
  // Validate tahun and semester are positive integers
  const tahunNum = Number(tahun);
  const semesterNum = Number(semester);
  if (!Number.isInteger(tahunNum) || tahunNum < 1 || !Number.isInteger(semesterNum) || (semesterNum !== 1 && semesterNum !== 2)) {
    return { success: false, error: 'Invalid filter values' } as const;
  }

  const cookieStore = await cookies();
  cookieStore.set('view_tahun', String(tahunNum), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: 'lax',
  });
  cookieStore.set('view_semester', String(semesterNum), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: 'lax',
  });
  return { success: true } as const;
}

export async function clearViewFilter() {
  const cookieStore = await cookies();
  cookieStore.delete('view_tahun');
  cookieStore.delete('view_semester');
}
