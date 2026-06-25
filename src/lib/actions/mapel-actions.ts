'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateMapel(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

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
        `INSERT INTO mapel (nama_mapel, s_mapel, id_kelompok, urut, id_sekolah) VALUES (?, ?, ?, ?, 1)`,
        [namaMapel, sMapel, idKelompok, urut]
      );
    }

    revalidatePath('/tu/mapel');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteMapel(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM mapel WHERE id_mapel = ?', [id]);
    revalidatePath('/tu/mapel');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}

export async function updateUrutMapel(idMapel: number, urut: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('UPDATE mapel SET urut = ? WHERE id_mapel = ?', [urut, idMapel]);
    revalidatePath('/tu/mapel');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal mengupdate urutan' } as const;
  }
}
