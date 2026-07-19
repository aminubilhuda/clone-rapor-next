'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updatePiketHarian(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

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
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function deletePiketHarian(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('DELETE FROM piket_harian WHERE id_piket_harian = ?', [id]);
    revalidatePath('/tu/piket-harian');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}

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
  } catch (e: any) {
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
  } catch (e: any) {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}
