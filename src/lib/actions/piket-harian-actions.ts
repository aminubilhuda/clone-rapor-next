'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updatePiketHarian(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_piket_harian') as string;
  const idHarian = formData.get('id_harian') as string;
  const idUser = formData.get('id_user') as string;

  try {
    if (id) {
      await pool.query(
        `UPDATE piket_harian SET id_harian = ?, id_user = ? WHERE id_piket_harian = ?`,
        [idHarian, idUser, id]
      );
    } else {
      await pool.query(
        `INSERT INTO piket_harian (id_harian, id_user) VALUES (?, ?)`,
        [idHarian, idUser]
      );
    }

    revalidatePath('/tu/piket-harian');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deletePiketHarian(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM piket_harian WHERE id_piket_harian = ?', [id]);
    revalidatePath('/tu/piket-harian');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
