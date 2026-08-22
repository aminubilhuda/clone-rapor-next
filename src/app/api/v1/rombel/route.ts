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

    // Ambil default tahun & semester aktif jika tidak di-pass
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

    const idJurusan = searchParams.get('id_jurusan');
    const idTingkat = searchParams.get('id_tingkat');

    let whereClause = 'WHERE 1=1';
    const params: any[] = [tahun, semester, tahun, semester];

    if (idJurusan) {
      whereClause += ' AND k.id_kompetensi_keahlian = ?';
      params.push(idJurusan);
    }
    if (idTingkat) {
      whereClause += ' AND k.id_tingkat = ?';
      params.push(idTingkat);
    }

    const [rows]: any = await pool.query(
      `SELECT k.id_kelas, k.nama_kelas, k.id_tingkat, t.tingkat, t.tabjad,
              k.id_kompetensi_keahlian, kk.kompetensi_keahlian as nama_jurusan,
              kw.id_user as id_wali_kelas, u.nama as nama_wali_kelas, u.nip as nip_wali_kelas,
              COUNT(DISTINCT sk.id_siswa) as jumlah_siswa
       FROM kelas k
       LEFT JOIN tingkat t ON k.id_tingkat = t.id_tingkat
       LEFT JOIN kompetensi_keahlian kk ON k.id_kompetensi_keahlian = kk.id_kompetensi_keahlian
       LEFT JOIN kelas_wali kw ON k.id_kelas = kw.id_kelas AND kw.tahun = ? AND kw.semester = ?
       LEFT JOIN users u ON kw.id_user = u.id_user
       LEFT JOIN siswa_kelas sk ON k.id_kelas = sk.id_kelas AND sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL
       ${whereClause}
       GROUP BY k.id_kelas, k.nama_kelas, k.id_tingkat, t.tingkat, t.tabjad,
                k.id_kompetensi_keahlian, kk.kompetensi_keahlian,
                kw.id_user, u.nama, u.nip
       ORDER BY k.id_tingkat ASC, k.nama_kelas ASC`,
      params
    );

    const data = rows.map((r: any) => ({
      id_kelas: r.id_kelas,
      nama_kelas: r.nama_kelas,
      tingkat: {
        id_tingkat: r.id_tingkat,
        tingkat: r.tingkat,
        tabjad: r.tabjad,
      },
      jurusan: {
        id_jurusan: r.id_kompetensi_keahlian,
        nama_jurusan: r.nama_jurusan || null,
      },
      wali_kelas: r.id_wali_kelas
        ? {
            id_user: r.id_wali_kelas,
            nama: r.nama_wali_kelas,
            nip: r.nip_wali_kelas || null,
          }
        : null,
      jumlah_siswa: Number(r.jumlah_siswa) || 0,
      tahun,
      semester,
    }));

    return apiSuccess(
      data,
      'Daftar rombel berhasil diambil',
      { tahun, semester, total: data.length }
    );
  } catch (error: any) {
    console.error('API /rombel error:', error);
    return apiError('Gagal mengambil data rombel', 500, error.message);
  }
}
