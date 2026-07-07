import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      'SELECT logo FROM sekolah WHERE id_sekolah = 1 AND deleted_at IS NULL'
    );

    if (rows.length > 0 && rows[0].logo) {
      return NextResponse.json({ logo: rows[0].logo });
    }

    return NextResponse.json({ logo: null });
  } catch {
    return NextResponse.json({ logo: null });
  }
}
