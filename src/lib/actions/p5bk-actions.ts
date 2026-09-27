'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool, withTransaction } from '@/lib/db';
import { getPeriodeAktif } from '@/lib/sekolah-helper';
import { parseJsonArray } from '@/lib/validate';
import { revalidatePath } from 'next/cache';

function generateKode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function updateP5BK(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_proyek_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idTema = formData.get('id_tema') as string;
  const idUser = formData.get('id_user') as string;
  const judulProyek = formData.get('judul_proyek') as string;
  const deskripsiSingkat = formData.get('deskripsi_singkat') as string;
  const subElemenIdsRaw = formData.get('sub_elemen_ids') as string;

  const { tahun, semester } = await getPeriodeAktif();

  const parsedSubElemen = parseJsonArray<number>(subElemenIdsRaw, 'sub elemen');
  if (!parsedSubElemen.ok) {
    return { success: false, error: parsedSubElemen.error } as const;
  }
  const subElemenIds = parsedSubElemen.value;

  try {
    await withTransaction(async (conn) => {
      let proyekId: number;

      if (id) {
        await conn.query(
          `UPDATE proyek_kelas SET id_kelas = ?, id_tema = ?, id_user = ?, judul_proyek = ?, deskripsi_singkat = ? WHERE id_proyek_kelas = ?`,
          [idKelas, idTema, idUser, judulProyek, deskripsiSingkat, id]
        );
        proyekId = Number(id);
      } else {
        const [result]: any = await conn.query(
          `INSERT INTO proyek_kelas (kode, tahun, semester, id_kelas, id_tema, id_user, judul_proyek, deskripsi_singkat)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [generateKode(), tahun, semester, idKelas, idTema, idUser, judulProyek, deskripsiSingkat]
        );
        proyekId = result.insertId;
      }

      // Save sub_elemen selections
      if (subElemenIdsRaw) {
        await conn.query('DELETE FROM proyek_subelemen WHERE id_proyek_kelas = ?', [proyekId]);

        if (subElemenIds.length > 0) {
          // Batch: ambil dimensi & elemen untuk semua sub_elemen sekaligus
          const [subRows]: any = await conn.query(
            'SELECT id_sub_elemen, id_dimensi, id_elemen FROM sub_elemen WHERE id_sub_elemen IN (?)',
            [subElemenIds]
          );
          const subMap = new Map<number, { id_dimensi: number; id_elemen: number }>();
          for (const sub of subRows) {
            subMap.set(sub.id_sub_elemen, { id_dimensi: sub.id_dimensi, id_elemen: sub.id_elemen });
          }

          const newInserts: any[][] = [];
          for (const idSub of subElemenIds) {
            const info = subMap.get(idSub);
            if (!info) continue;
            newInserts.push([proyekId, info.id_dimensi, info.id_elemen, idSub]);
          }
          if (newInserts.length > 0) {
            await conn.query(
              'INSERT INTO proyek_subelemen (id_proyek_kelas, id_dimensi, id_elemen, id_sub_elemen) VALUES ?',
              [newInserts]
            );
          }
        }
      }
    });

    revalidatePath('/tu/p5bk');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function getSubelemenByProyek(idProyek: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    const [rows]: any = await pool.query(
      'SELECT id_sub_elemen FROM proyek_subelemen WHERE id_proyek_kelas = ?',
      [idProyek]
    );
    return { success: true, data: rows.map((r: any) => r.id_sub_elemen) } as const;
  } catch {
    return { success: false, error: 'Gagal mengambil data' } as const;
  }
}

export async function getDataNilaiP5BK(idProyek: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    // Get project info
    const [proyekRows]: any = await pool.query(
      'SELECT id_kelas, tahun, semester FROM proyek_kelas WHERE id_proyek_kelas = ?',
      [idProyek]
    );
    if (proyekRows.length === 0) return { success: false, error: 'Proyek tidak ditemukan' } as const;
    const proyek = proyekRows[0];

    // Get students in the class filtered by tahun/semester
    const [siswaRows]: any = await pool.query(
      `SELECT DISTINCT s.id_siswa, s.nama_siswa
       FROM siswa_kelas sk
       JOIN siswa s ON sk.id_siswa = s.id_siswa
       WHERE sk.id_kelas = ? AND sk.tahun = ? AND sk.semester = ?
       ORDER BY s.nama_siswa`,
      [proyek.id_kelas, proyek.tahun, proyek.semester]
    );

    // Get sub_elemen list with dimensi & elemen info for this project
    const [subElemenRows]: any = await pool.query(
      `SELECT ps.id_proyek_subelemen, ps.id_dimensi, ps.id_elemen, ps.id_sub_elemen,
              d.dimensi AS nama_dimensi,
              e.elemen AS nama_elemen,
              se.sub_elemen AS nama_sub_elemen
       FROM proyek_subelemen ps
       JOIN dimensi d ON ps.id_dimensi = d.id_dimensi
       JOIN elemen e ON ps.id_elemen = e.id_elemen
       JOIN sub_elemen se ON ps.id_sub_elemen = se.id_sub_elemen
       WHERE ps.id_proyek_kelas = ?
       ORDER BY d.id_dimensi, e.id_elemen, se.id_sub_elemen`,
      [idProyek]
    );

    // Get existing nilai from nilai_proyek filtered by tahun/semester
    const [nilaiRows]: any = await pool.query(
      `SELECT id_siswa, id_sub_elemen, nilai
       FROM nilai_proyek
       WHERE proyek = ? AND tahun = ? AND semester = ?`,
      [idProyek, proyek.tahun, proyek.semester]
    );

    // Build maps
    const existingNilai: Record<string, number> = {};
    for (const row of nilaiRows) {
      existingNilai[`${row.id_siswa}_${row.id_sub_elemen}`] = row.nilai;
    }

    return {
      success: true,
      data: { siswa: siswaRows, subElemenList: subElemenRows, existingNilai, proyek },
      debug: {
        id_kelas: proyek.id_kelas,
        siswaCount: siswaRows.length,
        subElemenCount: subElemenRows.length,
      },
    } as const;
  } catch {
    return { success: false, error: 'Gagal mengambil data nilai' } as const;
  }
}

export async function saveNilaiP5BK(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const idProyek = Number(formData.get('id_proyek_kelas'));
  const parsedSubElemenIds = parseJsonArray<number>(formData.get('sub_elemen_ids') as string, 'sub elemen');
  if (!parsedSubElemenIds.ok) return { success: false, error: parsedSubElemenIds.error } as const;
  const parsedSiswaIds = parseJsonArray<number>(formData.get('siswa_ids') as string, 'siswa');
  if (!parsedSiswaIds.ok) return { success: false, error: parsedSiswaIds.error } as const;
  const subElemenIds = parsedSubElemenIds.value;
  const siswaIds = parsedSiswaIds.value;

  if (!idProyek || subElemenIds.length === 0 || siswaIds.length === 0) {
    return { success: false, error: 'Data tidak lengkap' } as const;
  }

  // Get proyek info
  const [proyekRows]: any = await pool.query(
    'SELECT tahun, semester, id_kelas FROM proyek_kelas WHERE id_proyek_kelas = ?',
    [idProyek]
  );
  if (proyekRows.length === 0) return { success: false, error: 'Proyek tidak ditemukan' } as const;
  const { tahun, semester, id_kelas } = proyekRows[0];

  // Look up dimensi & elemen for each sub_elemen
  const [subRows]: any = await pool.query(
    'SELECT id_sub_elemen, id_dimensi, id_elemen FROM sub_elemen WHERE id_sub_elemen IN (?)',
    [subElemenIds]
  );
  const subMap: Record<number, { id_dimensi: number; id_elemen: number }> = {};
  for (const r of subRows) {
    subMap[r.id_sub_elemen] = { id_dimensi: r.id_dimensi, id_elemen: r.id_elemen };
  }

  try {
    // Batch: ambil semua existing nilai_proyek sekaligus
    const [existingNilaiRows]: any = await pool.query(
      'SELECT id_nilai_proyek, id_siswa, id_sub_elemen FROM nilai_proyek WHERE proyek = ?',
      [idProyek]
    );
    const existingMap = new Map<string, number>();
    for (const r of existingNilaiRows) {
      existingMap.set(`${r.id_siswa}_${r.id_sub_elemen}`, r.id_nilai_proyek);
    }

    const updates: { nilai: number; tahun: number; semester: number; id: number }[] = [];
    const inserts: any[][] = [];

    for (const idSiswa of siswaIds) {
      for (const idSubElemen of subElemenIds) {
        const nilaiRaw = formData.get(`nilai_${idSiswa}_${idSubElemen}`) as string;
        if (!nilaiRaw) continue;
        const nilai = Number(nilaiRaw);
        const info = subMap[idSubElemen];
        if (!info) continue;

        const key = `${idSiswa}_${idSubElemen}`;
        if (existingMap.has(key)) {
          updates.push({ nilai, tahun, semester, id: existingMap.get(key)! });
        } else {
          inserts.push([tahun, semester, idProyek, id_kelas, 0, info.id_dimensi, info.id_elemen, idSubElemen, idSiswa, nilai]);
        }
      }
    }

    await withTransaction(async (conn) => {
      if (updates.length > 0) {
        const cases = updates.map(() => `WHEN id_nilai_proyek = ? THEN ?`).join(' ');
        const caseParams = updates.flatMap((u) => [u.id, u.nilai]);
        const ids = updates.map((u) => u.id);
        await conn.query(
          `UPDATE nilai_proyek SET nilai = CASE ${cases} END, tahun = ?, semester = ? WHERE id_nilai_proyek IN (?)`,
          [...caseParams, tahun, semester, ids]
        );
      }

      if (inserts.length > 0) {
        await conn.query(
          `INSERT INTO nilai_proyek (tahun, semester, proyek, id_kelas, id_mapel, id_dimensi, id_elemen, id_sub_elemen, id_siswa, nilai) VALUES ?`,
          [inserts]
        );
      }
    });

    revalidatePath('/tu/p5bk');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan nilai' } as const;
  }
}

export async function deleteP5BK(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await withTransaction(async (conn) => {
      await conn.query('DELETE FROM nilai_proyek WHERE proyek = ?', [id]);
      await conn.query('DELETE FROM proyek_subelemen WHERE id_proyek_kelas = ?', [id]);
      await conn.query('DELETE FROM proyek_kelas WHERE id_proyek_kelas = ?', [id]);
    });
    revalidatePath('/tu/p5bk');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}
