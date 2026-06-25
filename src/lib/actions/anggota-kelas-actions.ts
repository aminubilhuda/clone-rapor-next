'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateAnggotaKelas(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_siswa_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idSiswa = formData.get('id_siswa') as string;
  const status = formData.get('status') as string;

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  const [kelasRows]: any = await pool.query('SELECT id_tingkat FROM kelas WHERE id_kelas = ?', [idKelas]);
  const idTingkat = kelasRows[0]?.id_tingkat || 1;

  try {
    if (id) {
      await pool.query(
        `UPDATE siswa_kelas SET id_kelas = ?, id_siswa = ?, status = ? WHERE id_siswa_kelas = ?`,
        [idKelas, idSiswa, status, id]
      );
    } else {
      await pool.query(
        `INSERT INTO siswa_kelas (tahun, semester, id_tingkat, id_kelas, id_siswa, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tahun, semester, idTingkat, idKelas, idSiswa, status || 1]
      );
    }

    revalidatePath('/tu/anggota-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteAnggotaKelas(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('UPDATE siswa_kelas SET deleted_at = NOW() WHERE id_siswa_kelas = ?', [id]);
    revalidatePath('/tu/anggota-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}

export async function bulkAddAnggotaKelas(idKelas: number, idSiswaList: number[]) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  try {
    const [kelasRows]: any = await pool.query('SELECT id_tingkat FROM kelas WHERE id_kelas = ?', [idKelas]);
    const idTingkat = kelasRows[0]?.id_tingkat || 1;

    for (const idSiswa of idSiswaList) {
      await pool.query(
        'INSERT INTO siswa_kelas (tahun, semester, id_tingkat, id_kelas, id_siswa, status) VALUES (?, ?, ?, ?, ?, 1)',
        [tahun, semester, idTingkat, idKelas, idSiswa]
      );
    }

    revalidatePath('/tu/anggota-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menambah anggota' } as const;
  }
}

export async function bulkRemoveAnggotaKelas(idSiswaKelasList: number[]) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    for (const id of idSiswaKelasList) {
      await pool.query('UPDATE siswa_kelas SET deleted_at = NOW() WHERE id_siswa_kelas = ?', [id]);
    }

    revalidatePath('/tu/anggota-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus anggota' } as const;
  }
}
