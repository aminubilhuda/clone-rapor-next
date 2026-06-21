'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateProfil(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const fields = [
    'npsn', 'nama_sekolah', 'alamat', 'desa', 'kecamatan',
    'kabupaten', 'provinsi', 'email', 'kontak', 'website', 'yayasan',
    'visi', 'misi',
  ];

  try {
    const setClauses = fields.map((f) => `\`${f}\` = ?`).join(', ');
    const values = fields.map((f) => formData.get(f) as string);
    values.push('1');

    await pool.query(
      `UPDATE sekolah SET ${setClauses} WHERE id_sekolah = ?`,
      values
    );

    revalidatePath('/tu/profil');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}
