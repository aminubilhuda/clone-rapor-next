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
    const [rows]: any = await pool.query(
      `SELECT s.id_sekolah, s.npsn, s.nss, s.nama_sekolah, s.status_sekolah, s.yayasan,
              s.alamat, s.alamat_jalan, s.rt, s.rw, s.desa, s.kecamatan, s.kabupaten, s.provinsi,
              s.kode_pos, s.email, s.kontak, s.website, s.nomor_fax,
              s.tahun as id_tahun_aktif, s.semester as id_semester_aktif,
              tp.tahun_pelajaran as tahun_pelajaran_aktif,
              sm.semester as nama_semester_aktif,
              s.logo, s.logo_prov,
              ks.nama_kepala_sekolah, ks.nip_kepala_sekolah, ks.nuptk_kepala_sekolah
       FROM sekolah s
       LEFT JOIN tahun_pelajaran tp ON s.tahun = tp.id_tahun_pelajaran
       LEFT JOIN semester sm ON s.semester = sm.id_semester
       LEFT JOIN (
         SELECT nama as nama_kepala_sekolah, nip as nip_kepala_sekolah, nuptk as nuptk_kepala_sekolah, tahun, semester
         FROM kepala_sekolah
         WHERE deleted_at IS NULL
         ORDER BY id_kepala_sekolah DESC
         LIMIT 1
       ) ks ON ks.tahun = s.tahun AND ks.semester = s.semester
       WHERE s.id_sekolah = ?`,
      [SEKOLAH_ID]
    );

    if (rows.length === 0) {
      return apiError('Data sekolah tidak ditemukan', 404, 'NOT_FOUND');
    }

    const item = rows[0];

    const data = {
      id_sekolah: item.id_sekolah,
      npsn: item.npsn,
      nss: item.nss,
      nama_sekolah: item.nama_sekolah,
      status_sekolah: item.status_sekolah,
      yayasan: item.yayasan,
      alamat: {
        jalan: item.alamat_jalan || item.alamat,
        rt: item.rt,
        rw: item.rw,
        desa: item.desa,
        kecamatan: item.kecamatan,
        kabupaten: item.kabupaten,
        provinsi: item.provinsi,
        kode_pos: item.kode_pos,
      },
      kontak: {
        email: item.email,
        telepon: item.kontak,
        fax: item.nomor_fax,
        website: item.website,
      },
      periode_aktif: {
        id_tahun: item.id_tahun_aktif,
        tahun_pelajaran: item.tahun_pelajaran_aktif,
        id_semester: item.id_semester_aktif,
        nama_semester: item.nama_semester_aktif,
      },
      kepala_sekolah: {
        nama: item.nama_kepala_sekolah || null,
        nip: item.nip_kepala_sekolah || null,
      },
      logo: item.logo ? `/api/sekolah-logo` : null,
    };

    return apiSuccess(data, 'Data profil sekolah berhasil diambil');
  } catch (error: any) {
    console.error('API /sekolah error:', error);
    return apiError('Gagal mengambil data profil sekolah', 500, error.message);
  }
}
