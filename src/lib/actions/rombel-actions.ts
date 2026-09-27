'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { withTransaction } from '@/lib/db';
import { getPeriodeAktif } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

export async function updateWaliKelas(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const idKelas = formData.get('id_kelas') as string;
  const idUser = formData.get('id_user') as string;
  const { tahun, semester } = await getPeriodeAktif();

  if (!Number.isInteger(Number(idKelas)) || Number(idKelas) <= 0) {
    return { success: false, error: 'Kelas tidak valid' } as const;
  }
  if (idUser && (!Number.isInteger(Number(idUser)) || Number(idUser) <= 0)) {
    return { success: false, error: 'Pegawai tidak valid' } as const;
  }

  try {
    await withTransaction(async (conn) => {
      const [existing]: any = await conn.query(
        'SELECT id_kelas_wali FROM kelas_wali WHERE id_kelas = ? AND tahun = ? AND semester = ? FOR UPDATE',
        [idKelas, tahun, semester]
      );

      if (idUser) {
        if (existing.length > 0) {
          await conn.query('UPDATE kelas_wali SET id_user = ? WHERE id_kelas_wali = ?', [idUser, existing[0].id_kelas_wali]);
        } else {
          await conn.query(
            'INSERT INTO kelas_wali (tahun, semester, id_kelas, id_user) VALUES (?, ?, ?, ?)',
            [tahun, semester, idKelas, idUser]
          );
        }
      } else {
        if (existing.length > 0) {
          await conn.query('DELETE FROM kelas_wali WHERE id_kelas_wali = ?', [existing[0].id_kelas_wali]);
        }
      }
    });

    revalidatePath('/tu/rombel');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}
