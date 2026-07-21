'use server';

import { revalidatePath } from 'next/cache';
import { requireGuru } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import type { RowDataPacket } from 'mysql2';

interface SaveCatatanWaliInput {
  idKelas: number;
  idSiswa: number;
  catatan: string;
}

export async function saveCatatanWali(input: SaveCatatanWaliInput) {
  const authResult = await requireGuru();
  if (authResult.error || !authResult.user?.id_user) {
    return { success: false, error: authResult.error || 'Unauthorized' } as const;
  }

  const idKelas = Number(input?.idKelas);
  const idSiswa = Number(input?.idSiswa);
  const catatan = typeof input?.catatan === 'string' ? input.catatan.trim() : '';

  if (!Number.isInteger(idKelas) || idKelas <= 0 || !Number.isInteger(idSiswa) || idSiswa <= 0) {
    return { success: false, error: 'Data siswa tidak valid' } as const;
  }
  if (catatan.length > 500) {
    return { success: false, error: 'Catatan maksimal 500 karakter' } as const;
  }

  try {
    const sekolah = await getSekolahWithFilter();
    const [allowedRows] = await pool.query<RowDataPacket[]>(
      `SELECT 1
       FROM kelas_wali kw
       JOIN siswa_kelas sk
         ON sk.id_kelas = kw.id_kelas
        AND sk.tahun = kw.tahun
        AND sk.semester = kw.semester
        AND sk.id_siswa = ?
        AND sk.deleted_at IS NULL
       JOIN siswa s ON s.id_siswa = sk.id_siswa AND s.deleted_at IS NULL AND s.aktif = 1
       WHERE kw.id_user = ? AND kw.id_kelas = ?
         AND kw.tahun = ? AND kw.semester = ? AND kw.deleted_at IS NULL
       LIMIT 1`,
      [idSiswa, authResult.user.id_user, idKelas, sekolah.tahun, sekolah.semester]
    );

    if (allowedRows.length === 0) {
      return { success: false, error: 'Anda tidak berhak mengubah catatan siswa ini' } as const;
    }

    await pool.query(
      `INSERT INTO catatan_wali
         (tahun, semester, id_kelas, id_siswa, catatan, deleted_at)
       VALUES (?, ?, ?, ?, ?, NULL)
       ON DUPLICATE KEY UPDATE catatan = VALUES(catatan), deleted_at = NULL`,
      [sekolah.tahun, sekolah.semester, idKelas, idSiswa, catatan]
    );

    revalidatePath('/guru/catatan-wali');
    revalidatePath('/guru/catatan-rapor');
    return { success: true, catatan } as const;
  } catch (error) {
    console.error('Save catatan wali error:', error);
    return { success: false, error: 'Gagal menyimpan catatan wali' } as const;
  }
}
