'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateKompetensi(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_kompetensi_keahlian') as string;
  const kompetensi = formData.get('kompetensi_keahlian') as string;
  const deskripsi = formData.get('deskripsi') as string;

  try {
    if (id) {
      await pool.query(
        'UPDATE kompetensi_keahlian SET kompetensi_keahlian = ?, deskripsi = ? WHERE id_kompetensi_keahlian = ?',
        [kompetensi, deskripsi, id]
      );
    } else {
      await pool.query(
        'INSERT INTO kompetensi_keahlian (kompetensi_keahlian, deskripsi, banner) VALUES (?, ?, ?)',
        [kompetensi, deskripsi, 'default.jpg']
      );
    }

    revalidatePath('/tu/kompetensi');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteKompetensi(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM kompetensi_keahlian WHERE id_kompetensi_keahlian = ?', [id]);
    revalidatePath('/tu/kompetensi');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
