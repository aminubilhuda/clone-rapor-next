import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { requireApiAuth } from '@/lib/api-auth-guard';
import { apiSuccess, apiError, apiOptionsResponse } from '@/lib/api-response';
import { JABATAN } from '@/lib/constants';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return apiOptionsResponse();
}

export async function GET(req: NextRequest) {
  const authResult = await requireApiAuth(req);
  if (!authResult.authorized || !authResult.user) {
    return authResult.errorResponse!;
  }

  const { user } = authResult;

  try {
    if (user.id_user) {
      const [rows]: any = await pool.query(
        `SELECT u.id_user, u.username, u.nama, u.jabatan, u.nip, u.nuptk, u.kontak,
                j.jabatan as nama_jabatan, k.kepegawaian, tt.tugas_tambahan,
                ag.agama as nama_agama, jk.jenis_kelamin,
                CASE WHEN u.moto = 1 THEN true ELSE false END as is_bk
         FROM users u
         LEFT JOIN jabatan j ON u.jabatan = j.id_jabatan
         LEFT JOIN kepegawaian k ON u.id_kepegawaian = k.id_kepegawaian
         LEFT JOIN tugas_tambahan tt ON u.id_tugas_tambahan = tt.id_tugas_tambahan
         LEFT JOIN agama ag ON u.agama = ag.id_agama
         LEFT JOIN jenis_kelamin jk ON u.kelamin = jk.id_jenis_kelamin
         WHERE u.id_user = ? AND u.deleted_at IS NULL`,
        [user.id_user]
      );

      if (rows.length === 0) {
        return apiError('User tidak ditemukan', 404, 'NOT_FOUND');
      }

      return apiSuccess(rows[0], 'Profil user berhasil diambil');
    }

    if (user.id_siswa) {
      const [rows]: any = await pool.query(
        `SELECT s.id_siswa, s.nama_siswa, s.nis, s.nisn, s.nik_pd, s.tempat_lahir,
                s.tanggal_lahir, s.kontak_siswa, s.alamat, s.terima_kelas, s.sekolah_asal,
                jk.jenis_kelamin, a.agama, kk.kompetensi_keahlian
         FROM siswa s
         LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
         LEFT JOIN agama a ON s.agama = a.id_agama
         LEFT JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
         WHERE s.id_siswa = ? AND s.aktif = 1 AND s.deleted_at IS NULL`,
        [user.id_siswa]
      );

      if (rows.length === 0) {
        return apiError('Siswa tidak ditemukan', 404, 'NOT_FOUND');
      }

      return apiSuccess(rows[0], 'Profil siswa berhasil diambil');
    }

    return apiSuccess(user, 'Profil user berhasil diambil');
  } catch (error: any) {
    console.error('API /auth/me error:', error);
    return apiError('Gagal mengambil data profil', 500, error.message);
  }
}
