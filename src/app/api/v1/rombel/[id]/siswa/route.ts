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
  const idKelas = parseInt(id, 10);
  if (isNaN(idKelas)) {
    return apiError('ID kelas tidak valid', 400, 'BAD_REQUEST');
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

    // Detail kelas
    const [kelasRows]: any = await pool.query(
      `SELECT k.id_kelas, k.nama_kelas, t.tingkat, kk.kompetensi_keahlian
       FROM kelas k
       LEFT JOIN tingkat t ON k.id_tingkat = t.id_tingkat
       LEFT JOIN kompetensi_keahlian kk ON k.id_kompetensi_keahlian = kk.id_kompetensi_keahlian
       WHERE k.id_kelas = ?`,
      [idKelas]
    );

    if (kelasRows.length === 0) {
      return apiError('Kelas tidak ditemukan', 404, 'NOT_FOUND');
    }

    const kelas = kelasRows[0];

    // Daftar siswa di kelas
    const [siswaRows]: any = await pool.query(
      `SELECT s.id_siswa, s.nama_siswa, s.nis, s.nisn, s.nik_pd,
              jk.jenis_kelamin, a.agama, s.kontak_siswa, s.alamat,
              sk.id_siswa_kelas
       FROM siswa_kelas sk
       JOIN siswa s ON sk.id_siswa = s.id_siswa
       LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
       LEFT JOIN agama a ON s.agama = a.id_agama
       WHERE sk.id_kelas = ? AND sk.tahun = ? AND sk.semester = ?
         AND sk.deleted_at IS NULL AND s.deleted_at IS NULL AND s.aktif = 1
       ORDER BY s.nama_siswa ASC`,
      [idKelas, tahun, semester]
    );

    const data = {
      kelas: {
        id_kelas: kelas.id_kelas,
        nama_kelas: kelas.nama_kelas,
        tingkat: kelas.tingkat,
        jurusan: kelas.kompetensi_keahlian,
        tahun,
        semester,
      },
      total_siswa: siswaRows.length,
      siswa: siswaRows.map((s: any) => ({
        id_siswa: s.id_siswa,
        nama_siswa: s.nama_siswa,
        nis: s.nis,
        nisn: s.nisn,
        nik: s.nik_pd,
        jenis_kelamin: s.jenis_kelamin,
        agama: s.agama,
        kontak: s.kontak_siswa,
        alamat: s.alamat,
      })),
    };

    return apiSuccess(data, `Daftar siswa kelas ${kelas.nama_kelas} berhasil diambil`);
  } catch (error: any) {
    console.error('API /rombel/[id]/siswa error:', error);
    return apiError('Gagal mengambil data siswa kelas', 500, error.message);
  }
}
