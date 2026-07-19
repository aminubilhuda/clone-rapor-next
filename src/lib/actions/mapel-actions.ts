'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { SEKOLAH_ID } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function updateMapel(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_mapel') as string;
  const namaMapel = formData.get('nama_mapel') as string;
  const sMapel = formData.get('s_mapel') as string;
  const idKelompok = formData.get('id_kelompok') as string;
  const urut = formData.get('urut') as string;

  try {
    if (id) {
      await pool.query(
        `UPDATE mapel SET nama_mapel = ?, s_mapel = ?, id_kelompok = ?, urut = ? WHERE id_mapel = ?`,
        [namaMapel, sMapel, idKelompok, urut, id]
      );
    } else {
      await pool.query(
        `INSERT INTO mapel (nama_mapel, s_mapel, id_kelompok, urut, id_sekolah) VALUES (?, ?, ?, ?, ?)`,
        [namaMapel, sMapel, idKelompok, urut, SEKOLAH_ID]
      );
    }

    revalidatePath('/tu/mapel');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function deleteMapel(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('DELETE FROM mapel WHERE id_mapel = ?', [id]);
    revalidatePath('/tu/mapel');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}

export async function updateUrutMapel(idMapel: number, urut: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('UPDATE mapel SET urut = ? WHERE id_mapel = ?', [urut, idMapel]);
    revalidatePath('/tu/mapel');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal mengupdate urutan' } as const;
  }
}
