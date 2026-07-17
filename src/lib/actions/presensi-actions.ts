'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { revalidatePath } from 'next/cache';

export async function cekPiketHariIni() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) return false;

  const [rows]: any = await pool.query(
    `SELECT 1 FROM piket_harian WHERE id_user = ? AND id_harian = WEEKDAY(NOW()) + 1 LIMIT 1`,
    [session.user.id_user]
  );
  return rows.length > 0;
}

export async function getKelasList() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) return [];

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
}

export async function getSiswaKelas(idKelas: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) return [];

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
}

export async function cekAbsensiHariIni(idKelas: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) return { sudahAbsen: false };

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
}

export async function savePresensiHarian(
  idKelas: number,
  absensi: { id_siswa: number; id_absen: number }[]
) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const sekolah = await getSekolahWithFilter();
  const tanggal = new Date().toISOString().slice(0, 10);
  const bulan = String(new Date().getMonth() + 1).padStart(2, '0');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `DELETE FROM presensi WHERE tanggal = ? AND id_kelas = ? AND tahun = ? AND semester = ?`,
      [tanggal, idKelas, sekolah.tahun, sekolah.semester]
    );

    const tidakHadir = absensi.filter((a) => a.id_absen !== 1);
    if (tidakHadir.length > 0) {
      const values = tidakHadir.map((a) => [
        sekolah.tahun, sekolah.semester, bulan, tanggal,
        idKelas, a.id_siswa, a.id_absen, 1,
      ]);
      await conn.query(
        `INSERT INTO presensi (tahun, semester, bulan, tanggal, id_kelas, id_siswa, id_absen, jumlah)
         VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    revalidatePath('/guru/absensi-piket');
    return { success: true, count: tidakHadir.length } as const;
  } catch (e: any) {
    await conn.rollback();
    return { success: false, error: e.message || 'Gagal menyimpan absensi' } as const;
  } finally {
    conn.release();
  }
}
