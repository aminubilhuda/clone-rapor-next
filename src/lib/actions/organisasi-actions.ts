'use server';

import { requireTuAdmin, requireTuAdminOrGuru } from '@/lib/actions/auth-guard';
import { pool, withTransaction } from '@/lib/db';
import { getPeriodeAktif } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

async function canManageOrganisasi(idOrganisasi: number) {
  const authResult = await requireTuAdminOrGuru();
  if (authResult.error || !authResult.user) {
    return { ok: false, error: authResult.error || 'Unauthorized' } as const;
  }

  const user = authResult.user;
  if (user.jabatan === 1 || user.jabatan === 2) return { ok: true } as const;
  if (user.jabatan !== 3 || !user.id_user) {
    return { ok: false, error: 'Forbidden' } as const;
  }

  const { tahun, semester } = await getPeriodeAktif();
  const [rows]: any = await pool.query(
    `SELECT 1 FROM pembina_organisasi
     WHERE id_organisasi = ? AND id_user = ? AND tahun = ? AND semester = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [idOrganisasi, user.id_user, tahun, semester]
  );

  if (rows.length === 0) {
    return { ok: false, error: 'Anda bukan pembina organisasi ini' } as const;
  }
  return { ok: true } as const;
}

export async function updateOrganisasi(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_organisasi') as string;
  const nama = formData.get('nama_organisasi') as string;
  const kode = formData.get('kode') as string;

  if (!nama?.trim()) {
    return { success: false, error: 'Nama organisasi wajib diisi' } as const;
  }

  try {
    if (id) {
      await pool.query('UPDATE organisasi SET nama_organisasi = ?, kode = ? WHERE id_organisasi = ?', [nama, kode, id]);
    } else {
      await pool.query('INSERT INTO organisasi (nama_organisasi, kode) VALUES (?, ?)', [nama, kode]);
    }

    revalidatePath('/tu/organisasi');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function deleteOrganisasi(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('DELETE FROM organisasi WHERE id_organisasi = ?', [id]);
    revalidatePath('/tu/organisasi');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}

export async function updatePembinaOrganisasi(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const idOrganisasi = formData.get('id_organisasi') as string;
  const idUser = formData.get('id_user') as string;
  const { tahun, semester } = await getPeriodeAktif();

  try {
    await withTransaction(async (conn) => {
      const [existing]: any = await conn.query(
        'SELECT id_pembina_organisasi FROM pembina_organisasi WHERE id_organisasi = ? AND tahun = ? AND semester = ? FOR UPDATE',
        [idOrganisasi, tahun, semester]
      );

      if (idUser) {
        if (existing.length > 0) {
          await conn.query('UPDATE pembina_organisasi SET id_user = ? WHERE id_pembina_organisasi = ?', [idUser, existing[0].id_pembina_organisasi]);
        } else {
          await conn.query(
            'INSERT INTO pembina_organisasi (tahun, semester, id_organisasi, id_user) VALUES (?, ?, ?, ?)',
            [tahun, semester, idOrganisasi, idUser]
          );
        }
      } else {
        if (existing.length > 0) {
          await conn.query('DELETE FROM pembina_organisasi WHERE id_pembina_organisasi = ?', [existing[0].id_pembina_organisasi]);
        }
      }
    });

    revalidatePath('/tu/organisasi');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function addSiswaOrganisasi(formData: FormData) {
  const idOrganisasi = formData.get('id_organisasi') as string;
  const idSiswa = formData.get('id_siswa') as string;
  const { tahun, semester } = await getPeriodeAktif();

  const guard = await canManageOrganisasi(Number(idOrganisasi));
  if (!guard.ok) return { success: false, error: guard.error || 'Forbidden' } as const;

  try {
    const inserted = await withTransaction(async (conn) => {
      const [existing]: any = await conn.query(
        'SELECT id_siswa_organisasi FROM siswa_organisasi WHERE id_organisasi = ? AND id_siswa = ? AND tahun = ? AND semester = ? FOR UPDATE',
        [idOrganisasi, idSiswa, tahun, semester]
      );
      if (existing.length > 0) return false;

      await conn.query(
        'INSERT INTO siswa_organisasi (tahun, semester, id_organisasi, id_siswa) VALUES (?, ?, ?, ?)',
        [tahun, semester, idOrganisasi, idSiswa]
      );
      return true;
    });

    if (!inserted) {
      return { success: false, error: 'Siswa sudah terdaftar di organisasi ini' } as const;
    }

    revalidatePath('/tu/organisasi');
    revalidatePath('/guru/organisasi');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menambah anggota' } as const;
  }
}

export async function removeSiswaOrganisasi(id: number) {
  const [[row]]: any = await pool.query(
    'SELECT id_organisasi FROM siswa_organisasi WHERE id_siswa_organisasi = ? AND deleted_at IS NULL LIMIT 1',
    [id]
  );
  if (!row) return { success: false, error: 'Anggota tidak ditemukan' } as const;

  const guard = await canManageOrganisasi(Number(row.id_organisasi));
  if (!guard.ok) return { success: false, error: guard.error || 'Forbidden' } as const;

  try {
    await pool.query('DELETE FROM siswa_organisasi WHERE id_siswa_organisasi = ?', [id]);
    revalidatePath('/tu/organisasi');
    revalidatePath('/guru/organisasi');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus anggota' } as const;
  }
}
