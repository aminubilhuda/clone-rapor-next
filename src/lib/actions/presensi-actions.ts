'use server';

import { requireGuru, requireGuruBK } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

export async function cekPiketHariIni() {
  const authResult = await requireGuru();
  if (authResult.error || !authResult.user) return false;

  try {
    const [rows]: any = await pool.query(
      `SELECT 1 FROM piket_harian WHERE id_user = ? AND id_harian = WEEKDAY(NOW()) + 1 LIMIT 1`,
      [authResult.user.id_user]
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function getKelasList() {
  const authResult = await requireGuru();
  if (authResult.error) return [];

  try {
    const sekolah = await getSekolahWithFilter();
    const [rows]: any = await pool.query(
      `SELECT k.id_kelas, k.nama_kelas, COUNT(sk.id_siswa) AS jumlah,
          EXISTS(
            SELECT 1 FROM presensi p
            WHERE p.id_kelas = k.id_kelas AND p.tanggal = CURDATE()
              AND p.tahun = ? AND p.semester = ? AND p.deleted_at IS NULL
          ) AS sudah_absen
        FROM siswa_kelas sk
        JOIN kelas k ON sk.id_kelas = k.id_kelas
        JOIN siswa s ON sk.id_siswa = s.id_siswa
        WHERE sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL AND s.deleted_at IS NULL AND s.aktif = 1
        GROUP BY k.id_kelas, k.nama_kelas
        ORDER BY k.nama_kelas ASC`,
      [sekolah.tahun, sekolah.semester, sekolah.tahun, sekolah.semester]
    );
    return rows;
  } catch {
    return [];
  }
}

export async function getSiswaKelas(idKelas: number) {
  const authResult = await requireGuru();
  if (authResult.error) return [];

  try {
    const sekolah = await getSekolahWithFilter();
    const [rows]: any = await pool.query(
      `SELECT s.id_siswa, s.nama_siswa
        FROM siswa s
        JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa
        WHERE sk.id_kelas = ? AND sk.tahun = ? AND sk.semester = ?
          AND sk.deleted_at IS NULL AND s.deleted_at IS NULL AND s.aktif = 1
        ORDER BY s.nama_siswa ASC`,
      [idKelas, sekolah.tahun, sekolah.semester]
    );
    return rows;
  } catch {
    return [];
  }
}

export async function cekAbsensiHariIni(idKelas: number) {
  const authResult = await requireGuru();
  if (authResult.error) return { sudahAbsen: false };

  try {
    const sekolah = await getSekolahWithFilter();
    const [rows]: any = await pool.query(
      `SELECT p.id_siswa, s.nama_siswa, a.absen, a.sort
        FROM presensi p
        JOIN siswa s ON p.id_siswa = s.id_siswa
        JOIN absen a ON p.id_absen = a.id_absen
        WHERE p.tanggal = CURDATE() AND p.id_kelas = ? AND p.tahun = ? AND p.semester = ?
          AND p.deleted_at IS NULL
        ORDER BY s.nama_siswa ASC, a.sort ASC`,
      [idKelas, sekolah.tahun, sekolah.semester]
    );
    return { sudahAbsen: rows.length > 0, data: rows };
  } catch {
    return { sudahAbsen: false, data: [] };
  }
}

export async function savePresensiHarian(
  idKelas: number,
  absensi: { id_siswa: number; id_absen: number }[]
) {
  const authResult = await requireGuru();
  if (authResult.error) {
    return { success: false, error: authResult.error } as const;
  }

  const sekolah = await getSekolahWithFilter();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[dateRow]]: any = await conn.query('SELECT CURDATE() AS tanggal, DATE_FORMAT(CURDATE(), "%m") AS bulan');
    const tanggal = dateRow.tanggal;
    const bulan = dateRow.bulan;

    await conn.query(
      `DELETE FROM presensi WHERE tanggal = ? AND id_kelas = ? AND tahun = ? AND semester = ?`,
      [tanggal, idKelas, sekolah.tahun, sekolah.semester]
    );

    const values = absensi.map((a) => [
      sekolah.tahun, sekolah.semester, bulan, tanggal,
      idKelas, a.id_siswa, a.id_absen, 1,
    ]);
    await conn.query(
      `INSERT INTO presensi (tahun, semester, bulan, tanggal, id_kelas, id_siswa, id_absen, jumlah)
       VALUES ?`,
      [values]
    );

    await conn.commit();
    revalidatePath('/guru/absensi-piket');
    return { success: true, count: absensi.length } as const;
  } catch (e: any) {
    await conn.rollback();
    return { success: false, error: 'Gagal menyimpan absensi' } as const;
  } finally {
    conn.release();
  }
}

export async function getKelasListForBK() {
  const authResult = await requireGuruBK();
  if (authResult.error) return [];

  try {
    const sekolah = await getSekolahWithFilter();
    const [rows]: any = await pool.query(
      `SELECT k.id_kelas, k.nama_kelas, COUNT(sk.id_siswa) AS jumlah
        FROM siswa_kelas sk
        JOIN kelas k ON sk.id_kelas = k.id_kelas
        JOIN siswa s ON sk.id_siswa = s.id_siswa
        WHERE sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL AND s.deleted_at IS NULL AND s.aktif = 1
        GROUP BY k.id_kelas, k.nama_kelas
        ORDER BY k.nama_kelas ASC`,
      [sekolah.tahun, sekolah.semester]
    );
    return rows;
  } catch {
    return [];
  }
}

export async function getRekapAbsensiBK(idKelas: number) {
  const authResult = await requireGuruBK();
  if (authResult.error) return [];

  try {
    const sekolah = await getSekolahWithFilter();
    const [rows]: any = await pool.query(
      `SELECT s.id_siswa, s.nama_siswa,
              IFNULL(SUM(CASE WHEN p.id_absen = 1 THEN p.jumlah ELSE 0 END), 0) AS hadir,
              IFNULL(SUM(CASE WHEN p.id_absen = 2 THEN p.jumlah ELSE 0 END), 0) AS sakit,
              IFNULL(SUM(CASE WHEN p.id_absen = 3 THEN p.jumlah ELSE 0 END), 0) AS izin,
              IFNULL(SUM(CASE WHEN p.id_absen = 4 THEN p.jumlah ELSE 0 END), 0) AS tanpa_berita
       FROM siswa s
       JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa
       LEFT JOIN presensi p ON p.id_siswa = s.id_siswa AND p.id_kelas = sk.id_kelas
         AND p.tahun = ? AND p.semester = ? AND p.deleted_at IS NULL
       WHERE sk.tahun = ? AND sk.semester = ? AND sk.id_kelas = ?
         AND sk.deleted_at IS NULL AND s.aktif = 1
       GROUP BY s.id_siswa, s.nama_siswa
       ORDER BY s.nama_siswa ASC`,
      [sekolah.tahun, sekolah.semester, sekolah.tahun, sekolah.semester, idKelas]
    );
    return rows;
  } catch {
    return [];
  }
}

export async function updatePresensiInline(
  idSiswa: number,
  idKelas: number,
  idAbsen: number,
  jumlah: number
) {
  const authResult = await requireGuruBK();
  if (authResult.error) {
    return { success: false, error: authResult.error } as const;
  }

  const sekolah = await getSekolahWithFilter();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [[existing]]: any = await conn.query(
      `SELECT id_presensi, jumlah FROM presensi
       WHERE id_siswa = ? AND id_kelas = ? AND id_absen = ?
         AND tahun = ? AND semester = ? AND deleted_at IS NULL`,
      [idSiswa, idKelas, idAbsen, sekolah.tahun, sekolah.semester]
    );

    if (jumlah <= 0) {
      if (existing) {
        await conn.query(
          `UPDATE presensi SET deleted_at = NOW() WHERE id_presensi = ?`,
          [existing.id_presensi]
        );
      }
    } else if (existing) {
      await conn.query(
        `UPDATE presensi SET jumlah = ? WHERE id_presensi = ?`,
        [jumlah, existing.id_presensi]
      );
    } else {
      const [[dateRow]]: any = await conn.query('SELECT DATE_FORMAT(CURDATE(), "%m") AS bulan');
      await conn.query(
        `INSERT INTO presensi (tahun, semester, bulan, tanggal, id_kelas, id_siswa, id_absen, jumlah)
         VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
        [sekolah.tahun, sekolah.semester, dateRow.bulan, idKelas, idSiswa, idAbsen, jumlah]
      );
    }

    await conn.commit();
    revalidatePath('/guru/rekap-absensi-bk');
    return { success: true } as const;
  } catch {
    await conn.rollback();
    return { success: false, error: 'Gagal update presensi' } as const;
  } finally {
    conn.release();
  }
}
