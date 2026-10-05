'use server';

import { requireTuAdmin, requireTuAdminOrGuru } from '@/lib/actions/auth-guard';
import { pool, withTransaction } from '@/lib/db';
import { SEKOLAH_ID, JABATAN } from '@/lib/constants';
import { getPeriodeAktif } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

export async function updateEkstra(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_eskul') as string;
  const namaEskul = formData.get('nama_eskul') as string;
  const kode = formData.get('kode') as string;

  if (!namaEskul?.trim()) {
    return { success: false, error: 'Nama ekstrakurikuler wajib diisi' } as const;
  }

  try {
    if (id) {
      await pool.query('UPDATE eskul SET nama_eskul = ?, kode = ? WHERE id_eskul = ?', [namaEskul, kode, id]);
    } else {
      await pool.query('INSERT INTO eskul (nama_eskul, kode, id_sekolah) VALUES (?, ?, ?)', [namaEskul, kode, SEKOLAH_ID]);
    }

    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function deleteEkstra(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('DELETE FROM eskul WHERE id_eskul = ?', [id]);
    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}

export async function updatePembinaEkstra(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const idEskul = formData.get('id_eskul') as string;
  const idUser = formData.get('id_user') as string;
  const { tahun, semester } = await getPeriodeAktif();

  try {
    await withTransaction(async (conn) => {
      const [existing]: any = await conn.query(
        'SELECT id_pembina_eskul FROM pembina_eskul WHERE id_eskul = ? AND tahun = ? AND semester = ? FOR UPDATE',
        [idEskul, tahun, semester]
      );

      if (idUser) {
        if (existing.length > 0) {
          await conn.query('UPDATE pembina_eskul SET id_user = ? WHERE id_pembina_eskul = ?', [idUser, existing[0].id_pembina_eskul]);
        } else {
          await conn.query(
            'INSERT INTO pembina_eskul (tahun, semester, id_eskul, id_user) VALUES (?, ?, ?, ?)',
            [tahun, semester, idEskul, idUser]
          );
        }
      } else {
        if (existing.length > 0) {
          await conn.query('DELETE FROM pembina_eskul WHERE id_pembina_eskul = ?', [existing[0].id_pembina_eskul]);
        }
      }
    });

    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

async function isPembinaEskul(idUser: number, idEskul: number): Promise<boolean> {
  const [rows]: any = await pool.query(
    `SELECT 1 FROM pembina_eskul pe
     JOIN sekolah s ON s.id_sekolah = ?
     WHERE pe.id_eskul = ? AND pe.id_user = ?
       AND pe.tahun = s.tahun AND pe.semester = s.semester
       AND pe.deleted_at IS NULL
     LIMIT 1`,
    [SEKOLAH_ID, idEskul, idUser]
  );
  return rows.length > 0;
}

async function canManageEskul(
  user: { jabatan?: number; id_user?: number },
  idEskul: number
): Promise<boolean> {
  if (user.jabatan === JABATAN.SUPER_ADMIN || user.jabatan === JABATAN.TU_ADMIN) return true;
  if (user.jabatan !== JABATAN.GURU || !user.id_user) return false;
  return isPembinaEskul(user.id_user, idEskul);
}

export async function addSiswaEkstra(formData: FormData) {
  const authResult = await requireTuAdminOrGuru();
  if (authResult.error || !authResult.user) return { success: false, error: authResult.error } as const;

  const idEskul = formData.get('id_eskul') as string;
  const idSiswa = formData.get('id_siswa') as string;
  const predikat = formData.get('predikat') as string || '';
  const keterangan = formData.get('keterangan') as string || '';
  const { tahun, semester } = await getPeriodeAktif();

  if (!(await canManageEskul(authResult.user, Number(idEskul)))) {
    return { success: false, error: 'Anda bukan pembina ekstrakurikuler ini' } as const;
  }

  try {
    const inserted = await withTransaction(async (conn) => {
      const [existing]: any = await conn.query(
        'SELECT id_siswa_eskul FROM siswa_eskul WHERE id_eskul = ? AND id_siswa = ? AND tahun = ? AND semester = ? FOR UPDATE',
        [idEskul, idSiswa, tahun, semester]
      );
      if (existing.length > 0) return false;

      await conn.query(
        'INSERT INTO siswa_eskul (tahun, semester, id_eskul, id_siswa, predikat, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
        [tahun, semester, idEskul, idSiswa, predikat, keterangan]
      );
      return true;
    });

    if (!inserted) {
      return { success: false, error: 'Siswa sudah terdaftar di ekstrakurikuler ini' } as const;
    }

    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menambah anggota' } as const;
  }
}

export async function removeSiswaEkstra(idSiswaEkstra: number) {
  const authResult = await requireTuAdminOrGuru();
  if (authResult.error || !authResult.user) return { success: false, error: authResult.error } as const;

  try {
    const [rows]: any = await pool.query(
      'SELECT id_eskul FROM siswa_eskul WHERE id_siswa_eskul = ? LIMIT 1',
      [idSiswaEkstra]
    );
    if (rows.length === 0) {
      return { success: false, error: 'Data anggota tidak ditemukan' } as const;
    }
    if (!(await canManageEskul(authResult.user, Number(rows[0].id_eskul)))) {
      return { success: false, error: 'Anda bukan pembina ekstrakurikuler ini' } as const;
    }

    await pool.query('DELETE FROM siswa_eskul WHERE id_siswa_eskul = ?', [idSiswaEkstra]);
    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus anggota' } as const;
  }
}

export async function bulkUpdateSiswaEkstra(items: { id_siswa_eskul: number; predikat: string; keterangan: string }[]) {
  const authResult = await requireTuAdminOrGuru();
  if (authResult.error || !authResult.user) return { success: false, error: authResult.error } as const;

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: 'Tidak ada data yang disimpan' } as const;
  }

  try {
    const ids = items.map((item) => item.id_siswa_eskul);
    const [eskulRows]: any = await pool.query(
      'SELECT DISTINCT id_eskul FROM siswa_eskul WHERE id_siswa_eskul IN (?)',
      [ids]
    );

    for (const row of eskulRows) {
      if (!(await canManageEskul(authResult.user, Number(row.id_eskul)))) {
        return { success: false, error: 'Anda bukan pembina ekstrakurikuler ini' } as const;
      }
    }

    await withTransaction(async (conn) => {
      for (const item of items) {
        await conn.query(
          'UPDATE siswa_eskul SET predikat = ?, keterangan = ? WHERE id_siswa_eskul = ?',
          [item.predikat || '', item.keterangan || '', item.id_siswa_eskul]
        );
      }
    });

    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan nilai' } as const;
  }
}
