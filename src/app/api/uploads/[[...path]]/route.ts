import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, resolve, sep } from 'path';
import { auth } from '@/lib/auth';

const UPLOADS_DIR = resolve(join(process.cwd(), 'storage', 'uploads'));

const CONTENT_TYPES: Record<string, string> = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp',
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await context.params;
  if (!path || path.length === 0) {
    return NextResponse.json({ error: 'No path provided' }, { status: 400 });
  }

  // Logo sekolah harus tetap publik (halaman login & render PDF); lainnya wajib login.
  if (path[0] !== 'sekolah') {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Prevent path traversal
  const filePath = resolve(join(process.cwd(), 'storage', 'uploads', ...path));
  if (!filePath.startsWith(`${UPLOADS_DIR}${sep}`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await readFile(filePath);
    const ext = path[path.length - 1].split('.').pop()?.toLowerCase() || '';
    const contentType = CONTENT_TYPES[ext];

    if (!contentType) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'none'",
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
