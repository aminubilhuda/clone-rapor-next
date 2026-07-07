import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  if (!path || path.length === 0) {
    return NextResponse.json({ error: 'No path provided' }, { status: 400 });
  }

  const filePath = join(process.cwd(), 'public', 'uploads', ...path);

  try {
    const data = await readFile(filePath);
    const ext = path[path.length - 1].split('.').pop()?.toLowerCase();

    const contentTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
    };

    const contentType = contentTypes[ext || ''] || 'application/octet-stream';

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
