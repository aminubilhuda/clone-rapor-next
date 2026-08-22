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
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';
    const jabatanParam = searchParams.get('jabatan');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || searchParams.get('per_page') || '50', 10)));
    const offset = (page - 1) * limit;

    let whereSql = `WHERE u.deleted_at IS NULL`;
    const countParams: any[] = [];
    const queryParams: any[] = [];

    if (search) {
      whereSql += ` AND (u.nama LIKE ? OR u.nip LIKE ? OR u.nuptk LIKE ? OR u.username LIKE ?)`;
      const like = `%${search}%`;
      countParams.push(like, like, like, like);
      queryParams.push(like, like, like, like);
    }

    if (jabatanParam) {
      whereSql += ` AND u.jabatan = ?`;
      countParams.push(jabatanParam);
      queryParams.push(jabatanParam);
    }

    // Total count
    const [countResult]: any = await pool.query(
      `SELECT COUNT(u.id_user) as total FROM users u ${whereSql}`,
      countParams
    );
    const total = Number(countResult[0]?.total) || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    queryParams.push(limit, offset);
    const [rows]: any = await pool.query(
      `SELECT u.id_user, u.username, u.nama, u.nip, u.nuptk, u.kontak,
              u.jabatan, j.jabatan as nama_jabatan,
              k.kepegawaian, tt.tugas_tambahan,
              ag.agama as nama_agama, jk.jenis_kelamin,
              CASE WHEN u.moto = 1 THEN true ELSE false END as is_bk
       FROM users u
       LEFT JOIN jabatan j ON u.jabatan = j.id_jabatan
       LEFT JOIN kepegawaian k ON u.id_kepegawaian = k.id_kepegawaian
       LEFT JOIN tugas_tambahan tt ON u.id_tugas_tambahan = tt.id_tugas_tambahan
       LEFT JOIN agama ag ON u.agama = ag.id_agama
       LEFT JOIN jenis_kelamin jk ON u.kelamin = jk.id_jenis_kelamin
       ${whereSql}
       ORDER BY u.id_user ASC
       LIMIT ? OFFSET ?`,
      queryParams
    );

    const data = rows.map((u: any) => ({
      id_user: u.id_user,
      username: u.username,
      nama: u.nama,
      nip: u.nip || null,
      nuptk: u.nuptk || null,
      kontak: u.kontak || null,
      jabatan: {
        id_jabatan: u.jabatan,
        nama_jabatan: u.nama_jabatan,
      },
      kepegawaian: u.kepegawaian || null,
      tugas_tambahan: u.tugas_tambahan || null,
      agama: u.nama_agama || null,
      jenis_kelamin: u.jenis_kelamin || null,
      is_bk: u.is_bk,
    }));

    return apiSuccess(data, 'Daftar guru & pegawai berhasil diambil', {
      page,
      perPage: limit,
      total,
      totalPages,
    });
  } catch (error: any) {
    console.error('API /guru error:', error);
    return apiError('Gagal mengambil data guru & pegawai', 500, error.message);
  }
}
