'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

function generateKode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Save (create/update) a proyek_kelas for kokurikuler.
 */
export async function saveProyekKokurikuler(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_proyek_kelas') as string;
  const idKelas = formData.get('id_kelas') as string;
  const idTema = (formData.get('id_tema') as string) || '1';
  const idUser = formData.get('id_user') as string;
  const judulProyek = (formData.get('judul_proyek') as string)?.trim();
  const deskripsiSingkat = (formData.get('deskripsi_singkat') as string)?.trim() || '';

  if (!idKelas || !judulProyek) {
    return { success: false, error: 'Kelas dan Nama Kegiatan wajib diisi' } as const;
  }

  const sekolah = await getSekolahWithFilter();
  const tahun = sekolah?.tahun || 1;
  const semester = sekolah?.semester || 1;

  try {
    if (id) {
      await pool.query(
        `UPDATE proyek_kelas 
         SET id_kelas = ?, id_tema = ?, id_user = ?, judul_proyek = ?, deskripsi_singkat = ? 
         WHERE id_proyek_kelas = ?`,
        [idKelas, idTema, idUser ? Number(idUser) : null, judulProyek, deskripsiSingkat, id]
      );
    } else {
      await pool.query(
        `INSERT INTO proyek_kelas (kode, tahun, semester, id_kelas, id_tema, id_user, judul_proyek, deskripsi_singkat)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [generateKode(), tahun, semester, idKelas, idTema, idUser ? Number(idUser) : null, judulProyek, deskripsiSingkat]
      );
    }
    revalidatePath('/tu/kokurikuler');
    return { success: true } as const;
  } catch (e: any) {
    console.error('Save proyek kokurikuler error:', e);
    return { success: false, error: 'Gagal menyimpan kegiatan kokurikuler' } as const;
  }
}

/**
 * Update pembina (id_user) for a proyek_kelas inline.
 */
export async function updatePembinaKokurikuler(idProyekKelas: number, idUser: number | null) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query(
      'UPDATE proyek_kelas SET id_user = ? WHERE id_proyek_kelas = ?',
      [idUser ? Number(idUser) : null, idProyekKelas]
    );
    revalidatePath('/tu/kokurikuler');
    return { success: true } as const;
  } catch (e: any) {
    console.error('Update pembina error:', e);
    return { success: false, error: 'Gagal memperbarui pembina' } as const;
  }
}

/**
 * Copy a proyek_kelas along with its tujuan to target classes.
 */
export async function copyProyekKokurikuler(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const sourceId = Number(formData.get('source_id_proyek_kelas'));
  const targetKelasIdsRaw = formData.get('target_kelas_ids') as string;
  const copyTujuanFlag = formData.get('copy_tujuan') === '1';

  if (!sourceId || !targetKelasIdsRaw) {
    return { success: false, error: 'Data sumber atau kelas target tidak valid' } as const;
  }

  let targetKelasIds: number[] = [];
  try {
    targetKelasIds = JSON.parse(targetKelasIdsRaw);
  } catch {
    return { success: false, error: 'Format data kelas target salah' } as const;
  }

  if (!targetKelasIds.length) {
    return { success: false, error: 'Pilih minimal satu kelas target' } as const;
  }

  try {
    // 1. Get source proyek
    const [srcRows]: any = await pool.query(
      'SELECT * FROM proyek_kelas WHERE id_proyek_kelas = ? AND deleted_at IS NULL',
      [sourceId]
    );
    if (srcRows.length === 0) return { success: false, error: 'Kegiatan sumber tidak ditemukan' } as const;
    const src = srcRows[0];

    // 2. Get source tujuan if requested
    let srcTujuan: any[] = [];
    if (copyTujuanFlag) {
      const [tujuanRows]: any = await pool.query(
        'SELECT id_dimensi, deskripsi FROM proyek_tujuan WHERE id_proyek_kelas = ? AND deleted_at IS NULL',
        [sourceId]
      );
      srcTujuan = tujuanRows;
    }

    // 3. For each target class, insert new proyek_kelas and duplicate tujuan
    for (const idKelas of targetKelasIds) {
      const [res]: any = await pool.query(
        `INSERT INTO proyek_kelas (kode, tahun, semester, id_kelas, id_tema, id_user, judul_proyek, deskripsi_singkat)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [generateKode(), src.tahun, src.semester, idKelas, src.id_tema, src.id_user, src.judul_proyek, src.deskripsi_singkat]
      );
      const newProyekId = res.insertId;

      if (srcTujuan.length > 0) {
        const inserts = srcTujuan.map((t) => [newProyekId, t.id_dimensi, t.deskripsi]);
        await pool.query(
          'INSERT INTO proyek_tujuan (id_proyek_kelas, id_dimensi, deskripsi) VALUES ?',
          [inserts]
        );
      }
    }

    revalidatePath('/tu/kokurikuler');
    return { success: true, count: targetKelasIds.length } as const;
  } catch (e: any) {
    console.error('Copy proyek kokurikuler error:', e);
    return { success: false, error: 'Gagal menyalin kegiatan kokurikuler' } as const;
  }
}

/**
 * Delete a proyek_kelas and all related kokurikuler data.
 */
export async function deleteKokurikulerProyek(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('DELETE FROM nilai_kokurikuler WHERE id_proyek_kelas = ?', [id]);
    await pool.query('DELETE FROM proyek_tujuan WHERE id_proyek_kelas = ?', [id]);
    await pool.query('DELETE FROM proyek_subelemen WHERE id_proyek_kelas = ?', [id]);
    await pool.query('DELETE FROM proyek_kelas WHERE id_proyek_kelas = ?', [id]);
    revalidatePath('/tu/kokurikuler');
    return { success: true } as const;
  } catch (e: any) {
    console.error('Delete proyek error:', e);
    return { success: false, error: 'Gagal menghapus kegiatan kokurikuler' } as const;
  }
}

/**
 * Get all proyek_tujuan rows for a given proyek_kelas.
 */
export async function getTujuanByProyek(idProyek: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    const [rows]: any = await pool.query(
      `SELECT pt.id_proyek_tujuan, pt.id_dimensi, pt.deskripsi, dk.dimensi AS nama_dimensi
       FROM proyek_tujuan pt
       JOIN dimensi_kokurikuler dk ON pt.id_dimensi = dk.id_dimensi
       WHERE pt.id_proyek_kelas = ? AND pt.deleted_at IS NULL
       ORDER BY pt.id_proyek_tujuan ASC`,
      [idProyek]
    );
    return { success: true, data: rows } as const;
  } catch (e: any) {
    console.error('Get tujuan error:', e);
    return { success: false, error: 'Gagal mengambil data tujuan' } as const;
  }
}

/**
 * Save (create/update) a proyek_tujuan.
 */
export async function saveTujuan(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_proyek_tujuan') as string;
  const idProyekKelas = Number(formData.get('id_proyek_kelas'));
  const idDimensi = Number(formData.get('id_dimensi'));
  const deskripsi = (formData.get('deskripsi') as string)?.trim();

  if (!idProyekKelas || !idDimensi || !deskripsi) {
    return { success: false, error: 'Dimensi dan Deskripsi wajib diisi' } as const;
  }

  try {
    if (id) {
      await pool.query(
        'UPDATE proyek_tujuan SET id_dimensi = ?, deskripsi = ? WHERE id_proyek_tujuan = ?',
        [idDimensi, deskripsi, id]
      );
    } else {
      await pool.query(
        'INSERT INTO proyek_tujuan (id_proyek_kelas, id_dimensi, deskripsi) VALUES (?, ?, ?)',
        [idProyekKelas, idDimensi, deskripsi]
      );
    }
    revalidatePath('/tu/kokurikuler');
    revalidatePath(`/tu/kokurikuler/${idProyekKelas}`);
    return { success: true } as const;
  } catch (e: any) {
    console.error('Save tujuan error:', e);
    return { success: false, error: 'Gagal menyimpan tujuan' } as const;
  }
}

/**
 * Update an existing proyek_tujuan inline (dimensi & deskripsi).
 */
export async function updateTujuanInline(
  idProyekTujuan: number,
  idDimensi: number,
  deskripsi: string,
  idProyekKelas: number
) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  if (!idProyekTujuan || !idDimensi || !deskripsi.trim()) {
    return { success: false, error: 'Dimensi dan Deskripsi tidak boleh kosong' } as const;
  }

  try {
    await pool.query(
      'UPDATE proyek_tujuan SET id_dimensi = ?, deskripsi = ? WHERE id_proyek_tujuan = ?',
      [idDimensi, deskripsi, idProyekTujuan]
    );
    revalidatePath('/tu/kokurikuler');
    if (idProyekKelas) revalidatePath(`/tu/kokurikuler/${idProyekKelas}`);
    return { success: true } as const;
  } catch (e: any) {
    console.error('Update tujuan inline error:', e);
    return { success: false, error: 'Gagal memperbarui tujuan' } as const;
  }
}

/**
 * Delete a proyek_tujuan.
 */
export async function deleteTujuan(id: number, idProyekKelas?: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('DELETE FROM nilai_kokurikuler WHERE id_proyek_tujuan = ?', [id]);
    await pool.query('DELETE FROM proyek_tujuan WHERE id_proyek_tujuan = ?', [id]);
    revalidatePath('/tu/kokurikuler');
    if (idProyekKelas) revalidatePath(`/tu/kokurikuler/${idProyekKelas}`);
    return { success: true } as const;
  } catch (e: any) {
    console.error('Delete tujuan error:', e);
    return { success: false, error: 'Gagal menghapus tujuan' } as const;
  }
}

/**
 * Get data for nilai kokurikuler modal: siswa list + tujuan list + existing nilai.
 */
export async function getDataNilaiKokurikuler(idProyek: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    const [proyekRows]: any = await pool.query(
      `SELECT pk.id_proyek_kelas, pk.id_kelas, pk.tahun, pk.semester, pk.judul_proyek, k.nama_kelas
       FROM proyek_kelas pk
       JOIN kelas k ON pk.id_kelas = k.id_kelas
       WHERE pk.id_proyek_kelas = ?`,
      [idProyek]
    );
    if (proyekRows.length === 0) return { success: false, error: 'Kegiatan tidak ditemukan' } as const;
    const proyek = proyekRows[0];

    // Siswa in the class for that period
    const [siswaRows]: any = await pool.query(
      `SELECT DISTINCT s.id_siswa, s.nama_siswa, s.nis
       FROM siswa_kelas sk
       JOIN siswa s ON sk.id_siswa = s.id_siswa
       WHERE sk.id_kelas = ? AND sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL AND s.deleted_at IS NULL
       ORDER BY s.nama_siswa ASC`,
      [proyek.id_kelas, proyek.tahun, proyek.semester]
    );

    // Tujuan for this proyek with dimensi info
    const [tujuanRows]: any = await pool.query(
      `SELECT pt.id_proyek_tujuan, pt.id_dimensi, pt.deskripsi, dk.dimensi AS nama_dimensi
       FROM proyek_tujuan pt
       JOIN dimensi_kokurikuler dk ON pt.id_dimensi = dk.id_dimensi
       WHERE pt.id_proyek_kelas = ? AND pt.deleted_at IS NULL
       ORDER BY pt.id_proyek_tujuan ASC`,
      [idProyek]
    );

    // Existing nilai
    const [nilaiRows]: any = await pool.query(
      `SELECT id_siswa, id_proyek_tujuan, nilai
       FROM nilai_kokurikuler
       WHERE id_proyek_kelas = ? AND deleted_at IS NULL`,
      [idProyek]
    );

    const existingNilai: Record<string, number> = {};
    for (const row of nilaiRows) {
      existingNilai[`${row.id_siswa}_${row.id_proyek_tujuan}`] = row.nilai;
    }

    return {
      success: true,
      data: { siswa: siswaRows, tujuanList: tujuanRows, existingNilai, proyek },
    } as const;
  } catch (e: any) {
    console.error('Get nilai data error:', e);
    return { success: false, error: 'Gagal mengambil data nilai' } as const;
  }
}

/**
 * Save nilai kokurikuler (batch upsert).
 */
export async function saveNilaiKokurikuler(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const idProyek = Number(formData.get('id_proyek_kelas'));
  const tujuanIds: number[] = JSON.parse(formData.get('tujuan_ids') as string || '[]');
  const siswaIds: number[] = JSON.parse(formData.get('siswa_ids') as string || '[]');

  if (!idProyek || tujuanIds.length === 0 || siswaIds.length === 0) {
    return { success: false, error: 'Data tidak lengkap' } as const;
  }

  const [proyekRows]: any = await pool.query(
    'SELECT tahun, semester, id_kelas FROM proyek_kelas WHERE id_proyek_kelas = ?',
    [idProyek]
  );
  if (proyekRows.length === 0) return { success: false, error: 'Kegiatan tidak ditemukan' } as const;
  const { tahun, semester } = proyekRows[0];

  try {
    const [existingRows]: any = await pool.query(
      'SELECT id_nilai_kokurikuler, id_siswa, id_proyek_tujuan FROM nilai_kokurikuler WHERE id_proyek_kelas = ? AND deleted_at IS NULL',
      [idProyek]
    );
    const existingMap = new Map<string, number>();
    for (const r of existingRows) {
      existingMap.set(`${r.id_siswa}_${r.id_proyek_tujuan}`, r.id_nilai_kokurikuler);
    }

    const updates: { nilai: number; id: number }[] = [];
    const inserts: any[][] = [];

    for (const idSiswa of siswaIds) {
      for (const idTujuan of tujuanIds) {
        const nilaiRaw = formData.get(`nilai_${idSiswa}_${idTujuan}`) as string;
        if (!nilaiRaw) continue;
        const nilai = Number(nilaiRaw);

        const key = `${idSiswa}_${idTujuan}`;
        if (existingMap.has(key)) {
          updates.push({ nilai, id: existingMap.get(key)! });
        } else {
          inserts.push([tahun, semester, idProyek, idTujuan, idSiswa, nilai]);
        }
      }
    }

    if (updates.length > 0) {
      const cases = updates.map(() => `WHEN id_nilai_kokurikuler = ? THEN ?`).join(' ');
      const caseParams = updates.flatMap((u) => [u.id, u.nilai]);
      const ids = updates.map((u) => u.id);
      await pool.query(
        `UPDATE nilai_kokurikuler SET nilai = CASE ${cases} END WHERE id_nilai_kokurikuler IN (?)`,
        [...caseParams, ids]
      );
    }

    if (inserts.length > 0) {
      await pool.query(
        `INSERT INTO nilai_kokurikuler (tahun, semester, id_proyek_kelas, id_proyek_tujuan, id_siswa, nilai) VALUES ?`,
        [inserts]
      );
    }

    revalidatePath('/tu/kokurikuler');
    return { success: true } as const;
  } catch (e: any) {
    console.error('Save nilai error:', e);
    return { success: false, error: 'Gagal menyimpan nilai' } as const;
  }
}
