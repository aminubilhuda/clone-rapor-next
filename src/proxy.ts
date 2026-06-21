import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Allow login page and API auth routes
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    if (pathname === '/login' && session?.user) {
      const jabatan = session.user.jabatan;
      if (jabatan === 2) return NextResponse.redirect(new URL('/tu', request.url));
      if (jabatan === 3) return NextResponse.redirect(new URL('/guru', request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith('/tu') || pathname.startsWith('/guru')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/tu') && session.user.jabatan !== 2) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/guru') && session.user.jabatan !== 3) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/tu/:path*', '/guru/:path*'],
};
