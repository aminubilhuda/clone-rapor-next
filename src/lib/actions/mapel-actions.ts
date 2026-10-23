'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool, withTransaction } from '@/lib/db';
import { SEKOLAH_ID } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function updateMapel(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_mapel') as string;
  const namaMapel = formData.get('nama_mapel') as string;
  const sMapel = formData.get('s_mapel') as string;
  const idKelompok = Number(formData.get('id_kelompok'));
  const urut = formData.get('urut') as string;
  const parentIdRaw = formData.get('parent_id') as string;
  const parentId = parentIdRaw ? Number(parentIdRaw) : null;

  if (!namaMapel?.trim()) {
    return { success: false, error: 'Nama mata pelajaran wajib diisi' } as const;
  }
  if (!Number.isInteger(idKelompok) || idKelompok <= 0) {
    return { success: false, error: 'Kelompok mapel tidak valid' } as const;
  }
  if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0)) {
    return { success: false, error: 'Induk mapel tidak valid' } as const;
  }

  try {
    await withTransaction(async (conn) => {
      if (parentId !== null && Number(id) === parentId) {
        throw new Error('Mapel tidak boleh menjadi induk dirinya sendiri');
      }

      const [childrenRows]: any = await conn.query(
        'SELECT COUNT(*) AS jumlah FROM mapel WHERE parent_id = ?',
        [id || 0]
      );
      const jumlahAnak = Number(childrenRows[0]?.jumlah || 0);

      let parentRow: any = null;
      if (parentId !== null) {
        const [rows]: any = await conn.query(
          'SELECT id_mapel, parent_id, id_kelompok FROM mapel WHERE id_mapel = ?',
          [parentId]
        );
        parentRow = rows[0];
        if (!parentRow) throw new Error('Induk mapel tidak ditemukan');
        if (parentRow.parent_id !== null) {
          throw new Error('Sub-mapel tidak boleh memiliki sub-mapel lagi');
        }
        if (Number(parentRow.id_kelompok) !== idKelompok) {
          throw new Error('Kelompok sub-mapel harus sama dengan kelompok induk');
        }
        if (jumlahAnak > 0) {
          throw new Error('Mapel yang sudah punya sub-mapel tidak bisa dijadikan sub-mapel');
        }
      }

      if (id) {
        if (jumlahAnak > 0) {
          const [rows]: any = await conn.query(
            'SELECT id_kelompok FROM mapel WHERE id_mapel = ?',
            [id]
          );
          if (rows[0] && Number(rows[0].id_kelompok) !== idKelompok) {
            throw new Error('Kelompok induk tidak bisa diubah selama masih punya sub-mapel');
          }
        }
        await conn.query(
          `UPDATE mapel
           SET nama_mapel = ?, s_mapel = ?, id_kelompok = ?, urut = ?, parent_id = ?
           WHERE id_mapel = ?`,
          [namaMapel, sMapel, idKelompok, urut, parentId, id]
        );
      } else {
        await conn.query(
          `INSERT INTO mapel (nama_mapel, s_mapel, id_kelompok, urut, id_sekolah, parent_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [namaMapel, sMapel, idKelompok, urut, SEKOLAH_ID, parentId]
        );
      }
    });

    revalidatePath('/tu/mapel');
    revalidatePath('/tu/mapel-kelas');
    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menyimpan data',
    } as const;
  }
}

export async function deleteMapel(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    const [rows]: any = await pool.query(
      'SELECT COUNT(*) AS jumlah FROM mapel WHERE parent_id = ?',
      [id]
    );
    if (Number(rows[0]?.jumlah || 0) > 0) {
      return {
        success: false,
        error: 'Mapel induk tidak bisa dihapus selama masih punya sub-mapel',
      } as const;
    }

    await pool.query('DELETE FROM mapel WHERE id_mapel = ?', [id]);
    revalidatePath('/tu/mapel');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}

export async function updateUrutMapel(idMapel: number, urut: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('UPDATE mapel SET urut = ? WHERE id_mapel = ?', [urut, idMapel]);
    revalidatePath('/tu/mapel');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal mengupdate urutan' } as const;
  }
}
