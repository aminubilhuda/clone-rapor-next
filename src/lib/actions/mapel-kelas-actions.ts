'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

// Mapel agama: hanya enroll siswa dengan agama tertentu
const PA_ISLAM_ID = 1;
const PA_KRISTEN_ID = 2;

async function autoEnrollSiswa(
  tahun: number,
  semester: number,
  kelasDisalin: { id_kelas: number; id_mapel: number }[]
) {
  // Group mapel by kelas
  const mapelByKelas = new Map<number, number[]>();
  for (const item of kelasDisalin) {
    if (!mapelByKelas.has(item.id_kelas)) mapelByKelas.set(item.id_kelas, []);
    mapelByKelas.get(item.id_kelas)!.push(item.id_mapel);
  }

  // Get id_tingkat per kelas
  const idKelasList = [...mapelByKelas.keys()];
  if (idKelasList.length === 0) return 0;

  const [kelasRows]: any = await pool.query(
    'SELECT id_kelas, id_tingkat FROM kelas WHERE id_kelas IN (?)',
    [idKelasList]
  );
  const tingkatByKelas = new Map<number, number>();
  for (const k of kelasRows) {
    tingkatByKelas.set(k.id_kelas, k.id_tingkat);
  }

  let totalEnrolled = 0;

  // Batch: fetch all existing enrollments for all target classes
  const [existingRows]: any = await pool.query(
    'SELECT id_siswa, id_mapel FROM mapel_siswa WHERE tahun = ? AND semester = ? AND id_kelas IN (?) AND deleted_at IS NULL',
    [tahun, semester, idKelasList]
  );
  const existingSet = new Set(
    existingRows.map((e: any) => `${e.id_siswa}_${e.id_mapel}`)
  );

  const newInserts: any[][] = [];

  for (const [idKelas, mapelIds] of mapelByKelas) {
    const idTingkat = tingkatByKelas.get(idKelas);
    if (!idTingkat) continue;

    // Get all active students in this class with their agama
    const [siswaRows]: any = await pool.query(
      `SELECT sk.id_siswa, s.agama
       FROM siswa_kelas sk
       JOIN siswa s ON sk.id_siswa = s.id_siswa
       WHERE sk.id_kelas = ? AND sk.tahun = ? AND sk.semester = ?
         AND sk.status = 1 AND sk.deleted_at IS NULL AND s.deleted_at IS NULL AND s.aktif = 1`,
      [idKelas, tahun, semester]
    );

    if (siswaRows.length === 0) continue;

    for (const siswa of siswaRows) {
      for (const idMapel of mapelIds) {
        if (existingSet.has(`${siswa.id_siswa}_${idMapel}`)) continue;

        if (idMapel === PA_ISLAM_ID && siswa.agama !== 1) continue;
        if (idMapel === PA_KRISTEN_ID && siswa.agama !== 2 && siswa.agama !== 3) continue;

        newInserts.push([tahun, semester, idTingkat, idKelas, idMapel, siswa.id_siswa, 1]);
        totalEnrolled++;
      }
    }
  }

  if (newInserts.length > 0) {
    await pool.query(
      'INSERT INTO mapel_siswa (tahun, semester, id_tingkat, id_kelas, id_mapel, id_siswa, aktif) VALUES ?',
      [newInserts]
    );
  }

  return totalEnrolled;
}

export async function updateMapelKelas(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_mapel_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idMapel = formData.get('id_mapel') as string;
  const idUser = formData.get('id_user') as string;

  const sekolah = await getSekolahWithFilter();
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
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function deleteMapelKelas(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('DELETE FROM mapel_kelas WHERE id_mapel_kelas = ?', [id]);
    revalidatePath('/tu/mapel-kelas');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}

export async function copyMapelKelasFromPreviousYear() {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const sekolah = await getSekolahWithFilter();
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
    const insertedMapel: { id_kelas: number; id_mapel: number }[] = [];

    // Batch: fetch all existing mapel_kelas for target period
    const [existingAllRows]: any = await pool.query(
      'SELECT id_kelas, id_mapel FROM mapel_kelas WHERE tahun = ? AND semester = ?',
      [tahunBaru, semester]
    );
    const existingAllSet = new Set(existingAllRows.map((e: any) => `${e.id_kelas}_${e.id_mapel}`));

    const newInserts: any[][] = [];

    for (const row of rows) {
      const idKelas = row.id_kelas;

      if (!kelasMap.has(idKelas)) {
        kelasMap.set(idKelas, { nama_kelas: row.nama_kelas, total: 0, disalin: 0, diSkip: 0 });
      }

      const entry = kelasMap.get(idKelas)!;
      entry.total++;

      if (existingAllSet.has(`${idKelas}_${row.id_mapel}`)) {
        entry.diSkip++;
        totalSkip++;
      } else {
        newInserts.push([tahunBaru, semester, idKelas, row.id_mapel, row.id_user]);
        entry.disalin++;
        totalDisalin++;
        insertedMapel.push({ id_kelas: idKelas, id_mapel: row.id_mapel });
      }
    }

    if (newInserts.length > 0) {
      await pool.query(
        'INSERT INTO mapel_kelas (tahun, semester, id_kelas, id_mapel, id_user) VALUES ?',
        [newInserts]
      );
    }

    // Auto-enroll siswa untuk mapel yang baru disalin
    const totalEnrolled = await autoEnrollSiswa(tahunBaru, semester, insertedMapel);

    // Format hasil
    const hasil = Array.from(kelasMap.values()).map((h) => ({
      kelas: h.nama_kelas,
      mapel: h.total,
      disalin: h.disalin,
      skip: h.diSkip,
      status: `${h.disalin} mapel disalin` + (h.diSkip > 0 ? `, ${h.diSkip} sudah ada` : ''),
    }));

    revalidatePath('/tu/mapel-kelas');
    return { success: true, totalDisalin, totalSkip, totalEnrolled, hasil } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menyalin mapel kelas' } as const;
  }
}

export async function copyMapelKelasFromSameYear() {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const sekolah = await getSekolahWithFilter();
  const tahun = sekolah?.tahun;
  const semesterAktif = sekolah?.semester;

  if (!tahun || !semesterAktif || semesterAktif !== 2) {
    return { success: false, error: 'Fitur ini hanya tersedia di semester 2 (Genap).' } as const;
  }

  const semesterSumber = 1;

  try {
    const [rows]: any = await pool.query(`
      SELECT mk.id_kelas, mk.id_mapel, mk.id_user, k.nama_kelas, m.nama_mapel,
        COALESCE(u.nama, '-') AS nama_guru
      FROM mapel_kelas mk
      JOIN kelas k ON mk.id_kelas = k.id_kelas
      JOIN mapel m ON mk.id_mapel = m.id_mapel
      LEFT JOIN users u ON mk.id_user = u.id_user
      WHERE mk.tahun = ? AND mk.semester = ?
      ORDER BY k.nama_kelas, m.nama_mapel
    `, [tahun, semesterSumber]);

    if (rows.length === 0) {
      return { success: false, error: `Tidak ada data mapel kelas di semester 1 tahun ini.` } as const;
    }

    const kelasMap = new Map<number, { nama_kelas: string; total: number; disalin: number; diSkip: number }>();

    let totalDisalin = 0;
    let totalSkip = 0;
    const insertedMapel: { id_kelas: number; id_mapel: number }[] = [];

    // Batch: fetch all existing mapel_kelas for target period
    const [existingAllRows]: any = await pool.query(
      'SELECT id_kelas, id_mapel FROM mapel_kelas WHERE tahun = ? AND semester = ?',
      [tahun, semesterAktif]
    );
    const existingAllSet = new Set(existingAllRows.map((e: any) => `${e.id_kelas}_${e.id_mapel}`));

    const newInserts: any[][] = [];

    for (const row of rows) {
      const idKelas = row.id_kelas;

      if (!kelasMap.has(idKelas)) {
        kelasMap.set(idKelas, { nama_kelas: row.nama_kelas, total: 0, disalin: 0, diSkip: 0 });
      }

      const entry = kelasMap.get(idKelas)!;
      entry.total++;

      if (existingAllSet.has(`${idKelas}_${row.id_mapel}`)) {
        entry.diSkip++;
        totalSkip++;
      } else {
        newInserts.push([tahun, semesterAktif, idKelas, row.id_mapel, row.id_user]);
        entry.disalin++;
        totalDisalin++;
        insertedMapel.push({ id_kelas: idKelas, id_mapel: row.id_mapel });
      }
    }

    if (newInserts.length > 0) {
      await pool.query(
        'INSERT INTO mapel_kelas (tahun, semester, id_kelas, id_mapel, id_user) VALUES ?',
        [newInserts]
      );
    }

    const totalEnrolled = await autoEnrollSiswa(tahun, semesterAktif, insertedMapel);

    const hasil = Array.from(kelasMap.values()).map((h) => ({
      kelas: h.nama_kelas,
      mapel: h.total,
      disalin: h.disalin,
      skip: h.diSkip,
      status: `${h.disalin} mapel disalin` + (h.diSkip > 0 ? `, ${h.diSkip} sudah ada` : ''),
    }));

    revalidatePath('/tu/mapel-kelas');
    return { success: true, totalDisalin, totalSkip, totalEnrolled, hasil } as const;
  } catch (e: any) {
    return { success: false, error: 'Gagal menyalin mapel kelas' } as const;
  }
}
