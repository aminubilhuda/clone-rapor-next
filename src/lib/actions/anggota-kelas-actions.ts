'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getPeriodeAktif } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

export async function bulkAddAnggotaKelas(idKelas: number, idSiswaList: number[]) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const { tahun, semester } = await getPeriodeAktif();

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
  } catch {
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
  } catch {
    return { success: false, error: 'Gagal menghapus anggota' } as const;
  }
}
