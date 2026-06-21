'use server';

import { cookies } from 'next/headers';

export async function getViewFilter() {
  const cookieStore = await cookies();
  const tahun = cookieStore.get('view_tahun')?.value;
  const semester = cookieStore.get('view_semester')?.value;
  return { tahun, semester };
}

export async function setViewFilter(tahun: string, semester: string) {
  const cookieStore = await cookies();
  cookieStore.set('view_tahun', tahun, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  cookieStore.set('view_semester', semester, { path: '/', maxAge: 60 * 60 * 24 * 365 });
}

export async function clearViewFilter() {
  const cookieStore = await cookies();
  cookieStore.delete('view_tahun');
  cookieStore.delete('view_semester');
}
