'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateMapelKelas(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_mapel_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idMapel = formData.get('id_mapel') as string;
  const idUser = formData.get('id_user') as string;

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  try {
    if (id) {
      await pool.query(
        `UPDATE mapel_kelas SET id_kelas = ?, id_mapel = ?, id_user = ? WHERE id_mapel_kelas = ?`,
        [idKelas, idMapel, idUser || null, id]
      );
    } else {
      await pool.query(
        `INSERT INTO mapel_kelas (tahun, semester, id_kelas, id_mapel, id_user)
         VALUES (?, ?, ?, ?, ?)`,
        [tahun, semester, idKelas, idMapel, idUser || null]
      );
    }

    revalidatePath('/tu/mapel-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteMapelKelas(id: number) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM mapel_kelas WHERE id_mapel_kelas = ?', [id]);
    revalidatePath('/tu/mapel-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}

export async function copyMapelKelasFromPreviousYear() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
  const semester = sekolah?.semester || 1;

  // Cari tahun pelajaran sebelumnya
  const [prevTahunRows]: any = await pool.query(
    'SELECT id_tahun_pelajaran FROM tahun_pelajaran WHERE id_tahun_pelajaran < ? ORDER BY id_tahun_pelajaran DESC LIMIT 1',
    [sekolah?.tahun || 0]
  );
  if (prevTahunRows.length === 0) {
    return { success: false, error: 'Tahun pelajaran sebelumnya tidak ditemukan.' } as const;
  }
  const tahunLalu = prevTahunRows[0].id_tahun_pelajaran;
  const tahunBaru = sekolah?.tahun;

  try {
    // Ambil data mapel_kelas dari tahun lalu
    const [rows]: any = await pool.query(`
      SELECT mk.id_kelas, mk.id_mapel, mk.id_user, k.nama_kelas, m.nama_mapel,
        COALESCE(u.nama, '-') AS nama_guru
      FROM mapel_kelas mk
      JOIN kelas k ON mk.id_kelas = k.id_kelas
      JOIN mapel m ON mk.id_mapel = m.id_mapel
      LEFT JOIN users u ON mk.id_user = u.id_user
      WHERE mk.tahun = ? AND mk.semester = ?
      ORDER BY k.nama_kelas, m.nama_mapel
    `, [tahunLalu, semester]);

    if (rows.length === 0) {
      return { success: false, error: `Tidak ada data mapel kelas di tahun ${tahunLalu} semester ${semester}.` } as const;
    }

    // Group by kelas untuk laporan hasil
    const kelasMap = new Map<number, { nama_kelas: string; total: number; disalin: number; diSkip: number }>();

    let totalDisalin = 0;
    let totalSkip = 0;

    for (const row of rows) {
      const idKelas = row.id_kelas;

      // Cek apakah sudah ada di tahun baru
      const [existing]: any = await pool.query(
        'SELECT id_mapel_kelas FROM mapel_kelas WHERE tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? LIMIT 1',
        [tahunBaru, semester, idKelas, row.id_mapel]
      );

      if (!kelasMap.has(idKelas)) {
        kelasMap.set(idKelas, { nama_kelas: row.nama_kelas, total: 0, disalin: 0, diSkip: 0 });
      }

      const entry = kelasMap.get(idKelas)!;
      entry.total++;

      if (existing.length > 0) {
        entry.diSkip++;
        totalSkip++;
      } else {
        await pool.query(
          'INSERT INTO mapel_kelas (tahun, semester, id_kelas, id_mapel, id_user) VALUES (?, ?, ?, ?, ?)',
          [tahunBaru, semester, idKelas, row.id_mapel, row.id_user]
        );
        entry.disalin++;
        totalDisalin++;
      }
    }

    // Format hasil
    const hasil = Array.from(kelasMap.values()).map((h) => ({
      kelas: h.nama_kelas,
      mapel: h.total,
      disalin: h.disalin,
      skip: h.diSkip,
      status: `${h.disalin} mapel disalin` + (h.diSkip > 0 ? `, ${h.diSkip} sudah ada` : ''),
    }));

    revalidatePath('/tu/mapel-kelas');
    return { success: true, totalDisalin, totalSkip, hasil } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyalin mapel kelas' } as const;
  }
}
