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
  const idEskul = parseInt(id, 10);
  if (isNaN(idEskul)) {
    return apiError('ID ekstrakurikuler tidak valid', 400, 'BAD_REQUEST');
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

    const [eskulRows]: any = await pool.query(
      `SELECT e.id_eskul, e.nama_eskul, e.kode,
              u.id_user as id_pembina, u.nama as nama_pembina, u.nip as nip_pembina
       FROM eskul e
       LEFT JOIN pembina_eskul pe ON e.id_eskul = pe.id_eskul AND pe.tahun = ? AND pe.semester = ?
       LEFT JOIN users u ON pe.id_user = u.id_user
       WHERE e.id_eskul = ? AND e.deleted_at IS NULL`,
      [tahun, semester, idEskul]
    );

    if (eskulRows.length === 0) {
      return apiError('Ekstrakurikuler tidak ditemukan', 404, 'NOT_FOUND');
    }

    const eskul = eskulRows[0];

    const [anggotaRows]: any = await pool.query(
      `SELECT se.id_siswa_eskul, se.id_siswa, s.nama_siswa, s.nis, s.nisn,
              k.nama_kelas, se.predikat, se.keterangan
       FROM siswa_eskul se
       JOIN siswa s ON se.id_siswa = s.id_siswa
       LEFT JOIN (
         SELECT id_siswa, id_kelas FROM siswa_kelas
         WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
         GROUP BY id_siswa, id_kelas
       ) sk ON s.id_siswa = sk.id_siswa
       LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
       WHERE se.id_eskul = ? AND se.tahun = ? AND se.semester = ?
         AND s.deleted_at IS NULL AND s.aktif = 1
       ORDER BY s.nama_siswa ASC`,
      [tahun, semester, idEskul, tahun, semester]
    );

    const data = {
      ekstrakurikuler: {
        id_eskul: eskul.id_eskul,
        nama_eskul: eskul.nama_eskul,
        kode: eskul.kode,
        pembina: eskul.id_pembina
          ? {
              id_user: eskul.id_pembina,
              nama: eskul.nama_pembina,
              nip: eskul.nip_pembina || null,
            }
          : null,
        tahun,
        semester,
      },
      total_anggota: anggotaRows.length,
      anggota: anggotaRows.map((a: any) => ({
        id_siswa_eskul: a.id_siswa_eskul,
        id_siswa: a.id_siswa,
        nama_siswa: a.nama_siswa,
        nis: a.nis,
        nisn: a.nisn,
        kelas: a.nama_kelas || null,
        predikat: a.predikat || null,
        keterangan: a.keterangan || null,
      })),
    };

    return apiSuccess(data, `Anggota ekstrakurikuler ${eskul.nama_eskul} berhasil diambil`);
  } catch (error: any) {
    console.error('API /ekskul/[id]/anggota error:', error);
    return apiError('Gagal mengambil data anggota ekstrakurikuler', 500, error.message);
  }
}
