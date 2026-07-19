'use server';

import { requireGuru } from '@/lib/actions/auth-guard';
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
