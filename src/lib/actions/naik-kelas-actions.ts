'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateNaikKelas(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_siswa_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idTingkat = formData.get('id_tingkat') as string;

  if (!id) {
    return { success: false, error: 'ID tidak valid' } as const;
  }

  try {
    await pool.query(
      'UPDATE siswa_kelas SET id_kelas = ?, id_tingkat = ? WHERE id_siswa_kelas = ?',
      [idKelas, idTingkat, id]
    );

    revalidatePath('/tu/naik-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function promoteKelas(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idKelas = formData.get('id_kelas') as string;
  const idTingkatLama = formData.get('id_tingkat_lama') as string;
  const idTingkatBaru = formData.get('id_tingkat_baru') as string;
  const idKelasBaru = formData.get('id_kelas_baru') as string;

  if (!idKelas || !idTingkatBaru || !idKelasBaru) {
    return { success: false, error: 'Data tidak lengkap' } as const;
  }

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
  const tahunBaru = (sekolah?.tahun || 1) + 1;
  const semester = sekolah?.semester || 1;

  try {
    const [siswaRows]: any = await pool.query(
      'SELECT id_siswa FROM siswa_kelas WHERE id_kelas = ? AND id_tingkat = ?',
      [idKelas, idTingkatLama]
    );

    for (const siswa of siswaRows) {
      await pool.query(
        'INSERT INTO siswa_kelas (tahun, semester, id_tingkat, id_kelas, id_siswa, status) VALUES (?, ?, ?, ?, ?, 1)',
        [tahunBaru, semester, idTingkatBaru, idKelasBaru, siswa.id_siswa]
      );
    }

    revalidatePath('/tu/naik-kelas');
    return {
      success: true,
      count: siswaRows.length,
      message: `Berhasil menaikkan ${siswaRows.length} siswa`
    } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menaikkan kelas' } as const;
  }
}
