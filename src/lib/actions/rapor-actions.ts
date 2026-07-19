'use server';

import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { SEKOLAH_ID } from '@/lib/constants';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';

export interface SekolahInfo {
  nama_sekolah: string;
  alamat: string;
  logo: string | null;
  nama_kepsek: string;
  nip_kepsek: string;
}

export async function getSekolahInfo(): Promise<SekolahInfo | null> {
  const session = await auth();
  if (!session?.user) return null;

  try {
    const [sekolahRows]: any = await pool.query(
      'SELECT nama_sekolah, alamat, logo FROM sekolah WHERE id_sekolah = ?',
      [SEKOLAH_ID]
    );
    const s = sekolahRows[0];
    if (!s) return null;

    const sekolah = await getSekolahWithFilter();
    const [ksRows]: any = await pool.query(
      'SELECT nama, nip FROM kepala_sekolah WHERE tahun = ? AND semester = ? LIMIT 1',
      [sekolah.tahun, sekolah.semester]
    );
    const ks = ksRows[0] || {};

    return {
      nama_sekolah: s.nama_sekolah || '',
      alamat: s.alamat || '',
      logo: s.logo || null,
      nama_kepsek: ks.nama || '',
      nip_kepsek: ks.nip || '',
    };
  } catch (error) {
    console.error('Sekolah info error:', error);
    return null;
  }
}

export async function getSiswaRapor(tahun: number, semester: number, id_kelas: number) {
  const session = await auth();
  if (!session?.user) return [];

  try {
    const [rows]: any = await pool.query(`
      SELECT sk.id_siswa_kelas, sk.id_kelas, s.id_siswa, s.nama_siswa, s.nis, s.nisn,
             k.nama_kelas
      FROM siswa_kelas sk
      JOIN siswa s ON sk.id_siswa = s.id_siswa
      JOIN kelas k ON sk.id_kelas = k.id_kelas
      WHERE sk.tahun = ? AND sk.semester = ? AND sk.id_kelas = ? AND sk.deleted_at IS NULL AND s.deleted_at IS NULL
      ORDER BY s.nama_siswa ASC
    `, [tahun, semester, id_kelas]);
    return rows;
  } catch (error) {
    console.error('Siswa rapor fetch error:', error);
    return [];
  }
}
