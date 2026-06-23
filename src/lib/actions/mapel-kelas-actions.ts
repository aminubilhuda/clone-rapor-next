'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateMapelKelas(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_mapel_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idMapel = formData.get('id_mapel') as string;
  const idUser = formData.get('id_user') as string;

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  try {
    if (id) {
      await pool.query(
        `UPDATE mapel_kelas SET id_kelas = ?, id_mapel = ?, id_user = ? WHERE id_mapel_kelas = ?`,
        [idKelas, idMapel, idUser || null, id]
      );
    } else {
      await pool.query(
        `INSERT INTO mapel_kelas (tahun, semester, id_kelas, id_mapel, id_user)
         VALUES (?, ?, ?, ?, ?)`,
        [tahun, semester, idKelas, idMapel, idUser || null]
      );
    }

    revalidatePath('/tu/mapel-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteMapelKelas(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM mapel_kelas WHERE id_mapel_kelas = ?', [id]);
    revalidatePath('/tu/mapel-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
