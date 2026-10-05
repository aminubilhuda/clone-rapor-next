'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addPiketHarian(idHarian: number, idUser: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query(
      'INSERT INTO piket_harian (id_harian, id_user) VALUES (?, ?)',
      [idHarian, idUser]
    );
    revalidatePath('/tu/piket-harian');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function deletePiketHarianByHariUser(idHarian: number, idUser: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query(
      'DELETE FROM piket_harian WHERE id_harian = ? AND id_user = ? LIMIT 1',
      [idHarian, idUser]
    );
    revalidatePath('/tu/piket-harian');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}
