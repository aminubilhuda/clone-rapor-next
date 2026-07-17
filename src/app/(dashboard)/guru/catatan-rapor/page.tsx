import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import CetakRaporGuruClient from './_components/cetak-rapor-guru-client';

export default async function CetakRaporGuruPage() {
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

  const [siswaRows]: any = await pool.query(
    `SELECT s.id_siswa, s.nama_siswa, s.nis, s.nisn, k.nama_kelas
     FROM siswa s
     JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa
     JOIN kelas k ON sk.id_kelas = k.id_kelas
     WHERE sk.tahun = ? AND sk.semester = ? AND sk.id_kelas = ?
       AND sk.deleted_at IS NULL AND s.aktif = 1
     ORDER BY s.nama_siswa ASC`,
    [sekolah.tahun, sekolah.semester, idKelas]
  );

  return (
    <div>
      <CetakRaporGuruClient
        data={siswaRows}
        namaKelas={namaKelas}
        tahun={sekolah.tahun}
        semester={sekolah.semester}
      />
    </div>
  );
}
