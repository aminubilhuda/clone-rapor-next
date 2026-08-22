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
    const [sekolahRows]: any = await pool.query(
      'SELECT tahun, semester FROM sekolah WHERE id_sekolah = ?',
      [SEKOLAH_ID]
    );
    const activeTahun = sekolahRows[0]?.tahun;
    const activeSemester = sekolahRows[0]?.semester;

    const [tahunList]: any = await pool.query(
      'SELECT id_tahun_pelajaran, tahun_pelajaran FROM tahun_pelajaran WHERE deleted_at IS NULL ORDER BY id_tahun_pelajaran ASC'
    );
    const [semesterList]: any = await pool.query(
      'SELECT id_semester, semester as nama_semester FROM semester WHERE deleted_at IS NULL ORDER BY id_semester ASC'
    );

    const data = {
      periode_aktif: {
        id_tahun: activeTahun,
        id_semester: activeSemester,
      },
      tahun_pelajaran: tahunList.map((t: any) => ({
        id_tahun_pelajaran: t.id_tahun_pelajaran,
        tahun_pelajaran: t.tahun_pelajaran,
        is_aktif: t.id_tahun_pelajaran === activeTahun,
      })),
      semester: semesterList.map((s: any) => ({
        id_semester: s.id_semester,
        nama_semester: s.nama_semester,
        is_aktif: s.id_semester === activeSemester,
      })),
    };

    return apiSuccess(data, 'Daftar tahun pelajaran dan semester berhasil diambil');
  } catch (error: any) {
    console.error('API /periode error:', error);
    return apiError('Gagal mengambil data periode', 500, error.message);
  }
}
