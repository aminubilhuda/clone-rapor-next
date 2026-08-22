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

    const search = searchParams.get('search')?.trim() || '';
    const idKelas = searchParams.get('id_kelas');
    const idJurusan = searchParams.get('id_jurusan');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || searchParams.get('per_page') || '20', 10)));
    const offset = (page - 1) * limit;

    let whereSql = `WHERE s.deleted_at IS NULL AND s.aktif = 1`;
    const countParams: any[] = [];
    const queryParams: any[] = [tahun, semester];

    if (search) {
      whereSql += ` AND (s.nama_siswa LIKE ? OR s.nis LIKE ? OR s.nisn LIKE ? OR s.username LIKE ?)`;
      const like = `%${search}%`;
      countParams.push(like, like, like, like);
      queryParams.push(like, like, like, like);
    }

    if (idJurusan) {
      whereSql += ` AND s.jurusan = ?`;
      countParams.push(idJurusan);
      queryParams.push(idJurusan);
    }

    if (idKelas) {
      whereSql += ` AND sk.id_kelas = ?`;
      countParams.push(idKelas);
      queryParams.push(idKelas);
    }

    // Hitung total data
    const [countResult]: any = await pool.query(
      `SELECT COUNT(DISTINCT s.id_siswa) as total
       FROM siswa s
       LEFT JOIN (
         SELECT id_siswa, id_kelas FROM siswa_kelas
         WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
         GROUP BY id_siswa, id_kelas
       ) sk ON s.id_siswa = sk.id_siswa
       ${whereSql}`,
      [tahun, semester, ...countParams]
    );

    const total = Number(countResult[0]?.total) || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Ambil data siswa paginated
    queryParams.push(limit, offset);
    const [rows]: any = await pool.query(
      `SELECT s.id_siswa, s.nama_siswa, s.nis, s.nisn, s.nik_pd,
              s.tempat_lahir, s.tanggal_lahir, s.kontak_siswa, s.alamat,
              s.terima_kelas, s.sekolah_asal, s.foto,
              jk.jenis_kelamin, a.agama,
              kk.id_kompetensi_keahlian as id_jurusan, kk.kompetensi_keahlian as nama_jurusan,
              k.id_kelas, k.nama_kelas
       FROM siswa s
       LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
       LEFT JOIN agama a ON s.agama = a.id_agama
       LEFT JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
       LEFT JOIN (
         SELECT id_siswa, id_kelas FROM siswa_kelas
         WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
         GROUP BY id_siswa, id_kelas
       ) sk ON s.id_siswa = sk.id_siswa
       LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
       ${whereSql}
       ORDER BY s.id_siswa ASC
       LIMIT ? OFFSET ?`,
      queryParams
    );

    const data = rows.map((s: any) => ({
      id_siswa: s.id_siswa,
      nama_siswa: s.nama_siswa,
      nis: s.nis || null,
      nisn: s.nisn || null,
      nik: s.nik_pd || null,
      jenis_kelamin: s.jenis_kelamin || null,
      agama: s.agama || null,
      tempat_lahir: s.tempat_lahir || null,
      tanggal_lahir: s.tanggal_lahir ? new Date(s.tanggal_lahir).toISOString().split('T')[0] : null,
      kontak: s.kontak_siswa || null,
      alamat: s.alamat || null,
      jurusan: s.id_jurusan
        ? {
            id_jurusan: s.id_jurusan,
            nama_jurusan: s.nama_jurusan,
          }
        : null,
      kelas_aktif: s.id_kelas
        ? {
            id_kelas: s.id_kelas,
            nama_kelas: s.nama_kelas,
            tahun,
            semester,
          }
        : null,
      foto: s.foto ? `/api/uploads/siswa/${s.foto}` : null,
    }));

    return apiSuccess(data, 'Daftar siswa berhasil diambil', {
      page,
      perPage: limit,
      total,
      totalPages,
      tahun,
      semester,
    });
  } catch (error: any) {
    console.error('API /siswa error:', error);
    return apiError('Gagal mengambil data siswa', 500, error.message);
  }
}
