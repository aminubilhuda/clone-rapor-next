import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import GuruKokurikulerClient from './_components/guru-kokurikuler-client';

async function getData(idUser: number) {
  try {
    const sekolah = await getSekolahWithFilter();

    const [rows]: any = await pool.query(
      `SELECT 
        pk.id_proyek_kelas,
        pk.kode,
        pk.tahun,
        pk.semester,
        pk.id_kelas,
        pk.id_tema,
        pk.id_user,
        pk.judul_proyek,
        pk.deskripsi_singkat,
        k.nama_kelas,
        COALESCE(dim_cnt.total_dimensi, 0) AS total_dimensi,
        COALESCE(siswa_cnt.total_siswa, 0) AS total_siswa
      FROM proyek_kelas pk
      JOIN kelas k ON pk.id_kelas = k.id_kelas
      LEFT JOIN (
        SELECT id_proyek_kelas, COUNT(*) AS total_dimensi
        FROM proyek_tujuan
        WHERE deleted_at IS NULL
        GROUP BY id_proyek_kelas
      ) dim_cnt ON pk.id_proyek_kelas = dim_cnt.id_proyek_kelas
      LEFT JOIN (
        SELECT sk.id_kelas, COUNT(DISTINCT sk.id_siswa) AS total_siswa
        FROM siswa_kelas sk
        JOIN siswa s ON sk.id_siswa = s.id_siswa
        WHERE sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL AND s.deleted_at IS NULL
        GROUP BY sk.id_kelas
      ) siswa_cnt ON pk.id_kelas = siswa_cnt.id_kelas
      WHERE pk.id_user = ? AND pk.tahun = ? AND pk.semester = ? AND pk.deleted_at IS NULL
      ORDER BY pk.id_proyek_kelas DESC`,
      [sekolah.tahun, sekolah.semester, idUser, sekolah.tahun, sekolah.semester]
    );

    return rows;
  } catch (error) {
    console.error('Guru kokurikuler data fetch error:', error);
    return [];
  }
}

export default async function GuruKokurikulerPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const proyekList = await getData(session.user.id_user!);

  return (
    <div>
      <GuruKokurikulerClient proyekList={proyekList} />
    </div>
  );
}
