'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updatePrakerin(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_prakerin') as string;
  const mitra = formData.get('mitra') as string;
  const lokasi = formData.get('lokasi') as string;
  const tanggalMulai = formData.get('tanggal_mulai') as string;
  const tanggalAkhir = formData.get('tanggal_akhir') as string;
  const instruktur = formData.get('instruktur') as string;
  const idUser = formData.get('id_user') as string;

  try {
    if (id) {
      await pool.query(
        `UPDATE prakerin SET mitra = ?, lokasi = ?, tanggal_mulai = ?, tanggal_akhir = ?, instruktur = ?, id_user = ?
         WHERE id_prakerin = ?`,
        [mitra, lokasi, tanggalMulai || null, tanggalAkhir || null, instruktur, idUser, id]
      );
    } else {
      await pool.query(
        `INSERT INTO prakerin (tahun, semester, mitra, lokasi, tanggal_mulai, tanggal_akhir, instruktur, id_user)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [1, 2, mitra, lokasi, tanggalMulai || null, tanggalAkhir || null, instruktur, idUser]
      );
    }

    revalidatePath('/tu/prakerin');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deletePrakerin(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM prakerin WHERE id_prakerin = ?', [id]);
    revalidatePath('/tu/prakerin');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
