import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { SEKOLAH_ID, JABATAN } from '@/lib/constants';
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
    const idMapel = searchParams.get('id_mapel');
    const includeDetail = searchParams.get('include_detail') === 'true';

    // Jika user adalah siswa, paksa hanya bisa melihat nilai miliknya sendiri
    if (user.role === 'siswa' && user.id_siswa) {
      idSiswa = String(user.id_siswa);
    }

    if (!idSiswa && !idKelas) {
      return apiError(
        'Parameter id_siswa atau id_kelas diperlukan untuk memfilter nilai',
        400,
        'BAD_REQUEST'
      );
    }

    let whereSql = `WHERE nmp.tahun = ? AND nmp.semester = ? AND nmp.deleted_at IS NULL`;
    const params: any[] = [tahun, semester];

    if (idSiswa) {
      whereSql += ` AND nmp.id_siswa = ?`;
      params.push(idSiswa);
    }

    if (idKelas) {
      whereSql += ` AND nmp.id_kelas = ?`;
      params.push(idKelas);
    }

    if (idMapel) {
      whereSql += ` AND nmp.id_mapel = ?`;
      params.push(idMapel);
    }

    const [rows]: any = await pool.query(
      `SELECT nmp.id_nilai_mata_pelajaran, nmp.id_siswa, s.nama_siswa, s.nis, s.nisn,
              nmp.id_kelas, k.nama_kelas,
              nmp.id_mapel, m.nama_mapel, m.s_mapel as kode_mapel,
              km.kelompok as kelompok_mapel,
              nmp.nilai as nilai_akhir,
              nmp.tahun, nmp.semester
       FROM nilai_mata_pelajaran nmp
       JOIN siswa s ON nmp.id_siswa = s.id_siswa
       JOIN mapel m ON nmp.id_mapel = m.id_mapel
       LEFT JOIN kelas k ON nmp.id_kelas = k.id_kelas
       LEFT JOIN kelompok_mapel km ON m.id_kelompok = km.id_kelompok
       ${whereSql}
       ORDER BY s.nama_siswa ASC, m.id_kelompok ASC, m.urut ASC, m.nama_mapel ASC`,
      params
    );

    // Detail formatif / sumatif jika diminta
    let detailMap: Record<string, any> = {};
    if (includeDetail && idSiswa) {
      const [fmtRows]: any = await pool.query(
        `SELECT id_mapel, ROUND(AVG(nilai), 2) as rata_formatif FROM nilai_formatif
         WHERE id_siswa = ? AND tahun = ? AND semester = ?
         GROUP BY id_mapel`,
        [idSiswa, tahun, semester]
      );
      const [phRows]: any = await pool.query(
        `SELECT id_mapel, ROUND(AVG(nilai), 2) as rata_ph FROM nilai_sumatif_ph
         WHERE id_siswa = ? AND tahun = ? AND semester = ?
         GROUP BY id_mapel`,
        [idSiswa, tahun, semester]
      );
      const [tsRows]: any = await pool.query(
        `SELECT id_mapel, nilai as sumatif_ts FROM nilai_sumatif_ts
         WHERE id_siswa = ? AND tahun = ? AND semester = ?`,
        [idSiswa, tahun, semester]
      );
      const [asRows]: any = await pool.query(
        `SELECT id_mapel, nilai as sumatif_as FROM nilai_sumatif_as
         WHERE id_siswa = ? AND tahun = ? AND semester = ?`,
        [idSiswa, tahun, semester]
      );

      for (const r of fmtRows) {
        detailMap[r.id_mapel] = { ...detailMap[r.id_mapel], rata_formatif: parseFloat(r.rata_formatif) };
      }
      for (const r of phRows) {
        detailMap[r.id_mapel] = { ...detailMap[r.id_mapel], rata_sumatif_ph: parseFloat(r.rata_ph) };
      }
      for (const r of tsRows) {
        detailMap[r.id_mapel] = { ...detailMap[r.id_mapel], sumatif_ts: parseFloat(r.sumatif_ts) };
      }
      for (const r of asRows) {
        detailMap[r.id_mapel] = { ...detailMap[r.id_mapel], sumatif_as: parseFloat(r.sumatif_as) };
      }
    }

    const data = rows.map((r: any) => {
      const item: any = {
        id_nilai: r.id_nilai_mata_pelajaran,
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
        mata_pelajaran: {
          id_mapel: r.id_mapel,
          nama_mapel: r.nama_mapel,
          kode: r.kode_mapel,
          kelompok: r.kelompok_mapel,
        },
        nilai_akhir: r.nilai_akhir !== null ? Math.round(Number(r.nilai_akhir)) : null,
        tahun: r.tahun,
        semester: r.semester,
      };

      if (includeDetail && idSiswa) {
        item.detail = detailMap[r.id_mapel] || {
          rata_formatif: null,
          rata_sumatif_ph: null,
          sumatif_ts: null,
          sumatif_as: null,
        };
      }

      return item;
    });

    return apiSuccess(data, 'Data nilai berhasil diambil', {
      tahun,
      semester,
      total: data.length,
    });
  } catch (error: any) {
    console.error('API /nilai error:', error);
    return apiError('Gagal mengambil data nilai', 500, error.message);
  }
}
