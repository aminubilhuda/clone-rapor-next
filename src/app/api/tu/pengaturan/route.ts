import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();

  const tanggal_rapor = formData.get('tanggal_rapor') as string;
  const tanggal_mid = formData.get('tanggal_mid') as string;
  const lokasi = formData.get('lokasi') as string;
  const tahun = formData.get('tahun') as string;
  const semester = formData.get('semester') as string;

  try {
    // Update sekolah settings
    await pool.query(
      'UPDATE sekolah SET lokasi = ?, tahun = ?, semester = ? WHERE id_sekolah = 1',
      [lokasi, tahun, semester]
    );

    // Upsert pembagian_raport
    const [existing]: any = await pool.query(
      'SELECT * FROM pembagian_raport WHERE tahun = ? AND semester = ?',
      [tahun, semester]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE pembagian_raport SET tanggal_rapor = ?, tanggal_mid = ? WHERE tahun = ? AND semester = ?',
        [tanggal_rapor, tanggal_mid, tahun, semester]
      );
    } else {
      await pool.query(
        'INSERT INTO pembagian_raport (tahun, semester, tanggal_rapor, tanggal_mid) VALUES (?, ?, ?, ?)',
        [tahun, semester, tanggal_rapor, tanggal_mid]
      );
    }

    revalidatePath('/tu/pengaturan');
    return NextResponse.redirect(new URL('/tu/pengaturan', req.url));
  } catch (err: any) {
    console.error('Pengaturan save error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
