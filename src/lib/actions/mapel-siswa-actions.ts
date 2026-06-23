'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateMapelSiswa(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_mapel_siswa') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idMapel = formData.get('id_mapel') as string;
  const idSiswa = formData.get('id_siswa') as string;
  const aktif = formData.get('aktif') as string;

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  const [kelasRows]: any = await pool.query('SELECT id_tingkat FROM kelas WHERE id_kelas = ?', [idKelas]);
  const idTingkat = kelasRows[0]?.id_tingkat || 1;

  try {
    if (id) {
      await pool.query(
        `UPDATE mapel_siswa SET id_kelas = ?, id_mapel = ?, id_siswa = ?, aktif = ? WHERE id_mapel_siswa = ?`,
        [idKelas, idMapel, idSiswa, aktif, id]
      );
    } else {
      await pool.query(
        `INSERT INTO mapel_siswa (tahun, semester, id_tingkat, id_kelas, id_mapel, id_siswa, aktif)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tahun, semester, idTingkat, idKelas, idMapel, idSiswa, aktif || 1]
      );
    }

    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteMapelSiswa(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM mapel_siswa WHERE id_mapel_siswa = ?', [id]);
    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
