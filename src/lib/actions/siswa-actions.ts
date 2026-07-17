'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

async function resolveTingkat(terimaKelas: string | null): Promise<number | null> {
  if (!terimaKelas) return null;
  const roman = terimaKelas.trim().split(/\s+/)[0].toUpperCase();
  const [rows]: any = await pool.query(
    `SELECT id_tingkat FROM tingkat WHERE deleted_at IS NULL AND tabjad = ?`,
    [roman]
  );
  return rows[0]?.id_tingkat ?? null;
}

export async function getSiswaList(search: string, page: number, perPage: number, tahun: number, semester: number) {
  const offset = page * perPage;
  const like = `%${search}%`;
  const cols = ['s.nama_siswa', 's.nis', 's.nisn', 'jk.jenis_kelamin', 'a.agama', 'kk.kompetensi_keahlian', 'COALESCE(k.nama_kelas, \'Belum Bergabung\')'];
  const where = cols.map((c) => `${c} LIKE ?`).join(' OR ');

  const [rows]: any = await pool.query(`
    SELECT
      s.id_siswa, s.nama_siswa, s.nis, s.nisn, s.terima_kelas,
      s.tempat_lahir, s.tanggal_lahir, s.kelamin, s.agama, s.jurusan,
      jk.jenis_kelamin, a.agama,
      kk.kompetensi_keahlian,
      COALESCE(k.nama_kelas, 'Belum Bergabung') as kelas_display
    FROM siswa s
    LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
    LEFT JOIN agama a ON s.agama = a.id_agama
    LEFT JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
    LEFT JOIN (
      SELECT id_siswa, id_kelas FROM siswa_kelas
      WHERE tahun = ? AND semester = ?
      GROUP BY id_siswa
    ) sk ON s.id_siswa = sk.id_siswa
    LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
    WHERE s.deleted_at IS NULL AND s.aktif = 1
      AND (${where})
    ORDER BY s.id_siswa ASC
    LIMIT ? OFFSET ?
  `, [tahun, semester, ...Array(cols.length).fill(like), perPage, offset]);

  return rows.map((s: any) => {
    let tglFormatted = '';
    const tgl = s.tanggal_lahir;
    if (tgl) {
      try {
        const d = typeof tgl === 'string' ? new Date(tgl + 'T00:00:00') : new Date(tgl);
        if (!isNaN(d.getTime())) {
          const hari = String(d.getDate()).padStart(2, '0');
          const bulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
          ][d.getMonth()];
          const tahun = d.getFullYear();
          tglFormatted = `${hari} ${bulan} ${tahun}`;
        }
      } catch {}
    }
    return {
      ...s,
      tempat_tanggal_lahir: tglFormatted ? `${s.tempat_lahir}, ${tglFormatted}` : s.tempat_lahir,
    };
  });
}

export async function getSiswaCount(search: string, tahun: number, semester: number) {
  const like = `%${search}%`;
  const cols = ['s.nama_siswa', 's.nis', 's.nisn', 'jk.jenis_kelamin', 'a.agama', 'kk.kompetensi_keahlian', 'COALESCE(k.nama_kelas, \'Belum Bergabung\')'];
  const where = cols.map((c) => `${c} LIKE ?`).join(' OR ');

  const [rows]: any = await pool.query(`
    SELECT COUNT(*) as total
    FROM siswa s
    LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
    LEFT JOIN agama a ON s.agama = a.id_agama
    LEFT JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
    LEFT JOIN (
      SELECT id_siswa, id_kelas FROM siswa_kelas
      WHERE tahun = ? AND semester = ?
      GROUP BY id_siswa
    ) sk ON s.id_siswa = sk.id_siswa
    LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
    WHERE s.deleted_at IS NULL AND s.aktif = 1
      AND (${where})
  `, [tahun, semester, ...Array(cols.length).fill(like)]);

  return rows[0]?.total ?? 0;
}

export async function updateSiswa(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_siswa') as string;
  const namaSiswa = formData.get('nama_siswa') as string;
  const nis = formData.get('nis') as string;
  const nisn = formData.get('nisn') as string;
  const tempatLahir = formData.get('tempat_lahir') as string;
  const tanggalLahir = formData.get('tanggal_lahir') as string;
  const kelamin = formData.get('kelamin') as string;
  const agama = formData.get('agama') as string;
  const kontakSiswa = formData.get('kontak_siswa') as string;
  const alamat = formData.get('alamat') as string;
  const jurusan = formData.get('jurusan') as string;
  const terimaKelas = formData.get('terima_kelas') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : '';

  try {
    if (!id) {
      // Cek duplikat NIS/NISN sebelum insert
      const [existing]: any = await pool.query(
        `SELECT id_siswa, nis, nisn FROM siswa
        WHERE deleted_at IS NULL AND (nis = ? OR nisn = ?)`,
        [nis, nisn]
      );
      if (existing.length > 0) {
        const dup = existing[0];
        if (dup.nis === nis) return { success: false, error: `NIS "${nis}" sudah digunakan siswa lain` } as const;
        if (dup.nisn === nisn) return { success: false, error: `NISN "${nisn}" sudah digunakan siswa lain` } as const;
      }

      await pool.query(
        `INSERT INTO siswa (nama_siswa, nis, nisn, tempat_lahir, tanggal_lahir, kelamin, agama, kontak_siswa, alamat, jurusan, terima_kelas, username, password, aktif, terima_tingkat)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [namaSiswa, nis, nisn, tempatLahir, tanggalLahir || null, kelamin, agama, kontakSiswa, alamat, jurusan, terimaKelas, username, hashedPassword, await resolveTingkat(terimaKelas)]
      );
    } else {
      await pool.query(
        `UPDATE siswa SET
          nama_siswa = ?, nis = ?, nisn = ?, tempat_lahir = ?,
          tanggal_lahir = ?, kelamin = ?, agama = ?,
          kontak_siswa = ?, alamat = ?, jurusan = ?,
          terima_kelas = ?, username = ?, password = ?
        WHERE id_siswa = ?`,
        [namaSiswa, nis, nisn, tempatLahir, tanggalLahir || null, kelamin, agama, kontakSiswa, alamat, jurusan, terimaKelas, username, hashedPassword, id]
      );
    }

    revalidatePath('/tu/kesiswaan');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function importSiswa(rows: {
  nama_siswa?: string;
  nis?: string;
  nisn?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string | null;
  kelamin?: number | null;
  agama?: number | null;
  jurusan?: number | null;
  kontak_siswa?: string;
  alamat?: string;
  terima_kelas?: string;
  terima_tanggal?: string | null;
  terima_tingkat?: number | null;
  username?: string;
  password?: string;
}[]) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  // Batch: ambil semua NIS + NISN yang sudah ada → Map ke id_siswa
  const [existingRows]: any = await pool.query(
    `SELECT id_siswa, nis, nisn FROM siswa WHERE deleted_at IS NULL AND (nis IS NOT NULL AND nis != '' OR nisn IS NOT NULL AND nisn != '')`
  );
  const existingNisToId = new Map<string, number>();
  const existingNisnToId = new Map<string, number>();
  for (const row of existingRows) {
    if (row.nis) existingNisToId.set(String(row.nis), row.id_siswa);
    if (row.nisn) existingNisnToId.set(String(row.nisn), row.id_siswa);
  }

  // Batch: ambil data tingkat untuk auto-detect
  const [tingkatRows]: any = await pool.query(
    `SELECT id_tingkat, tabjad FROM tingkat WHERE deleted_at IS NULL`
  );
  const tabjadToId = new Map<string, number>();
  for (const t of tingkatRows) {
    if (t.tabjad) tabjadToId.set(String(t.tabjad).trim().toUpperCase(), t.id_tingkat);
  }

  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.nama_siswa) { errors.push(`Baris ${i + 1}: nama siswa wajib diisi`); continue; }
    if (!r.username) { errors.push(`Baris ${i + 1} (${r.nama_siswa}): username wajib diisi`); continue; }

    // Auto-detect terima_tingkat dari terima_kelas jika tidak diisi
    let terimaTingkat = r.terima_tingkat ?? null;
    if (!terimaTingkat && r.terima_kelas) {
      const roman = r.terima_kelas.trim().split(/\s+/)[0].toUpperCase();
      const found = tabjadToId.get(roman);
      if (found) terimaTingkat = found;
    }

    // Cari existing by NIS atau NISN
    const existingId = (r.nis && existingNisToId.get(r.nis)) || (r.nisn && existingNisnToId.get(r.nisn)) || null;

    try {
      if (existingId) {
        // UPDATE — password hanya diupdate jika diisi
        const pwClause = r.password ? ', password = ?' : '';
        const pwVal = r.password ? [await bcrypt.hash(r.password, 10)] : [];
        await pool.query(
          `UPDATE siswa SET
            nama_siswa = ?, nis = ?, nisn = ?, tempat_lahir = ?,
            tanggal_lahir = ?, kelamin = ?, agama = ?,
            kontak_siswa = ?, alamat = ?, jurusan = ?,
            terima_kelas = ?, terima_tanggal = ?, terima_tingkat = ?, username = ?
            ${pwClause}
          WHERE id_siswa = ?`,
          [
            r.nama_siswa,
            r.nis || null,
            r.nisn || null,
            r.tempat_lahir || null,
            r.tanggal_lahir || null,
            r.kelamin || null,
            r.agama || null,
            r.kontak_siswa || null,
            r.alamat || null,
            r.jurusan || null,
            r.terima_kelas || null,
            r.terima_tanggal || null,
            terimaTingkat,
            r.username,
            ...pwVal,
            existingId,
          ]
        );
        updated++;
      } else {
        // INSERT
        if (!r.password) { errors.push(`Baris ${i + 1} (${r.nama_siswa}): password wajib diisi untuk siswa baru`); continue; }
        const hashedPassword = await bcrypt.hash(r.password, 10);
        await pool.query(
          `INSERT INTO siswa (nama_siswa, nis, nisn, tempat_lahir, tanggal_lahir, kelamin, agama, kontak_siswa, alamat, jurusan, terima_kelas, terima_tanggal, terima_tingkat, username, password, aktif)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            r.nama_siswa,
            r.nis || null,
            r.nisn || null,
            r.tempat_lahir || null,
            r.tanggal_lahir || null,
            r.kelamin || null,
            r.agama || null,
            r.kontak_siswa || null,
            r.alamat || null,
            r.jurusan || null,
            r.terima_kelas || null,
            r.terima_tanggal || null,
            terimaTingkat,
            r.username,
            hashedPassword,
          ]
        );
        // Tambah ke map agar tidak duplikat dalam batch yang sama
        if (r.nis) existingNisToId.set(r.nis, -1); // -1 placeholder
        if (r.nisn) existingNisnToId.set(r.nisn, -1);
        inserted++;
      }
    } catch (e: any) {
      errors.push(`Baris ${i + 1} (${r.nama_siswa}): ${e.message}`);
    }
  }

  revalidatePath('/tu/kesiswaan');
  return { success: errors.length === 0, count: inserted + updated, inserted, updated, errors } as const;
}

export async function deleteSiswa(id: number) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('UPDATE siswa SET deleted_at = NOW() WHERE id_siswa = ?', [id]);
    await pool.query('UPDATE siswa_kelas SET deleted_at = NOW() WHERE id_siswa = ?', [id]);
    await pool.query('UPDATE mapel_siswa SET deleted_at = NOW() WHERE id_siswa = ?', [id]);
    revalidatePath('/tu/kesiswaan');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}

export async function nonaktifkanSiswa(id: number) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('UPDATE siswa SET aktif = 0 WHERE id_siswa = ?', [id]);
    await pool.query(
      'UPDATE siswa_kelas SET deleted_at = NOW(), status = 2 WHERE id_siswa = ? AND deleted_at IS NULL',
      [id]
    );
    await pool.query(
      'UPDATE mapel_siswa SET deleted_at = NOW() WHERE id_siswa = ? AND deleted_at IS NULL',
      [id]
    );
    revalidatePath('/tu/kesiswaan');
    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menonaktifkan siswa' } as const;
  }
}
