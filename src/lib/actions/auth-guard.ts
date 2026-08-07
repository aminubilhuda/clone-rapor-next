import { auth } from '@/lib/auth';

/**
 * Guard for TU / Admin pages (jabatan 1 or 2).
 * Returns `{ user }` on success or `{ error: string }` on failure.
 */
export async function requireTuAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized', user: null };
  }
  if (session.user.jabatan !== 1 && session.user.jabatan !== 2) {
    return { error: 'Forbidden', user: null };
  }
  return { user: session.user, error: null };
}

/**
 * Guard for Guru pages (jabatan 3).
 */
export async function requireGuru() {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized', user: null };
  }
  if (session.user.jabatan !== 3) {
    return { error: 'Forbidden', user: null };
  }
  return { user: session.user, error: null };
}

/**
 * Guard for Guru BK pages (jabatan 3 + moto = '1').
 */
export async function requireGuruBK() {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized', user: null };
  }
  if (session.user.jabatan !== 3) {
    return { error: 'Forbidden', user: null };
  }
  if (session.user.moto !== '1') {
    return { error: 'Bukan Guru BK', user: null };
  }
  return { user: session.user, error: null };
}

/**
 * Guard for any authenticated user.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized', user: null };
  }
  return { user: session.user, error: null };
}
