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
  if (!authResult.authorized || !authResult.user) {
    return authResult.errorResponse!;
  }

  const { user } = authResult;

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

    let idSiswa = searchParams.get('id_siswa');
    const idKelas = searchParams.get('id_kelas');
    const tanggal = searchParams.get('tanggal');
    const bulan = searchParams.get('bulan');

    // Siswa hanya boleh lihat presensinya sendiri
    if (user.role === 'siswa' && user.id_siswa) {
      idSiswa = String(user.id_siswa);
    }

    let whereSql = `WHERE p.tahun = ? AND p.semester = ? AND p.deleted_at IS NULL`;
    const params: any[] = [tahun, semester];

    if (idSiswa) {
      whereSql += ` AND p.id_siswa = ?`;
      params.push(idSiswa);
    }

    if (idKelas) {
      whereSql += ` AND p.id_kelas = ?`;
      params.push(idKelas);
    }

    if (tanggal) {
      whereSql += ` AND p.tanggal = ?`;
      params.push(tanggal);
    }

    if (bulan) {
      whereSql += ` AND p.bulan = ?`;
      params.push(bulan);
    }

    // Detail data presensi
    const [rows]: any = await pool.query(
      `SELECT p.id_presensi, p.tanggal, p.bulan, p.tahun, p.semester,
              p.id_siswa, s.nama_siswa, s.nis, s.nisn,
              p.id_kelas, k.nama_kelas,
              p.id_absen, a.absen as status_presensi, a.sort as kode_status,
              p.jumlah
       FROM presensi p
       JOIN siswa s ON p.id_siswa = s.id_siswa
       JOIN absen a ON p.id_absen = a.id_absen
       LEFT JOIN kelas k ON p.id_kelas = k.id_kelas
       ${whereSql}
       ORDER BY p.tanggal DESC, s.nama_siswa ASC`,
      params
    );

    // Rekapitulasi presensi jika id_siswa disertakan
    let rekap = null;
    if (idSiswa) {
      const [rekapRows]: any = await pool.query(
        `SELECT a.id_absen, a.absen, a.sort, COALESCE(SUM(p.jumlah), 0) AS total
         FROM absen a
         LEFT JOIN presensi p ON p.id_absen = a.id_absen AND p.id_siswa = ? AND p.tahun = ? AND p.semester = ? AND p.deleted_at IS NULL
         WHERE a.deleted_at IS NULL
         GROUP BY a.id_absen, a.absen, a.sort
         ORDER BY a.id_absen ASC`,
        [idSiswa, tahun, semester]
      );

      rekap = rekapRows.map((r: any) => ({
        id_absen: r.id_absen,
        status: r.absen,
        kode: r.sort,
        total: Number(r.total) || 0,
      }));
    }

    const data = {
      tahun,
      semester,
      rekap,
      total_log: rows.length,
      logs: rows.map((r: any) => ({
        id_presensi: r.id_presensi,
        tanggal: r.tanggal,
        bulan: r.bulan,
        siswa: {
          id_siswa: r.id_siswa,
          nama_siswa: r.nama_siswa,
          nis: r.nis,
          nisn: r.nisn,
        },
        kelas: r.id_kelas
          ? {
              id_kelas: r.id_kelas,
              nama_kelas: r.nama_kelas,
            }
          : null,
        status: {
          id_absen: r.id_absen,
          nama: r.status_presensi,
          kode: r.kode_status,
        },
        jumlah: r.jumlah,
      })),
    };

    return apiSuccess(data, 'Data presensi berhasil diambil');
  } catch (error: any) {
    console.error('API /presensi error:', error);
    return apiError('Gagal mengambil data presensi', 500, error.message);
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireApiAuth(req, ['super_admin', 'tu_admin', 'guru']);
  if (!authResult.authorized) {
    return authResult.errorResponse!;
  }

  try {
    const body = await req.json();
    const { id_siswa, id_kelas, id_absen, tanggal, jumlah = 1 } = body || {};

    if (!id_siswa || !id_absen || !tanggal) {
      return apiError(
        'Parameter id_siswa, id_absen, dan tanggal wajib diisi',
        400,
        'BAD_REQUEST'
      );
    }

    const [sekolahRows]: any = await pool.query(
      'SELECT tahun, semester FROM sekolah WHERE id_sekolah = ?',
      [SEKOLAH_ID]
    );
    const tahun = sekolahRows[0]?.tahun || 1;
    const semester = sekolahRows[0]?.semester || 1;

    // Hitung bulan dari string tanggal (YYYY-MM-DD)
    const bulan = String(new Date(tanggal).getMonth() + 1);

    // Ambil id_kelas jika tidak disertakan
    let resolvedKelas = id_kelas;
    if (!resolvedKelas) {
      const [skRows]: any = await pool.query(
        `SELECT id_kelas FROM siswa_kelas WHERE id_siswa = ? AND tahun = ? AND semester = ? AND deleted_at IS NULL LIMIT 1`,
        [id_siswa, tahun, semester]
      );
      resolvedKelas = skRows[0]?.id_kelas || 0;
    }

    // Cek apakah sudah ada presensi pada tanggal tersebut
    const [existing]: any = await pool.query(
      `SELECT id_presensi FROM presensi WHERE id_siswa = ? AND tanggal = ? AND tahun = ? AND semester = ? AND deleted_at IS NULL`,
      [id_siswa, tanggal, tahun, semester]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE presensi SET id_absen = ?, id_kelas = ?, jumlah = ?, bulan = ? WHERE id_presensi = ?`,
        [id_absen, resolvedKelas, jumlah, bulan, existing[0].id_presensi]
      );
    } else {
      await pool.query(
        `INSERT INTO presensi (tahun, semester, bulan, tanggal, id_kelas, id_siswa, id_absen, jumlah)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tahun, semester, bulan, tanggal, resolvedKelas, id_siswa, id_absen, jumlah]
      );
    }

    return apiSuccess(
      { id_siswa, id_kelas: resolvedKelas, id_absen, tanggal, jumlah },
      'Data presensi berhasil disimpan',
      undefined,
      201
    );
  } catch (error: any) {
    console.error('API POST /presensi error:', error);
    return apiError('Gagal mencatat presensi', 500, error.message);
  }
}
