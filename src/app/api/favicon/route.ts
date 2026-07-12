import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { pool } from '@/lib/db';

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#DC2626"/><text x="16" y="22" text-anchor="middle" font-size="18" font-weight="bold" fill="white" font-family="Arial">E</text></svg>`;

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      'SELECT logo FROM sekolah WHERE id_sekolah = 1 AND deleted_at IS NULL'
    );

    if (rows.length === 0 || !rows[0].logo) {
      return new NextResponse(DEFAULT_SVG, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    try {
      const logoPath = join(process.cwd(), 'public', 'uploads', 'sekolah', rows[0].logo);
      const data = await readFile(logoPath);

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
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      return new NextResponse(DEFAULT_SVG, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch {
    return new NextResponse(DEFAULT_SVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }
}
