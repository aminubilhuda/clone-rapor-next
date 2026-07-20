import type { NextRequest } from 'next/server';

export function getRequestOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  const host = req.headers.get('host');
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`;
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  return req.nextUrl.origin;
}
