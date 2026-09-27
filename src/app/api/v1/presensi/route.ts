import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { SEKOLAH_ID } from '@/lib/constants';
import { requireApiAuth, ALL_ROLES, STAFF_ROLES } from '@/lib/api-auth-guard';
import { isGuruPiketToday } from '@/lib/piket';
import { apiSuccess, apiError, apiOptionsResponse } from '@/lib/api-response';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return apiOptionsResponse();
}

export async function GET(req: NextRequest) {
  const authResult = await requireApiAuth(req, ALL_ROLES);
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
    if (user.role === 'siswa') {
      if (!user.id_siswa) {
        return apiError('Akun siswa tidak valid.', 403, 'FORBIDDEN');
      }
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
    return apiError('Gagal mengambil data presensi');
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireApiAuth(req, STAFF_ROLES);
  if (!authResult.authorized) {
    return authResult.errorResponse!;
  }

  const user = authResult.user!;

  try {
    const body = await req.json();
    const idSiswa = Number(body?.id_siswa);
    const idAbsen = Number(body?.id_absen);
    const jumlah = Number(body?.jumlah ?? 1);
    const tanggal = String(body?.tanggal ?? '');
    const inputKelas = Number(body?.id_kelas);

    if (!Number.isInteger(idSiswa) || idSiswa <= 0 || !Number.isInteger(idAbsen) || idAbsen <= 0) {
      return apiError('Parameter id_siswa dan id_absen wajib berupa angka valid', 400, 'BAD_REQUEST');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || Number.isNaN(Date.parse(tanggal))) {
      return apiError('Format tanggal harus YYYY-MM-DD', 400, 'BAD_REQUEST');
    }

    if (!Number.isInteger(jumlah) || jumlah < 0 || jumlah > 31) {
      return apiError('Nilai jumlah tidak valid', 400, 'BAD_REQUEST');
    }

    if (user.role === 'guru') {
      const piketHariIni = await isGuruPiketToday(Number(user.id_user));
      if (!piketHariIni) {
        return apiError('Hanya guru piket hari ini yang dapat mencatat presensi.', 403, 'FORBIDDEN');
      }
    }

    const [siswaRows]: any = await pool.query(
      'SELECT id_siswa FROM siswa WHERE id_siswa = ? AND aktif = 1 AND deleted_at IS NULL LIMIT 1',
      [idSiswa]
    );
    if (siswaRows.length === 0) {
      return apiError('Siswa tidak ditemukan atau tidak aktif', 404, 'NOT_FOUND');
    }

    const [sekolahRows]: any = await pool.query(
      'SELECT tahun, semester FROM sekolah WHERE id_sekolah = ?',
      [SEKOLAH_ID]
    );
    const tahun = sekolahRows[0]?.tahun || 1;
    const semester = sekolahRows[0]?.semester || 1;

    const bulan = String(Number(tanggal.slice(5, 7)));

    let resolvedKelas = Number.isInteger(inputKelas) && inputKelas > 0 ? inputKelas : 0;
    if (!resolvedKelas) {
      const [skRows]: any = await pool.query(
        `SELECT id_kelas FROM siswa_kelas WHERE id_siswa = ? AND tahun = ? AND semester = ? AND deleted_at IS NULL LIMIT 1`,
        [idSiswa, tahun, semester]
      );
      resolvedKelas = skRows[0]?.id_kelas || 0;
    }

    if (!resolvedKelas) {
      return apiError('Siswa tidak terdaftar pada kelas periode aktif', 400, 'BAD_REQUEST');
    }

    const [existing]: any = await pool.query(
      `SELECT id_presensi FROM presensi WHERE id_siswa = ? AND tanggal = ? AND tahun = ? AND semester = ? AND deleted_at IS NULL`,
      [idSiswa, tanggal, tahun, semester]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE presensi SET id_absen = ?, id_kelas = ?, jumlah = ?, bulan = ? WHERE id_presensi = ?`,
        [idAbsen, resolvedKelas, jumlah, bulan, existing[0].id_presensi]
      );
    } else {
      await pool.query(
        `INSERT INTO presensi (tahun, semester, bulan, tanggal, id_kelas, id_siswa, id_absen, jumlah)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tahun, semester, bulan, tanggal, resolvedKelas, idSiswa, idAbsen, jumlah]
      );
    }

    return apiSuccess(
      { id_siswa: idSiswa, id_kelas: resolvedKelas, id_absen: idAbsen, tanggal, jumlah },
      'Data presensi berhasil disimpan',
      undefined,
      201
    );
  } catch (error: any) {
    console.error('API POST /presensi error:', error);
    return apiError('Gagal mencatat presensi');
  }
}
