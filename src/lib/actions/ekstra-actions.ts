'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateEkstra(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_eskul') as string;
  const namaEskul = formData.get('nama_eskul') as string;
  const kode = formData.get('kode') as string;

  try {
    if (id) {
      await pool.query('UPDATE eskul SET nama_eskul = ?, kode = ? WHERE id_eskul = ?', [namaEskul, kode, id]);
    } else {
      await pool.query('INSERT INTO eskul (nama_eskul, kode, id_sekolah) VALUES (?, ?, 1)', [namaEskul, kode]);
    }

    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteEkstra(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM eskul WHERE id_eskul = ?', [id]);
    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
