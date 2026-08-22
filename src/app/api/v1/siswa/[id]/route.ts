import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
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
  const idSiswa = parseInt(id, 10);
  if (isNaN(idSiswa)) {
    return apiError('ID siswa tidak valid', 400, 'BAD_REQUEST');
  }

  try {
    const [rows]: any = await pool.query(
      `SELECT s.*, jk.jenis_kelamin, a.agama as nama_agama,
              kk.id_kompetensi_keahlian as id_jurusan, kk.kompetensi_keahlian as nama_jurusan
       FROM siswa s
       LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
       LEFT JOIN agama a ON s.agama = a.id_agama
       LEFT JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
       WHERE s.id_siswa = ? AND s.deleted_at IS NULL`,
      [idSiswa]
    );

    if (rows.length === 0) {
      return apiError('Siswa tidak ditemukan', 404, 'NOT_FOUND');
    }

    const s = rows[0];

    // Ambil riwayat kelas
    const [riwayatKelas]: any = await pool.query(
      `SELECT sk.tahun, sk.semester, tp.tahun_pelajaran, sm.semester as nama_semester,
              k.id_kelas, k.nama_kelas, t.tingkat
       FROM siswa_kelas sk
       JOIN kelas k ON sk.id_kelas = k.id_kelas
       LEFT JOIN tingkat t ON k.id_tingkat = t.id_tingkat
       LEFT JOIN tahun_pelajaran tp ON sk.tahun = tp.id_tahun_pelajaran
       LEFT JOIN semester sm ON sk.semester = sm.id_semester
       WHERE sk.id_siswa = ? AND sk.deleted_at IS NULL
       ORDER BY sk.tahun DESC, sk.semester DESC`,
      [idSiswa]
    );

    const data = {
      id_siswa: s.id_siswa,
      nama_siswa: s.nama_siswa,
      nis: s.nis || null,
      nisn: s.nisn || null,
      nik: s.nik_pd || null,
      no_kk: s.nkk || null,
      jenis_kelamin: s.jenis_kelamin || null,
      agama: s.nama_agama || null,
      tempat_lahir: s.tempat_lahir || null,
      tanggal_lahir: s.tanggal_lahir ? new Date(s.tanggal_lahir).toISOString().split('T')[0] : null,
      kontak: s.kontak_siswa || null,
      alamat: s.alamat || null,
      jurusan: s.id_jurusan
        ? {
            id_jurusan: s.id_jurusan,
            nama_jurusan: s.nama_jurusan,
          }
        : null,
      sekolah_asal: s.sekolah_asal || null,
      terima_kelas: s.terima_kelas || null,
      terima_tanggal: s.terima_tanggal ? new Date(s.terima_tanggal).toISOString().split('T')[0] : null,
      orang_tua: {
        ayah: {
          nama: s.nama_ayah || null,
          nik: s.nik_ayah || null,
          tahun_lahir: s.tahun_ayah || null,
          pendidikan: s.pendidikan_ayah || null,
          pekerjaan: s.pekerjaan_ayah || null,
          kontak: s.kontak_ayah || null,
        },
        ibu: {
          nama: s.nama_ibu || null,
          nik: s.nik_ibu || null,
          tahun_lahir: s.tahun_ibu || null,
          pendidikan: s.pendidikan_ibu || null,
          pekerjaan: s.pekerjaan_ibu || null,
          kontak: s.kontak_ibu || null,
        },
        alamat_orang_tua: s.alamat_orang_tua || null,
        wali: {
          nama: s.nama_wali || null,
          pekerjaan: s.pekerjaan_wali || null,
          kontak: s.kontak_wali || null,
          alamat: s.alamat_wali || null,
        },
      },
      foto: s.foto ? `/api/uploads/siswa/${s.foto}` : null,
      riwayat_kelas: riwayatKelas.map((rk: any) => ({
        id_kelas: rk.id_kelas,
        nama_kelas: rk.nama_kelas,
        tingkat: rk.tingkat,
        tahun: rk.tahun,
        tahun_pelajaran: rk.tahun_pelajaran,
        semester: rk.semester,
        nama_semester: rk.nama_semester,
      })),
    };

    return apiSuccess(data, 'Detail profil siswa berhasil diambil');
  } catch (error: any) {
    console.error('API /siswa/[id] error:', error);
    return apiError('Gagal mengambil detail siswa', 500, error.message);
  }
}
