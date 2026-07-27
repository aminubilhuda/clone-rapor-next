import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { SEKOLAH_ID } from '@/lib/constants';
import { access } from 'node:fs/promises';
import { basename, join } from 'node:path';

interface SekolahLogoRow {
  logo: string | null;
}

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT logo FROM sekolah WHERE id_sekolah = ? AND deleted_at IS NULL',
      [SEKOLAH_ID]
    );
    const logo = (rows as SekolahLogoRow[])[0]?.logo;

    if (logo && basename(logo) === logo) {
      await access(join(process.cwd(), 'public', 'uploads', 'sekolah', logo));
      return NextResponse.json({ logo });
    }

    return NextResponse.json({ logo: null });
  } catch {
    return NextResponse.json({ logo: null });
  }
}
