import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Get logo from database
    const [rows]: any = await pool.query(
      'SELECT logo FROM sekolah WHERE id_sekolah = 1 AND deleted_at IS NULL'
    );

    if (rows.length === 0 || !rows[0].logo) {
      // Return default favicon if no logo
      const defaultPath = join(process.cwd(), 'public', 'favicon.ico');
      const data = await readFile(defaultPath);
      return new NextResponse(data, {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // Serve logo as favicon
    const logoPath = join(process.cwd(), 'public', 'uploads', 'sekolah', rows[0].logo);
    const data = await readFile(logoPath);

    // Determine content type based on file extension
    const ext = rows[0].logo.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
    };

    const contentType = contentTypes[ext || ''] || 'image/png';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache 1 hour
      },
    });
  } catch {
    // Return default favicon on error
    try {
      const defaultPath = join(process.cwd(), 'public', 'favicon.ico');
      const data = await readFile(defaultPath);
      return new NextResponse(data, {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch {
      return NextResponse.json({ error: 'Favicon not found' }, { status: 404 });
    }
  }
}
