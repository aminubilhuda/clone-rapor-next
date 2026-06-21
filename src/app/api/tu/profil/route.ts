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

  const fields = [
    'npsn', 'nama_sekolah', 'alamat', 'desa', 'kecamatan',
    'kabupaten', 'provinsi', 'email', 'kontak', 'website', 'yayasan',
    'visi', 'misi',
  ];

  try {
    const setClauses = fields.map((f) => `\`${f}\` = ?`).join(', ');
    const values = fields.map((f) => formData.get(f) as string);
    values.push('1'); // WHERE id_sekolah = 1

    await pool.query(
      `UPDATE sekolah SET ${setClauses} WHERE id_sekolah = ?`,
      values
    );

    revalidatePath('/tu/profil');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Profil save error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
