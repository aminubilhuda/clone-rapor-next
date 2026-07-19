'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahAktif } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

export async function updateMapelSiswa(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_mapel_siswa') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idMapel = formData.get('id_mapel') as string;
  const idSiswa = formData.get('id_siswa') as string;
  const aktif = formData.get('aktif') as string;

  const sekolah = await getSekolahAktif();
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
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

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
    const [existing]: any = await pool.query(
      'SELECT id_mapel_siswa FROM mapel_siswa WHERE id_siswa = ? AND id_mapel = ? AND id_kelas = ? AND tahun = ? AND semester = ?',
      [idSiswa, idMapel, idKelas, tahun, semester]
    );

    if (diikuti) {
      if (existing.length > 0) {
        await pool.query('UPDATE mapel_siswa SET aktif = 1 WHERE id_mapel_siswa = ?', [existing[0].id_mapel_siswa]);
      } else {
        await pool.query(
          `INSERT INTO mapel_siswa (tahun, semester, id_tingkat, id_kelas, id_mapel, id_siswa, aktif)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [tahun, semester, idTingkat, idKelas, idMapel, idSiswa]
        );
      }
    } else {
      if (existing.length > 0) {
        await pool.query('DELETE FROM mapel_siswa WHERE id_mapel_siswa = ?', [existing[0].id_mapel_siswa]);
      }
    }

    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function toggleMapelSiswaBatch(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const idKelas = parseInt(formData.get('id_kelas') as string);
  const idMapel = parseInt(formData.get('id_mapel') as string);
  const entries: { id_siswa: number; diikuti: boolean }[] = JSON.parse(formData.get('entries') as string);

  const sekolah = await getSekolahAktif();
  const { tahun, semester } = { tahun: sekolah?.tahun || 1, semester: sekolah?.semester || 1 };

  const [kelasRows]: any = await pool.query('SELECT id_tingkat FROM kelas WHERE id_kelas = ?', [idKelas]);
  const idTingkat = kelasRows[0]?.id_tingkat;

  try {
    for (const entry of entries) {
      const [existing]: any = await pool.query(
        'SELECT id_mapel_siswa FROM mapel_siswa WHERE id_siswa = ? AND id_mapel = ? AND id_kelas = ? AND tahun = ? AND semester = ?',
        [entry.id_siswa, idMapel, idKelas, tahun, semester]
      );
      if (entry.diikuti) {
        if (existing.length > 0) {
          await pool.query('UPDATE mapel_siswa SET aktif = 1 WHERE id_mapel_siswa = ?', [existing[0].id_mapel_siswa]);
        } else {
          await pool.query(
            `INSERT INTO mapel_siswa (tahun, semester, id_tingkat, id_kelas, id_mapel, id_siswa, aktif)
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [tahun, semester, idTingkat, idKelas, idMapel, entry.id_siswa]
          );
        }
      } else {
        if (existing.length > 0) {
          await pool.query('DELETE FROM mapel_siswa WHERE id_mapel_siswa = ?', [existing[0].id_mapel_siswa]);
        }
      }
    }
    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function deleteMapelSiswa(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('DELETE FROM mapel_siswa WHERE id_mapel_siswa = ?', [id]);
    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}
