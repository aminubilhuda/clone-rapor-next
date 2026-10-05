'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool, withTransaction } from '@/lib/db';
import { getSekolahAktif } from '@/lib/sekolah-helper';
import { parseJsonArray } from '@/lib/validate';
import { revalidatePath } from 'next/cache';

export async function toggleMapelSiswa(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const idSiswa = formData.get('id_siswa') as string;
  const idMapel = formData.get('id_mapel') as string;
  const idKelas = formData.get('id_kelas') as string;
  const diikuti = formData.get('diikuti') === 'true';

  const sekolah = await getSekolahAktif();
  const { tahun, semester } = { tahun: sekolah?.tahun || 1, semester: sekolah?.semester || 1 };

  const [kelasRows]: any = await pool.query('SELECT id_tingkat FROM kelas WHERE id_kelas = ?', [idKelas]);
  const idTingkat = kelasRows[0]?.id_tingkat;

  try {
    await withTransaction(async (conn) => {
      const [existing]: any = await conn.query(
        'SELECT id_mapel_siswa FROM mapel_siswa WHERE id_siswa = ? AND id_mapel = ? AND id_kelas = ? AND tahun = ? AND semester = ? FOR UPDATE',
        [idSiswa, idMapel, idKelas, tahun, semester]
      );

      if (diikuti) {
        if (existing.length > 0) {
          await conn.query('UPDATE mapel_siswa SET aktif = 1 WHERE id_mapel_siswa = ?', [existing[0].id_mapel_siswa]);
        } else {
          await conn.query(
            `INSERT INTO mapel_siswa (tahun, semester, id_tingkat, id_kelas, id_mapel, id_siswa, aktif)
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [tahun, semester, idTingkat, idKelas, idMapel, idSiswa]
          );
        }
      } else {
        if (existing.length > 0) {
          await conn.query('DELETE FROM mapel_siswa WHERE id_mapel_siswa = ?', [existing[0].id_mapel_siswa]);
        }
      }
    });

    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function toggleMapelSiswaBatch(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const idKelas = parseInt(formData.get('id_kelas') as string);
  const idMapel = parseInt(formData.get('id_mapel') as string);
  const parsedEntries = parseJsonArray<{ id_siswa: number; diikuti: boolean }>(
    formData.get('entries') as string,
    'data siswa'
  );
  if (!parsedEntries.ok) {
    return { success: false, error: parsedEntries.error } as const;
  }
  const entries = parsedEntries.value;

  const sekolah = await getSekolahAktif();
  const { tahun, semester } = { tahun: sekolah?.tahun || 1, semester: sekolah?.semester || 1 };

  const [kelasRows]: any = await pool.query('SELECT id_tingkat FROM kelas WHERE id_kelas = ?', [idKelas]);
  const idTingkat = kelasRows[0]?.id_tingkat;

  try {
    await withTransaction(async (conn) => {
      for (const entry of entries) {
        const [existing]: any = await conn.query(
          'SELECT id_mapel_siswa FROM mapel_siswa WHERE id_siswa = ? AND id_mapel = ? AND id_kelas = ? AND tahun = ? AND semester = ? FOR UPDATE',
          [entry.id_siswa, idMapel, idKelas, tahun, semester]
        );
        if (entry.diikuti) {
          if (existing.length > 0) {
            await conn.query('UPDATE mapel_siswa SET aktif = 1 WHERE id_mapel_siswa = ?', [existing[0].id_mapel_siswa]);
          } else {
            await conn.query(
              `INSERT INTO mapel_siswa (tahun, semester, id_tingkat, id_kelas, id_mapel, id_siswa, aktif)
               VALUES (?, ?, ?, ?, ?, ?, 1)`,
              [tahun, semester, idTingkat, idKelas, idMapel, entry.id_siswa]
            );
          }
        } else {
          if (existing.length > 0) {
            await conn.query('DELETE FROM mapel_siswa WHERE id_mapel_siswa = ?', [existing[0].id_mapel_siswa]);
          }
        }
      }
    });

    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

