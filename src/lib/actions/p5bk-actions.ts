'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

function generateKode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function updateP5BK(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_proyek_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idTema = formData.get('id_tema') as string;
  const idUser = formData.get('id_user') as string;
  const judulProyek = formData.get('judul_proyek') as string;
  const deskripsiSingkat = formData.get('deskripsi_singkat') as string;
  const subElemenIdsRaw = formData.get('sub_elemen_ids') as string;

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah WHERE id_sekolah = 1');
  const sekolah = sekolahRows[0];
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  try {
    let proyekId: number;

    if (id) {
      await pool.query(
        `UPDATE proyek_kelas SET id_kelas = ?, id_tema = ?, id_user = ?, judul_proyek = ?, deskripsi_singkat = ? WHERE id_proyek_kelas = ?`,
        [idKelas, idTema, idUser, judulProyek, deskripsiSingkat, id]
      );
      proyekId = Number(id);
    } else {
      const [result]: any = await pool.query(
        `INSERT INTO proyek_kelas (kode, tahun, semester, id_kelas, id_tema, id_user, judul_proyek, deskripsi_singkat)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [generateKode(), tahun, semester, idKelas, idTema, idUser, judulProyek, deskripsiSingkat]
      );
      proyekId = result.insertId;
    }

    // Save sub_elemen selections
    if (subElemenIdsRaw) {
      const subElemenIds: number[] = JSON.parse(subElemenIdsRaw);
      await pool.query('DELETE FROM proyek_subelemen WHERE id_proyek_kelas = ?', [proyekId]);

      if (subElemenIds.length > 0) {
        const values = subElemenIds.map((idSub: number) => {
          // Look up dimensi & elemen for this sub_elemen
          return `(${proyekId}, ${idSub})`;
        });
        // Simpler approach: insert one by one
        for (const idSub of subElemenIds) {
          const [subRow]: any = await pool.query(
            'SELECT id_dimensi, id_elemen FROM sub_elemen WHERE id_sub_elemen = ?',
            [idSub]
          );
          if (subRow.length > 0) {
            await pool.query(
              'INSERT INTO proyek_subelemen (id_proyek_kelas, id_dimensi, id_elemen, id_sub_elemen) VALUES (?, ?, ?, ?)',
              [proyekId, subRow[0].id_dimensi, subRow[0].id_elemen, idSub]
            );
          }
        }
      }
    }

    revalidatePath('/tu/p5bk');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function getSubelemenByProyek(idProyek: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT id_sub_elemen FROM proyek_subelemen WHERE id_proyek_kelas = ?',
      [idProyek]
    );
    return { success: true, data: rows.map((r: any) => r.id_sub_elemen) } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal mengambil data' } as const;
  }
}

export async function getDataNilaiP5BK(idProyek: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

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
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal mengambil data nilai' } as const;
  }
}

export async function saveNilaiP5BK(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idProyek = Number(formData.get('id_proyek_kelas'));
  const subElemenIds: number[] = JSON.parse(formData.get('sub_elemen_ids') as string || '[]');
  const siswaIds: number[] = JSON.parse(formData.get('siswa_ids') as string || '[]');

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
    for (const idSiswa of siswaIds) {
      for (const idSubElemen of subElemenIds) {
        const nilaiRaw = formData.get(`nilai_${idSiswa}_${idSubElemen}`) as string;
        if (!nilaiRaw) continue;
        const nilai = Number(nilaiRaw);
        const info = subMap[idSubElemen];
        if (!info) continue;

        // Check if row exists in nilai_proyek
        const [existing]: any = await pool.query(
          'SELECT id_nilai_proyek FROM nilai_proyek WHERE proyek = ? AND id_siswa = ? AND id_sub_elemen = ?',
          [idProyek, idSiswa, idSubElemen]
        );

        if (existing.length > 0) {
          await pool.query(
            'UPDATE nilai_proyek SET nilai = ?, tahun = ?, semester = ? WHERE id_nilai_proyek = ?',
            [nilai, tahun, semester, existing[0].id_nilai_proyek]
          );
        } else {
          await pool.query(
            `INSERT INTO nilai_proyek (tahun, semester, proyek, id_kelas, id_mapel, id_dimensi, id_elemen, id_sub_elemen, id_siswa, nilai)
             VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
            [tahun, semester, idProyek, id_kelas, info.id_dimensi, info.id_elemen, idSubElemen, idSiswa, nilai]
          );
        }
      }
    }

    revalidatePath('/tu/p5bk');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan nilai' } as const;
  }
}

export async function deleteP5BK(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM proyek_kelas WHERE id_proyek_kelas = ?', [id]);
    revalidatePath('/tu/p5bk');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
