import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
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
    const [rows]: any = await pool.query(`
      SELECT kk.id_kompetensi_keahlian, kk.kompetensi_keahlian, kk.deskripsi, kk.banner,
             COUNT(DISTINCT s.id_siswa) AS total_siswa
      FROM kompetensi_keahlian kk
      LEFT JOIN siswa s ON s.jurusan = kk.id_kompetensi_keahlian AND s.aktif = 1 AND s.deleted_at IS NULL
      WHERE kk.deleted_at IS NULL
      GROUP BY kk.id_kompetensi_keahlian, kk.kompetensi_keahlian, kk.deskripsi, kk.banner
      ORDER BY kk.id_kompetensi_keahlian ASC
    `);

    const data = rows.map((r: any) => ({
      id_jurusan: r.id_kompetensi_keahlian,
      nama_jurusan: r.kompetensi_keahlian,
      deskripsi: r.deskripsi || '',
      banner: r.banner || null,
      total_siswa: Number(r.total_siswa) || 0,
    }));

    return apiSuccess(data, 'Daftar jurusan berhasil diambil');
  } catch (error: any) {
    console.error('API /jurusan error:', error);
    return apiError('Gagal mengambil data jurusan', 500, error.message);
  }
}
