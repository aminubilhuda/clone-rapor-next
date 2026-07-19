import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import RekapPresensiGuruClient from './_components/rekap-presensi-guru-client';

export default async function RekapPresensiGuruPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const sekolah = await getSekolahWithFilter();
  const idUser = session.user.id_user;

  const [waliRows]: any = await pool.query(
    `SELECT kw.id_kelas, k.nama_kelas
     FROM kelas_wali kw
     JOIN kelas k ON kw.id_kelas = k.id_kelas
     WHERE kw.id_user = ? AND kw.tahun = ? AND kw.semester = ? AND kw.deleted_at IS NULL`,
    [idUser, sekolah.tahun, sekolah.semester]
  );

  if (waliRows.length === 0) {
    return (
      <div className="text-center py-20">
        <h4 className="text-xl font-semibold mb-4 text-gray-600">Anda bukan wali kelas</h4>
        <p className="text-gray-400">Anda tidak memiliki kelas yang diwali periode ini.</p>
      </div>
    );
  }

  const idKelas = waliRows[0].id_kelas;
  const namaKelas = waliRows[0].nama_kelas;

  const [rekapRows]: any = await pool.query(
    `SELECT s.id_siswa, s.nama_siswa,
            SUM(CASE WHEN p.id_absen = 1 THEN p.jumlah ELSE 0 END) AS hadir,
            SUM(CASE WHEN p.id_absen = 2 THEN p.jumlah ELSE 0 END) AS sakit,
            SUM(CASE WHEN p.id_absen = 3 THEN p.jumlah ELSE 0 END) AS izin,
            SUM(CASE WHEN p.id_absen = 4 THEN p.jumlah ELSE 0 END) AS alpa
     FROM siswa s
     JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa
     LEFT JOIN presensi p ON p.id_siswa = s.id_siswa AND p.id_kelas = sk.id_kelas
       AND p.tahun = ? AND p.semester = ? AND p.deleted_at IS NULL
     WHERE sk.tahun = ? AND sk.semester = ? AND sk.id_kelas = ?
       AND sk.deleted_at IS NULL AND s.aktif = 1
     GROUP BY s.id_siswa, s.nama_siswa
     ORDER BY s.nama_siswa ASC`,
    [sekolah.tahun, sekolah.semester, sekolah.tahun, sekolah.semester, idKelas]
  );

  return (
    <div>
      <RekapPresensiGuruClient data={rekapRows} namaKelas={namaKelas} />
    </div>
  );
}
