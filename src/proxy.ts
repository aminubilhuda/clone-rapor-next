import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { JABATAN } from '@/lib/constants';

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
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

  // Rate limiting for login API
  if (pathname === '/api/auth/callback/credentials' && request.method === 'POST') {
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
      if (jabatan === JABATAN.TU_ADMIN) return NextResponse.redirect(new URL('/tu', request.url));
      if (jabatan === JABATAN.GURU) return NextResponse.redirect(new URL('/guru', request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith('/tu') || pathname.startsWith('/guru')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/tu') && session.user.jabatan !== JABATAN.SUPER_ADMIN && session.user.jabatan !== JABATAN.TU_ADMIN) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/guru') && session.user.jabatan !== JABATAN.GURU) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/tu/:path*', '/guru/:path*', '/api/auth/callback/credentials'],
};
