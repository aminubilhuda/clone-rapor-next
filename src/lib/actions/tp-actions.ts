'use server';

import { requireGuru } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { parseJsonArray } from '@/lib/validate';
import { revalidatePath } from 'next/cache';

function formatDisplayOrder(index: number) {
  const zeroBased = index - 1;
  return `${Math.floor(zeroBased / 10) + 1}.${(zeroBased % 10) + 1}`;
}

function getNextDisplayIndex(rows: any[]) {
  const usedOrders = new Set<string>();
  let highestIndex = 0;

  for (const row of rows) {
    const displayOrder = String(row.urut || '').split('-').pop() || '';
    usedOrders.add(displayOrder);

    const match = /^(\d+)\.(\d+)$/.exec(displayOrder);
    if (match) {
      const parsedIndex = (Number(match[1]) - 1) * 10 + Number(match[2]);
      highestIndex = Math.max(highestIndex, parsedIndex);
    }
  }

  highestIndex = Math.max(highestIndex, usedOrders.size);

  let nextIndex = highestIndex + 1;
  while (usedOrders.has(formatDisplayOrder(nextIndex))) nextIndex += 1;
  return nextIndex;
}

function createKode(singkatan: string, displayIndex: number) {
  const random = Math.random().toString(36).substring(2, 6);
  return `${singkatan}-${random}-${formatDisplayOrder(displayIndex)}`;
}

export async function getKodeNext(idMapel: number) {
  const authResult = await requireGuru();
  if (authResult.error || !authResult.user) return { success: false, error: authResult.error || 'Unauthorized' } as const;
  const { user } = authResult;

  try {
    const [mRows]: any = await pool.query(
      'SELECT s_mapel FROM mapel WHERE id_mapel = ?', [idMapel]
    );
    const singkatan = (mRows[0]?.s_mapel || 'XX').substring(0, 4).toUpperCase();

    const sekolah = await getSekolahWithFilter();
    const [rows]: any = await pool.query(
      'SELECT DISTINCT urut FROM tujuan_pembelajaran WHERE tahun = ? AND semester = ? AND id_mapel = ? AND id_user = ?',
      [sekolah.tahun, sekolah.semester, idMapel, user.id_user]
    );
    const nextIndex = getNextDisplayIndex(rows);

    return { success: true, kode: createKode(singkatan, nextIndex) } as const;
  } catch {
    return { success: false, error: 'Gagal mengambil data' } as const;
  }
}

export async function addTujuanMulti(formData: FormData) {
  const authResult = await requireGuru();
  if (authResult.error || !authResult.user) {
    return { success: false, error: authResult.error || 'Unauthorized' } as const;
  }
  const { user } = authResult;

  const idMapel = Number(formData.get('id_mapel'));
  const parsedKelasIds = parseJsonArray<number>(formData.get('kelas_ids') as string, 'kelas');
  if (!parsedKelasIds.ok) return { success: false, error: parsedKelasIds.error } as const;
  const kelasIds = parsedKelasIds.value;
  const kode = (formData.get('kode') as string)?.trim();
  const tujuan = (formData.get('tujuan') as string)?.trim();
  const kktp = Number(formData.get('kktp')) || 80;

  if (!tujuan) return { success: false, error: 'Tujuan pembelajaran wajib diisi' } as const;
  if (!kelasIds.length) return { success: false, error: 'Pilih minimal satu kelas' } as const;
  if (!kode) return { success: false, error: 'Kode TP wajib diisi' } as const;

  try {
    const sekolah = await getSekolahWithFilter();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Batch: ambil semua id_tingkat sekaligus
      const [kelasRows]: any = await conn.query(
        'SELECT id_kelas, id_tingkat FROM kelas WHERE id_kelas IN (?)',
        [kelasIds]
      );
      const tingkatByKelas = new Map<number, number>();
      for (const row of kelasRows) {
        tingkatByKelas.set(row.id_kelas, row.id_tingkat);
      }

      // kode disimpan di kolom urut (group key antar kelas)
      for (const idKelas of kelasIds) {
        const idTingkat = tingkatByKelas.get(idKelas);
        if (!idTingkat) continue;

        await conn.query(
          `INSERT INTO tujuan_pembelajaran
           (tahun, semester, id_tingkat, id_kelas, id_mapel, id_user, urut, tujuan, kktp, middle_formatif, middle_ph, formatif_as)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
          [sekolah.tahun, sekolah.semester, idTingkat, idKelas, idMapel, user.id_user, kode, tujuan, kktp]
        );
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    revalidatePath('/guru/tujuan-pembelajaran');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menambah TP' } as const;
  }
}

export async function updateTujuanMulti(formData: FormData) {
  const authResult = await requireGuru();
  if (authResult.error || !authResult.user) {
    return { success: false, error: authResult.error || 'Unauthorized' } as const;
  }
  const { user } = authResult;

  const kode = (formData.get('kode') as string)?.trim();
  const idMapel = Number(formData.get('id_mapel'));
  const tujuan = (formData.get('tujuan') as string)?.trim();
  const kktp = Number(formData.get('kktp')) || 80;

  if (!tujuan) return { success: false, error: 'Tujuan pembelajaran wajib diisi' } as const;

  try {
    const sekolah = await getSekolahWithFilter();

    await pool.query(
      `UPDATE tujuan_pembelajaran
       SET tujuan = ?, kktp = ?
       WHERE tahun = ? AND semester = ? AND id_mapel = ? AND id_user = ? AND urut = ?`,
      [tujuan, kktp, sekolah.tahun, sekolah.semester, idMapel, user.id_user, kode]
    );

    revalidatePath('/guru/tujuan-pembelajaran');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal mengupdate TP' } as const;
  }
}

export async function deleteTujuanByKode(kode: string, idMapel: number) {
  const authResult = await requireGuru();
  if (authResult.error || !authResult.user) {
    return { success: false, error: authResult.error || 'Unauthorized' } as const;
  }
  const { user } = authResult;

  try {
    const sekolah = await getSekolahWithFilter();
    await pool.query(
      `DELETE FROM tujuan_pembelajaran WHERE tahun = ? AND semester = ? AND id_mapel = ? AND id_user = ? AND urut = ?`,
      [sekolah.tahun, sekolah.semester, idMapel, user.id_user, kode]
    );
    revalidatePath('/guru/tujuan-pembelajaran');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus TP' } as const;
  }
}

export async function getTpFromPreviousYear(idMapel: number) {
  const authResult = await requireGuru();
  if (authResult.error || !authResult.user) return { success: false, error: authResult.error || 'Unauthorized' } as const;
  const { user } = authResult;

  try {
    const sekolah = await getSekolahWithFilter();

    const prevTahun = sekolah.tahun - 1;
    const prevSemester = sekolah.semester === 1 ? 2 : 1;

    const [rows]: any = await pool.query(
      `SELECT DISTINCT tp.urut AS kode, tp.tujuan, tp.kktp,
        GROUP_CONCAT(DISTINCT k.nama_kelas ORDER BY k.nama_kelas SEPARATOR ', ') AS kelas_list
       FROM tujuan_pembelajaran tp
       JOIN kelas k ON tp.id_kelas = k.id_kelas
       WHERE tp.tahun = ? AND tp.semester = ? AND tp.id_mapel = ? AND tp.id_user = ? AND tp.urut != ''
       GROUP BY tp.urut, tp.tujuan, tp.kktp
       ORDER BY tp.urut ASC`,
      [prevTahun, prevSemester, idMapel, user.id_user]
    );

    return { success: true, tp: rows, prevTahun, prevSemester } as const;
  } catch {
    return { success: false, error: 'Gagal mengambil data' } as const;
  }
}

export async function copyTujuan(formData: FormData) {
  const authResult = await requireGuru();
  if (authResult.error || !authResult.user) {
    return { success: false, error: authResult.error || 'Unauthorized' } as const;
  }
  const { user } = authResult;

  const idMapel = Number(formData.get('id_mapel'));
  const parsedKodes = parseJsonArray<string>(formData.get('kodes') as string, 'TP');
  if (!parsedKodes.ok) return { success: false, error: parsedKodes.error } as const;
  const parsedKelasIds = parseJsonArray<number>(formData.get('kelas_ids') as string, 'kelas');
  if (!parsedKelasIds.ok) return { success: false, error: parsedKelasIds.error } as const;
  const kodes = parsedKodes.value;
  const kelasIds = parsedKelasIds.value;

  if (!kodes.length) return { success: false, error: 'Pilih minimal satu TP' } as const;
  if (!kelasIds.length) return { success: false, error: 'Pilih minimal satu kelas' } as const;

  try {
    const sekolah = await getSekolahWithFilter();
    const prevTahun = sekolah.tahun - 1;
    const prevSemester = sekolah.semester === 1 ? 2 : 1;

    // Batch: ambil sumber TP untuk semua kode sekaligus
    const [srcRows]: any = await pool.query(
      `SELECT * FROM tujuan_pembelajaran
       WHERE tahun = ? AND semester = ? AND id_mapel = ? AND urut IN (?) AND id_user = ?`,
      [prevTahun, prevSemester, idMapel, kodes, user.id_user]
    );
    if (srcRows.length === 0) return { success: false, error: 'TP sumber tidak ditemukan' } as const;

    const [mapelRows]: any = await pool.query(
      'SELECT s_mapel FROM mapel WHERE id_mapel = ?',
      [idMapel]
    );
    const singkatan = (mapelRows[0]?.s_mapel || 'XX').substring(0, 4).toUpperCase();

    const srcByKode = new Map<string, any>();
    for (const row of srcRows) {
      if (!srcByKode.has(row.urut)) srcByKode.set(row.urut, row);
    }

    // Batch: ambil id_tingkat semua kelas sekaligus
    const [kelasRows]: any = await pool.query(
      'SELECT id_kelas, id_tingkat FROM kelas WHERE id_kelas IN (?)',
      [kelasIds]
    );
    const tingkatByKelas = new Map<number, number>();
    for (const row of kelasRows) {
      tingkatByKelas.set(row.id_kelas, row.id_tingkat);
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [currentRows]: any = await conn.query(
        `SELECT urut
         FROM tujuan_pembelajaran
         WHERE tahun = ? AND semester = ? AND id_mapel = ? AND id_user = ?
         FOR UPDATE`,
        [sekolah.tahun, sekolah.semester, idMapel, user.id_user]
      );
      let nextDisplayIndex = getNextDisplayIndex(currentRows);

      for (const kode of kodes) {
        const src = srcByKode.get(kode);
        if (!src) continue;
        const kodeBaru = createKode(singkatan, nextDisplayIndex);
        nextDisplayIndex += 1;

        for (const idKelas of kelasIds) {
          const idTingkat = tingkatByKelas.get(idKelas);
          if (!idTingkat) continue;

          await conn.query(
            `INSERT INTO tujuan_pembelajaran
             (tahun, semester, id_tingkat, id_kelas, id_mapel, id_user, urut, tujuan, kktp, middle_formatif, middle_ph, formatif_as)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
            [sekolah.tahun, sekolah.semester, idTingkat, idKelas, idMapel, user.id_user, kodeBaru, src.tujuan, src.kktp]
          );
        }
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    revalidatePath('/guru/tujuan-pembelajaran');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal copy TP' } as const;
  }
}
