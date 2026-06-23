'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateDeskripsi(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_deskripsi') as string;
  const kriteria = formData.get('kriteria') as string;
  const keterangan = formData.get('keterangan') as string;
  const contoh = formData.get('contoh') as string;
  const nilai = formData.get('nilai') as string;

  try {
    if (id) {
      await pool.query(
        'UPDATE deskripsi_rapor SET kriteria = ?, keterangan = ?, contoh = ?, nilai = ? WHERE id_deskripsi = ?',
        [kriteria, keterangan, contoh, nilai, id]
      );
    } else {
      await pool.query(
        'INSERT INTO deskripsi_rapor (kriteria, keterangan, contoh, nilai) VALUES (?, ?, ?, ?)',
        [kriteria, keterangan, contoh, nilai]
      );
    }

    revalidatePath('/tu/deskripsi-rapor');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteDeskripsi(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM deskripsi_rapor WHERE id_deskripsi = ?', [id]);
    revalidatePath('/tu/deskripsi-rapor');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
