import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import LegerGuruClient from './_components/leger-nilai-guru-client';

export default async function LegerNilaiGuruPage() {
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

  const [legerRows]: any = await pool.query(
    `SELECT nmp.id_nilai_mata_pelajaran AS id, nmp.id_kelas, nmp.id_mapel, nmp.id_siswa,
            nmp.nilai AS nilai_akhir,
            s.nama_siswa, s.nis, s.nisn,
            m.nama_mapel, m.s_mapel AS singkatan, m.urut
     FROM nilai_mata_pelajaran nmp
     JOIN siswa s ON nmp.id_siswa = s.id_siswa
     JOIN mapel m ON nmp.id_mapel = m.id_mapel
     WHERE nmp.tahun = ? AND nmp.semester = ? AND nmp.id_kelas = ? AND s.deleted_at IS NULL
     ORDER BY s.nama_siswa, m.urut ASC`,
    [sekolah.tahun, sekolah.semester, idKelas]
  );

  const [nilaiKelasRows]: any = await pool.query(
    'SELECT * FROM nilai_kelas WHERE tahun = ? AND semester = ? AND id_kelas = ?',
    [sekolah.tahun, sekolah.semester, idKelas]
  );

  const [rekapPresensi]: any = await pool.query(
    `SELECT p.id_siswa,
            SUM(CASE WHEN p.id_absen = 1 THEN p.jumlah ELSE 0 END) AS hadir,
            SUM(CASE WHEN p.id_absen = 2 THEN p.jumlah ELSE 0 END) AS sakit,
            SUM(CASE WHEN p.id_absen = 3 THEN p.jumlah ELSE 0 END) AS izin,
            SUM(CASE WHEN p.id_absen = 4 THEN p.jumlah ELSE 0 END) AS alpa
     FROM presensi p
     WHERE p.tahun = ? AND p.semester = ? AND p.id_kelas = ? AND p.deleted_at IS NULL
     GROUP BY p.id_siswa`,
    [sekolah.tahun, sekolah.semester, idKelas]
  );

  return (
    <div>
      <LegerGuruClient
        data={legerRows}
        namaKelas={namaKelas}
        refNilaiKelas={nilaiKelasRows}
        rekapPresensi={rekapPresensi}
      />
    </div>
  );
}
