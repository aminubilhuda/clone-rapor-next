import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { JABATAN } from '@/lib/constants';
import { getRequestOrigin } from '@/lib/url-helper';

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: NextRequest): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp?.trim()) return realIp.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return '127.0.0.1';
}

function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  if (loginAttempts.size > 5000) {
    for (const [k, v] of loginAttempts) {
      if (now > v.resetAt) loginAttempts.delete(k);
    }
  }

  const record = loginAttempts.get(key);

  if (!record || now > record.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + 60000 }); // 1 minute window
    return { allowed: true };
  }

  if (record.count >= 5) { // 5 attempts per minute
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;
  const origin = getRequestOrigin(request);

  // Rate limiting for login APIs
  if (
    (pathname === '/api/auth/callback/credentials' || pathname === '/api/v1/auth/login') &&
    request.method === 'POST'
  ) {
    const key = getRateLimitKey(request);
    const { allowed, retryAfter } = checkRateLimit(key);

    if (!allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login. Coba lagi dalam ${retryAfter} detik.` },
        { status: 429 }
      );
    }
  }

  // Allow login page and API auth routes
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    if (pathname === '/login' && session?.user) {
      const jabatan = session.user.jabatan;
      if (jabatan === JABATAN.SUPER_ADMIN || jabatan === JABATAN.TU_ADMIN) return NextResponse.redirect(new URL('/tu', origin));
      if (jabatan === JABATAN.GURU) return NextResponse.redirect(new URL('/guru', origin));
      if (jabatan === JABATAN.SISWA) return NextResponse.redirect(new URL('/siswa', origin));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith('/tu') || pathname.startsWith('/guru') || pathname.startsWith('/siswa')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', origin));
    }

    if (pathname.startsWith('/tu') && session.user.jabatan !== JABATAN.SUPER_ADMIN && session.user.jabatan !== JABATAN.TU_ADMIN) {
      return NextResponse.redirect(new URL('/login', origin));
    }
    if (pathname.startsWith('/guru') && session.user.jabatan !== JABATAN.GURU) {
      return NextResponse.redirect(new URL('/login', origin));
    }
    if (pathname.startsWith('/siswa') && session.user.jabatan !== JABATAN.SISWA) {
      return NextResponse.redirect(new URL('/login', origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/tu/:path*', '/guru/:path*', '/siswa/:path*', '/api/auth/callback/credentials', '/api/v1/auth/login'],
};
