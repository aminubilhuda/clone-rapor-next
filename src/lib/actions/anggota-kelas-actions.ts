'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

export async function updateAnggotaKelas(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_siswa_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idSiswa = formData.get('id_siswa') as string;
  const status = formData.get('status') as string;

  const sekolah = await getSekolahWithFilter();
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
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function deleteAnggotaKelas(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('UPDATE siswa_kelas SET deleted_at = NOW() WHERE id_siswa_kelas = ?', [id]);
    revalidatePath('/tu/anggota-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}

export async function bulkAddAnggotaKelas(idKelas: number, idSiswaList: number[]) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const sekolah = await getSekolahWithFilter();
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  try {
    // Query id_tingkat sekali — tidak perlu diulang di setiap iterasi
    const [kelasRows]: any = await pool.query('SELECT id_tingkat FROM kelas WHERE id_kelas = ?', [idKelas]);
    const idTingkat = kelasRows[0]?.id_tingkat || 1;

    if (idSiswaList.length > 0) {
      const values = idSiswaList.map((idSiswa) => [tahun, semester, idTingkat, idKelas, idSiswa, 1]);
      await pool.query(
        'INSERT INTO siswa_kelas (tahun, semester, id_tingkat, id_kelas, id_siswa, status) VALUES ?',
        [values]
      );
    }

    revalidatePath('/tu/anggota-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menambah anggota' } as const;
  }
}

export async function bulkRemoveAnggotaKelas(idSiswaKelasList: number[]) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    // Batch: soft-delete semua dalam satu query
    if (idSiswaKelasList.length > 0) {
      await pool.query(
        'UPDATE siswa_kelas SET deleted_at = NOW() WHERE id_siswa_kelas IN (?)',
        [idSiswaKelasList]
      );
    }

    revalidatePath('/tu/anggota-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menghapus anggota' } as const;
  }
}
