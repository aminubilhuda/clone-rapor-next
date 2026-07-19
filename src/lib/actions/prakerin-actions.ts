'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
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

  const sekolah = await getSekolahWithFilter();
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

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
  } catch (e: any) {
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
  } catch (e: any) {
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

  const sekolah = await getSekolahWithFilter();
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  let count = 0;
  const errors: string[] = [];

  // Batch: ambil semua mitra yang sudah ada untuk periode ini
  const [existingRows]: any = await pool.query(
    'SELECT mitra, id_prakerin FROM prakerin WHERE tahun = ? AND semester = ?',
    [tahun, semester]
  );
  const existingMitra = new Map<string, number>();
  for (const row of existingRows) {
    existingMitra.set(row.mitra, row.id_prakerin);
  }

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.mitra) { errors.push(`Baris ${i + 1}: mitra wajib diisi`); continue; }
    try {
      const existingId = existingMitra.get(r.mitra);
      if (existingId) {
        await pool.query(
          `UPDATE prakerin SET lokasi = ?, tanggal_mulai = ?, tanggal_akhir = ?, instruktur = ?
           WHERE id_prakerin = ?`,
          [r.lokasi || null, r.tanggal_mulai || null, r.tanggal_akhir || null, r.instruktur || null, existingId]
        );
      } else {
        await pool.query(
          `INSERT INTO prakerin (tahun, semester, mitra, lokasi, tanggal_mulai, tanggal_akhir, instruktur)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [tahun, semester, r.mitra, r.lokasi || null, r.tanggal_mulai || null, r.tanggal_akhir || null, r.instruktur || null]
        );
      }
      count++;
    } catch (e: any) {
      errors.push(`Baris ${i + 1} (${r.mitra}): Gagal menyimpan data`);
    }
  }

  revalidatePath('/tu/prakerin');
  return { success: errors.length === 0, count, errors } as const;
}
