'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updatePrakerin(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_prakerin') as string;
  const mitra = formData.get('mitra') as string;
  const lokasi = formData.get('lokasi') as string;
  const tanggalMulai = formData.get('tanggal_mulai') as string;
  const tanggalAkhir = formData.get('tanggal_akhir') as string;
  const instruktur = formData.get('instruktur') as string;
  const idUser = formData.get('id_user') as string;

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
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
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deletePrakerin(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM prakerin WHERE id_prakerin = ?', [id]);
    revalidatePath('/tu/prakerin');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}

export async function importPrakerin(rows: {
  mitra: string;
  lokasi?: string;
  tanggal_mulai?: string | null;
  tanggal_akhir?: string | null;
  instruktur?: string;
}[]) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  let count = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.mitra) { errors.push(`Baris ${i + 1}: mitra wajib diisi`); continue; }
    try {
      const [existing]: any = await pool.query(
        'SELECT id_prakerin FROM prakerin WHERE mitra = ? AND tahun = ? AND semester = ?',
        [r.mitra, tahun, semester]
      );
      if (existing.length > 0) {
        await pool.query(
          `UPDATE prakerin SET lokasi = ?, tanggal_mulai = ?, tanggal_akhir = ?, instruktur = ?
           WHERE id_prakerin = ?`,
          [r.lokasi || null, r.tanggal_mulai || null, r.tanggal_akhir || null, r.instruktur || null, existing[0].id_prakerin]
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
      errors.push(`Baris ${i + 1} (${r.mitra}): ${e.message}`);
    }
  }

  revalidatePath('/tu/prakerin');
  return { success: errors.length === 0, count, errors } as const;
}
