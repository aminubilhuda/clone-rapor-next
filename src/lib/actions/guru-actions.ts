'use server';

import { requireGuru } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';

export interface GuruTugas {
  isWaliKelas: boolean;
  isPembinaEkstra: boolean;
  isPembinaOrganisasi: boolean;
  isGuruMapel: boolean;
  isPiketHarian: boolean;
  isPembimbingPrakerin: boolean;
  isP5BK: boolean;
  isKokurikuler: boolean;
  isGuruBK: boolean;
  kelasList: { id_kelas: number; nama_kelas: string }[];
  ekstraList: { id_eskul: number; nama_eskul: string }[];
  organisasiList: { id_organisasi: number; nama_organisasi: string }[];
}

export async function getGuruTugas(): Promise<GuruTugas | null> {
  const authResult = await requireGuru();
  if (authResult.error || !authResult.user) return null;

  const idUser = authResult.user.id_user;
  const sekolah = await getSekolahWithFilter();
  const { tahun, semester } = sekolah;

  try {
    const [
      [waliRows],
      [ekstraRows],
      [orgRows],
      [mapelRows],
      [prakerinRows],
      [p5bkRows],
      [kokurikulerRows],
    ]: any = await Promise.all([
      pool.query(
        `SELECT k.id_kelas, k.nama_kelas
         FROM kelas_wali kw
         JOIN kelas k ON kw.id_kelas = k.id_kelas
         WHERE kw.id_user = ? AND kw.tahun = ? AND kw.semester = ?
           AND kw.deleted_at IS NULL`,
        [idUser, tahun, semester]
      ),
      pool.query(
        `SELECT e.id_eskul, e.nama_eskul
         FROM pembina_eskul pe
         JOIN eskul e ON pe.id_eskul = e.id_eskul
         WHERE pe.id_user = ? AND pe.tahun = ? AND pe.semester = ?`,
        [idUser, tahun, semester]
      ),
      pool.query(
        `SELECT o.id_organisasi, o.nama_organisasi
         FROM pembina_organisasi po
         JOIN organisasi o ON po.id_organisasi = o.id_organisasi
         WHERE po.id_user = ? AND po.tahun = ? AND po.semester = ?`,
        [idUser, tahun, semester]
      ),
      pool.query(
        `SELECT 1 FROM mapel_kelas
         WHERE id_user = ? AND tahun = ? AND semester = ? LIMIT 1`,
        [idUser, tahun, semester]
      ),
      pool.query(
        `SELECT 1 FROM prakerin WHERE id_user = ? AND tahun = ? AND semester = ? LIMIT 1`,
        [idUser, tahun, semester]
      ),
      pool.query(
        `SELECT 1 FROM proyek_kelas WHERE id_user = ? AND tahun = ? AND semester = ? LIMIT 1`,
        [idUser, tahun, semester]
      ),
      pool.query(
        `SELECT 1 FROM nilai_kokurikuler nk
         JOIN proyek_kelas pk ON nk.id_proyek_kelas = pk.id_proyek_kelas
         WHERE pk.id_user = ? AND nk.tahun = ? AND nk.semester = ? LIMIT 1`,
        [idUser, tahun, semester]
      ),
    ]);

    const [piketRows]: any = await pool.query(
      `SELECT 1 FROM piket_harian WHERE id_user = ? LIMIT 1`,
      [idUser]
    );

    const [guruBKRows]: any = await pool.query(
      `SELECT 1 FROM users WHERE id_user = ? AND moto = '1' LIMIT 1`,
      [idUser]
    );

    return {
      isWaliKelas: waliRows.length > 0,
      isPembinaEkstra: ekstraRows.length > 0,
      isPembinaOrganisasi: orgRows.length > 0,
      isGuruMapel: mapelRows.length > 0,
      isPiketHarian: piketRows.length > 0,
      isPembimbingPrakerin: prakerinRows.length > 0,
      isP5BK: p5bkRows.length > 0,
      isKokurikuler: kokurikulerRows.length > 0,
      isGuruBK: guruBKRows.length > 0,
      kelasList: waliRows.map((r: any) => ({ id_kelas: r.id_kelas, nama_kelas: r.nama_kelas })),
      ekstraList: ekstraRows.map((r: any) => ({ id_eskul: r.id_eskul, nama_eskul: r.nama_eskul })),
      organisasiList: orgRows.map((r: any) => ({ id_organisasi: r.id_organisasi, nama_organisasi: r.nama_organisasi })),
    };
  } catch {
    return null;
  }
}
