import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, resolve, sep } from 'path';

const UPLOADS_DIR = resolve(join(process.cwd(), 'public', 'uploads'));

const CONTENT_TYPES: Record<string, string> = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'webp': 'image/webp',
  'pdf': 'application/pdf',
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await context.params;
  if (!path || path.length === 0) {
    return NextResponse.json({ error: 'No path provided' }, { status: 400 });
  }

  // Prevent path traversal
  const filePath = resolve(join(process.cwd(), 'public', 'uploads', ...path));
  if (!filePath.startsWith(`${UPLOADS_DIR}${sep}`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await readFile(filePath);
    const ext = path[path.length - 1].split('.').pop()?.toLowerCase() || '';
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
