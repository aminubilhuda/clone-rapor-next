'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool, withTransaction } from '@/lib/db';
import { getPeriodeAktif } from '@/lib/sekolah-helper';
import { isValidDateString } from '@/lib/validate';
import { revalidatePath } from 'next/cache';

export async function updatePrakerin(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_prakerin') as string;
  const mitra = formData.get('mitra') as string;
  const lokasi = formData.get('lokasi') as string;
  const tanggalMulai = formData.get('tanggal_mulai') as string;
  const tanggalAkhir = formData.get('tanggal_akhir') as string;
  const instruktur = formData.get('instruktur') as string;
  const idUser = formData.get('id_user') as string;

  const { tahun, semester } = await getPeriodeAktif();

  if (!mitra?.trim()) {
    return { success: false, error: 'Mitra wajib diisi' } as const;
  }
  if (tanggalMulai && !isValidDateString(tanggalMulai)) {
    return { success: false, error: 'Tanggal mulai tidak valid' } as const;
  }
  if (tanggalAkhir && !isValidDateString(tanggalAkhir)) {
    return { success: false, error: 'Tanggal akhir tidak valid' } as const;
  }

  try {
    if (id) {
      await pool.query(
        `UPDATE prakerin SET mitra = ?, lokasi = ?, tanggal_mulai = ?, tanggal_akhir = ?, instruktur = ?, id_user = ?
         WHERE id_prakerin = ?`,
        [mitra, lokasi, tanggalMulai || null, tanggalAkhir || null, instruktur, idUser, id]
      );
    } else {
      await pool.query(
        `INSERT INTO prakerin (tahun, semester, mitra, lokasi, tanggal_mulai, tanggal_akhir, instruktur, id_user)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tahun, semester, mitra, lokasi, tanggalMulai || null, tanggalAkhir || null, instruktur, idUser]
      );
    }

    revalidatePath('/tu/prakerin');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function deletePrakerin(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('DELETE FROM prakerin WHERE id_prakerin = ?', [id]);
    revalidatePath('/tu/prakerin');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}

export async function importPrakerin(rows: {
  mitra: string;
  lokasi?: string;
  tanggal_mulai?: string | null;
  tanggal_akhir?: string | null;
  instruktur?: string;
}[]) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const { tahun, semester } = await getPeriodeAktif();

  const invalidRows = rows
    .map((r, i) => (!r.mitra ? i + 1 : null))
    .filter((v): v is number => v !== null);
  if (invalidRows.length > 0) {
    return {
      success: false,
      error: `Mitra wajib diisi pada baris: ${invalidRows.join(', ')}`,
      count: 0,
      errors: invalidRows.map((n) => `Baris ${n}: mitra wajib diisi`),
    };
  }

  // Batch: ambil semua mitra yang sudah ada untuk periode ini
  const [existingRows]: any = await pool.query(
    'SELECT mitra, id_prakerin FROM prakerin WHERE tahun = ? AND semester = ?',
    [tahun, semester]
  );
  const existingMitra = new Map<string, number>();
  for (const row of existingRows) {
    existingMitra.set(row.mitra, row.id_prakerin);
  }

  try {
    await withTransaction(async (conn) => {
      for (const r of rows) {
        const existingId = existingMitra.get(r.mitra);
        if (existingId) {
          await conn.query(
            `UPDATE prakerin SET lokasi = ?, tanggal_mulai = ?, tanggal_akhir = ?, instruktur = ?
             WHERE id_prakerin = ?`,
            [r.lokasi || null, r.tanggal_mulai || null, r.tanggal_akhir || null, r.instruktur || null, existingId]
          );
        } else {
          await conn.query(
            `INSERT INTO prakerin (tahun, semester, mitra, lokasi, tanggal_mulai, tanggal_akhir, instruktur)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [tahun, semester, r.mitra, r.lokasi || null, r.tanggal_mulai || null, r.tanggal_akhir || null, r.instruktur || null]
          );
        }
      }
    });
  } catch (e) {
    console.error('importPrakerin error:', e);
    return { success: false, error: 'Gagal import data, tidak ada baris yang disimpan', count: 0, errors: [] };
  }

  revalidatePath('/tu/prakerin');
  return { success: true, count: rows.length, errors: [] };
}
