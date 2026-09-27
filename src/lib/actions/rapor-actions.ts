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
      `SELECT nama, nip FROM kepala_sekolah
       WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
       ORDER BY id_kepala_sekolah DESC LIMIT 1`,
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
