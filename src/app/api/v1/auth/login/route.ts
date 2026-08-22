import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { signApiJwt } from '@/lib/api-jwt';
import { apiSuccess, apiError, apiOptionsResponse } from '@/lib/api-response';
import { JABATAN } from '@/lib/constants';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return apiOptionsResponse();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return apiError('Username dan password wajib diisi', 400, 'BAD_REQUEST');
    }

    // 1. Cek tabel users (Staff: Super Admin, TU Admin, Guru)
    const [staffRows]: any = await pool.query(
      `SELECT u.id_user, u.username, u.nama, u.password, u.jabatan, u.nip, u.nuptk, u.kontak,
              j.jabatan as nama_jabatan, IFNULL(u.moto, '') AS moto
       FROM users u
       LEFT JOIN jabatan j ON u.jabatan = j.id_jabatan
       WHERE u.username = ? AND u.deleted_at IS NULL
       LIMIT 1`,
      [username]
    );

    if (staffRows.length > 0) {
      const user = staffRows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return apiError('Username atau password salah', 401, 'INVALID_CREDENTIALS');
      }

      let roleName: 'super_admin' | 'tu_admin' | 'guru' | 'unknown' = 'unknown';
      if (user.jabatan === JABATAN.SUPER_ADMIN) roleName = 'super_admin';
      else if (user.jabatan === JABATAN.TU_ADMIN) roleName = 'tu_admin';
      else if (user.jabatan === JABATAN.GURU) roleName = 'guru';

      const token = signApiJwt({
        id_user: user.id_user,
        username: user.username,
        nama: user.nama,
        jabatan: user.jabatan,
        role: roleName,
        moto: user.moto,
      });

      return apiSuccess(
        {
          token,
          tokenType: 'Bearer',
          expiresIn: 7 * 24 * 60 * 60,
          user: {
            id_user: user.id_user,
            username: user.username,
            nama: user.nama,
            jabatan: user.jabatan,
            nama_jabatan: user.nama_jabatan,
            role: roleName,
            nip: user.nip || null,
            nuptk: user.nuptk || null,
            kontak: user.kontak || null,
            is_bk: user.moto === '1',
          },
        },
        'Login berhasil'
      );
    }

    // 2. Cek tabel siswa
    const [siswaRows]: any = await pool.query(
      `SELECT s.id_siswa, s.username, s.nama_siswa, s.password, s.nis, s.nisn,
              s.kontak_siswa, s.jurusan, kk.kompetensi_keahlian
       FROM siswa s
       LEFT JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
       WHERE s.username = ? AND s.aktif = 1 AND s.deleted_at IS NULL
       LIMIT 1`,
      [username]
    );

    if (siswaRows.length > 0) {
      const siswa = siswaRows[0];
      const isMatch = await bcrypt.compare(password, siswa.password);

      if (!isMatch) {
        return apiError('Username atau password salah', 401, 'INVALID_CREDENTIALS');
      }

      const token = signApiJwt({
        id_siswa: siswa.id_siswa,
        username: siswa.username,
        nama: siswa.nama_siswa,
        jabatan: JABATAN.SISWA,
        role: 'siswa',
      });

      return apiSuccess(
        {
          token,
          tokenType: 'Bearer',
          expiresIn: 7 * 24 * 60 * 60,
          user: {
            id_siswa: siswa.id_siswa,
            username: siswa.username,
            nama: siswa.nama_siswa,
            jabatan: JABATAN.SISWA,
            nama_jabatan: 'Siswa',
            role: 'siswa',
            nis: siswa.nis || null,
            nisn: siswa.nisn || null,
            kontak: siswa.kontak_siswa || null,
            jurusan: siswa.kompetensi_keahlian || null,
          },
        },
        'Login siswa berhasil'
      );
    }

    return apiError('Username atau password salah', 401, 'INVALID_CREDENTIALS');
  } catch (error: any) {
    console.error('API login error:', error);
    return apiError('Terjadi kesalahan server saat proses login', 500, error.message);
  }
}
