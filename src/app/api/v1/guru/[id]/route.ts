import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { SEKOLAH_ID } from '@/lib/constants';
import { requireApiAuth } from '@/lib/api-auth-guard';
import { apiSuccess, apiError, apiOptionsResponse } from '@/lib/api-response';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return apiOptionsResponse();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireApiAuth(req);
  if (!authResult.authorized) {
    return authResult.errorResponse!;
  }

  const { id } = await params;
  const idUser = parseInt(id, 10);
  if (isNaN(idUser)) {
    return apiError('ID guru tidak valid', 400, 'BAD_REQUEST');
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
       WHERE u.id_user = ? AND u.deleted_at IS NULL`,
      [idUser]
    );

    if (rows.length === 0) {
      return apiError('Guru / Pegawai tidak ditemukan', 404, 'NOT_FOUND');
    }

    const u = rows[0];

    // Ambil daftar mapel yang diampu guru ini pada periode aktif
    const [mapelPengampu]: any = await pool.query(
      `SELECT mk.id_mapel_kelas, m.id_mapel, m.nama_mapel, m.s_mapel as kode,
              k.id_kelas, k.nama_kelas, t.tingkat
       FROM mapel_kelas mk
       JOIN mapel m ON mk.id_mapel = m.id_mapel
       JOIN kelas k ON mk.id_kelas = k.id_kelas
       LEFT JOIN tingkat t ON k.id_tingkat = t.id_tingkat
       WHERE mk.id_user = ? AND mk.tahun = ? AND mk.semester = ? AND mk.deleted_at IS NULL
       ORDER BY k.id_tingkat ASC, k.nama_kelas ASC, m.nama_mapel ASC`,
      [idUser, tahun, semester]
    );

    // Ambil info wali kelas jika guru ini adalah wali kelas
    const [waliKelas]: any = await pool.query(
      `SELECT kw.id_kelas_wali, k.id_kelas, k.nama_kelas, t.tingkat
       FROM kelas_wali kw
       JOIN kelas k ON kw.id_kelas = k.id_kelas
       LEFT JOIN tingkat t ON k.id_tingkat = t.id_tingkat
       WHERE kw.id_user = ? AND kw.tahun = ? AND kw.semester = ?`,
      [idUser, tahun, semester]
    );

    const data = {
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
      tahun,
      semester,
      wali_di_kelas: waliKelas.map((wk: any) => ({
        id_kelas: wk.id_kelas,
        nama_kelas: wk.nama_kelas,
        tingkat: wk.tingkat,
      })),
      mapel_diampu: mapelPengampu.map((m: any) => ({
        id_mapel_kelas: m.id_mapel_kelas,
        id_mapel: m.id_mapel,
        nama_mapel: m.nama_mapel,
        kode: m.kode,
        id_kelas: m.id_kelas,
        nama_kelas: m.nama_kelas,
        tingkat: m.tingkat,
      })),
    };

    return apiSuccess(data, 'Detail profil guru berhasil diambil');
  } catch (error: any) {
    console.error('API /guru/[id] error:', error);
    return apiError('Gagal mengambil detail guru', 500, error.message);
  }
}
