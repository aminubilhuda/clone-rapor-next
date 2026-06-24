'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateWaliKelas(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idKelas = formData.get('id_kelas') as string;
  const idUser = formData.get('id_user') as string;
  const tahun = formData.get('tahun') as string;
  const semester = formData.get('semester') as string;

  try {
    const [existing]: any = await pool.query(
      'SELECT id_kelas_wali FROM kelas_wali WHERE id_kelas = ? AND tahun = ? AND semester = ?',
      [idKelas, tahun, semester]
    );

    if (idUser) {
      if (existing.length > 0) {
        await pool.query('UPDATE kelas_wali SET id_user = ? WHERE id_kelas_wali = ?', [idUser, existing[0].id_kelas_wali]);
      } else {
        await pool.query(
          'INSERT INTO kelas_wali (tahun, semester, id_kelas, id_user) VALUES (?, ?, ?, ?)',
          [tahun, semester, idKelas, idUser]
        );
      }
    } else {
      if (existing.length > 0) {
        await pool.query('DELETE FROM kelas_wali WHERE id_kelas_wali = ?', [existing[0].id_kelas_wali]);
      }
    }

    revalidatePath('/tu/rombel');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}
