'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

function generateKode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function updateP5BK(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_proyek_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idTema = formData.get('id_tema') as string;
  const idUser = formData.get('id_user') as string;
  const judulProyek = formData.get('judul_proyek') as string;
  const deskripsiSingkat = formData.get('deskripsi_singkat') as string;

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  try {
    if (id) {
      await pool.query(
        `UPDATE proyek_kelas SET id_kelas = ?, id_tema = ?, id_user = ?, judul_proyek = ?, deskripsi_singkat = ? WHERE id_proyek_kelas = ?`,
        [idKelas, idTema, idUser, judulProyek, deskripsiSingkat, id]
      );
    } else {
      await pool.query(
        `INSERT INTO proyek_kelas (kode, tahun, semester, id_kelas, id_tema, id_user, judul_proyek, deskripsi_singkat)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [generateKode(), tahun, semester, idKelas, idTema, idUser, judulProyek, deskripsiSingkat]
      );
    }

    revalidatePath('/tu/p5bk');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteP5BK(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM proyek_kelas WHERE id_proyek_kelas = ?', [id]);
    revalidatePath('/tu/p5bk');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
