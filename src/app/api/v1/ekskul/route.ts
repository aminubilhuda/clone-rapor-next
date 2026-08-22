import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { SEKOLAH_ID } from '@/lib/constants';
import { requireApiAuth } from '@/lib/api-auth-guard';
import { apiSuccess, apiError, apiOptionsResponse } from '@/lib/api-response';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return apiOptionsResponse();
}

export async function GET(req: NextRequest) {
  const authResult = await requireApiAuth(req);
  if (!authResult.authorized) {
    return authResult.errorResponse!;
  }

  try {
    const { searchParams } = new URL(req.url);

    let tahun = parseInt(searchParams.get('tahun') || '', 10);
    let semester = parseInt(searchParams.get('semester') || '', 10);

    if (isNaN(tahun) || isNaN(semester)) {
      const [sekolahRows]: any = await pool.query(
        'SELECT tahun, semester FROM sekolah WHERE id_sekolah = ?',
        [SEKOLAH_ID]
      );
      if (isNaN(tahun)) tahun = sekolahRows[0]?.tahun || 1;
      if (isNaN(semester)) semester = sekolahRows[0]?.semester || 1;
    }

    const [rows]: any = await pool.query(
      `SELECT e.id_eskul, e.nama_eskul, e.kode,
              pe.id_pembina_eskul, u.id_user as id_pembina, u.nama as nama_pembina, u.nip as nip_pembina,
              COUNT(DISTINCT se.id_siswa) as total_anggota
       FROM eskul e
       LEFT JOIN pembina_eskul pe ON e.id_eskul = pe.id_eskul AND pe.tahun = ? AND pe.semester = ?
       LEFT JOIN users u ON pe.id_user = u.id_user
       LEFT JOIN siswa_eskul se ON e.id_eskul = se.id_eskul AND se.tahun = ? AND se.semester = ?
       WHERE e.deleted_at IS NULL
       GROUP BY e.id_eskul, e.nama_eskul, e.kode, pe.id_pembina_eskul, u.id_user, u.nama, u.nip
       ORDER BY e.nama_eskul ASC`,
      [tahun, semester, tahun, semester]
    );

    const data = rows.map((r: any) => ({
      id_eskul: r.id_eskul,
      nama_eskul: r.nama_eskul,
      kode: r.kode || null,
      pembina: r.id_pembina
        ? {
            id_user: r.id_pembina,
            nama: r.nama_pembina,
            nip: r.nip_pembina || null,
          }
        : null,
      total_anggota: Number(r.total_anggota) || 0,
      tahun,
      semester,
    }));

    return apiSuccess(data, 'Daftar ekstrakurikuler berhasil diambil', {
      tahun,
      semester,
      total: data.length,
    });
  } catch (error: any) {
    console.error('API /ekskul error:', error);
    return apiError('Gagal mengambil data ekstrakurikuler', 500, error.message);
  }
}
