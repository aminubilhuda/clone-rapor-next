'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

export async function getKodeNext(idMapel: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) return { success: false, error: 'Unauthorized' } as const;

  try {
    const [mRows]: any = await pool.query(
      'SELECT s_mapel FROM mapel WHERE id_mapel = ?', [idMapel]
    );
    const singkatan = (mRows[0]?.s_mapel || 'XX').substring(0, 4).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6);

    const sekolah = await getSekolahWithFilter();
    const [rows]: any = await pool.query(
      'SELECT COUNT(*) AS cnt FROM tujuan_pembelajaran WHERE tahun = ? AND semester = ? AND id_mapel = ? AND id_user = ?',
      [sekolah.tahun, sekolah.semester, idMapel, session.user.id_user]
    );
    const count = rows[0]?.cnt || 0;
    const num = Math.floor(count / 10) + 1;
    const dec = (count % 10) + 1;
    const display = `${num}.${dec}`;

    return { success: true, kode: `${singkatan}-${random}-${display}` } as const;
  } catch (e: any) {
    return { success: false, error: e.message } as const;
  }
}

export async function addTujuanMulti(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idMapel = Number(formData.get('id_mapel'));
  const kelasIds: number[] = JSON.parse(formData.get('kelas_ids') as string);
  const kode = (formData.get('kode') as string)?.trim();
  const tujuan = (formData.get('tujuan') as string)?.trim();
  const kktp = Number(formData.get('kktp')) || 70;

  if (!tujuan) return { success: false, error: 'Tujuan pembelajaran wajib diisi' } as const;
  if (!kelasIds.length) return { success: false, error: 'Pilih minimal satu kelas' } as const;
  if (!kode) return { success: false, error: 'Kode TP wajib diisi' } as const;

  try {
    const sekolah = await getSekolahWithFilter();

    // Batch: ambil semua id_tingkat sekaligus
    const [kelasRows]: any = await pool.query(
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

      await pool.query(
        `INSERT INTO tujuan_pembelajaran
         (tahun, semester, id_tingkat, id_kelas, id_mapel, id_user, urut, tujuan, kktp, middle_formatif, middle_ph, formatif_as)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
        [sekolah.tahun, sekolah.semester, idTingkat, idKelas, idMapel, session.user.id_user, kode, tujuan, kktp]
      );
    }

    revalidatePath('/guru/tujuan-pembelajaran');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menambah TP' } as const;
  }
}

export async function updateTujuanMulti(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const kode = (formData.get('kode') as string)?.trim();
  const idMapel = Number(formData.get('id_mapel'));
  const tujuan = (formData.get('tujuan') as string)?.trim();
  const kktp = Number(formData.get('kktp')) || 70;

  if (!tujuan) return { success: false, error: 'Tujuan pembelajaran wajib diisi' } as const;

  try {
    const sekolah = await getSekolahWithFilter();

    await pool.query(
      `UPDATE tujuan_pembelajaran
       SET tujuan = ?, kktp = ?
       WHERE tahun = ? AND semester = ? AND id_mapel = ? AND id_user = ? AND urut = ?`,
      [tujuan, kktp, sekolah.tahun, sekolah.semester, idMapel, session.user.id_user, kode]
    );

    revalidatePath('/guru/tujuan-pembelajaran');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal mengupdate TP' } as const;
  }
}

export async function updateTujuanSingle(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idTujuan = Number(formData.get('id_tujuan'));
  const tujuan = (formData.get('tujuan') as string)?.trim();

  if (!tujuan) return { success: false, error: 'Tujuan pembelajaran wajib diisi' } as const;

  try {
    await pool.query(
      `UPDATE tujuan_pembelajaran
       SET tujuan = ?
       WHERE id_tujuan = ?`,
      [tujuan, idTujuan]
    );
    revalidatePath('/guru/tujuan-pembelajaran');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal mengupdate TP' } as const;
  }
}

export async function deleteTujuanByKode(kode: string, idMapel: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    const sekolah = await getSekolahWithFilter();
    await pool.query(
      `DELETE FROM tujuan_pembelajaran WHERE tahun = ? AND semester = ? AND id_mapel = ? AND id_user = ? AND urut = ?`,
      [sekolah.tahun, sekolah.semester, idMapel, session.user.id_user, kode]
    );
    revalidatePath('/guru/tujuan-pembelajaran');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus TP' } as const;
  }
}

export async function getTpFromPreviousYear(idMapel: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) return { success: false, error: 'Unauthorized' } as const;

  try {
    const sekolah = await getSekolahWithFilter();

    let prevTahun = sekolah.tahun - 1;
    let prevSemester = sekolah.semester === 1 ? 2 : 1;
    if (sekolah.semester === 1) prevTahun = sekolah.tahun - 1;

    const [rows]: any = await pool.query(
      `SELECT DISTINCT tp.urut AS kode, tp.tujuan, tp.kktp,
        GROUP_CONCAT(DISTINCT k.nama_kelas ORDER BY k.nama_kelas SEPARATOR ', ') AS kelas_list
       FROM tujuan_pembelajaran tp
       JOIN kelas k ON tp.id_kelas = k.id_kelas
       WHERE tp.tahun = ? AND tp.semester = ? AND tp.id_mapel = ? AND tp.id_user = ? AND tp.urut != ''
       GROUP BY tp.urut, tp.tujuan, tp.kktp
       ORDER BY tp.urut ASC`,
      [prevTahun, prevSemester, idMapel, session.user.id_user]
    );

    return { success: true, tp: rows, prevTahun, prevSemester } as const;
  } catch (e: any) {
    return { success: false, error: e.message } as const;
  }
}

export async function copyTujuan(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idMapel = Number(formData.get('id_mapel'));
  const kodes: string[] = JSON.parse(formData.get('kodes') as string);
  const kelasIds: number[] = JSON.parse(formData.get('kelas_ids') as string);

  if (!kodes.length) return { success: false, error: 'Pilih minimal satu TP' } as const;
  if (!kelasIds.length) return { success: false, error: 'Pilih minimal satu kelas' } as const;

  try {
    const sekolah = await getSekolahWithFilter();
    let prevTahun = sekolah.tahun - 1;
    let prevSemester = sekolah.semester === 1 ? 2 : 1;
    if (sekolah.semester === 1) prevTahun = sekolah.tahun - 1;

    // Batch: ambil sumber TP untuk semua kode sekaligus
    const [srcRows]: any = await pool.query(
      `SELECT * FROM tujuan_pembelajaran
       WHERE tahun = ? AND semester = ? AND id_mapel = ? AND urut IN (?) AND id_user = ?`,
      [prevTahun, prevSemester, idMapel, kodes, session.user.id_user]
    );
    if (srcRows.length === 0) return { success: false, error: 'TP sumber tidak ditemukan' } as const;

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

    for (const kode of kodes) {
      const src = srcByKode.get(kode);
      if (!src) continue;

      for (const idKelas of kelasIds) {
        const idTingkat = tingkatByKelas.get(idKelas);
        if (!idTingkat) continue;

        await pool.query(
          `INSERT INTO tujuan_pembelajaran
           (tahun, semester, id_tingkat, id_kelas, id_mapel, id_user, urut, tujuan, kktp, middle_formatif, middle_ph, formatif_as)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
          [sekolah.tahun, sekolah.semester, idTingkat, idKelas, idMapel, session.user.id_user, kode, src.tujuan, src.kktp]
        );
      }
    }

    revalidatePath('/guru/tujuan-pembelajaran');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal copy TP' } as const;
  }
}
