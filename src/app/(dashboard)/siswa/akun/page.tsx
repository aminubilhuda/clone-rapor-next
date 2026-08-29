import { auth } from '@/lib/auth';
import { JABATAN } from '@/lib/constants';
import { pool } from '@/lib/db';
import { redirect } from 'next/navigation';
import AkunForm from './_components/akun-form';

async function getData() {
  const session = await auth();
  if (!session?.user?.id_siswa || session.user.jabatan !== JABATAN.SISWA) redirect('/login');

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah LIMIT 1');
  const tahun = sekolahRows[0]?.tahun || 0;
  const semester = sekolahRows[0]?.semester || 0;

  const [siswaRows]: any = await pool.query(
    `
    SELECT
      s.id_siswa, s.nama_siswa, s.nis, s.nisn, s.username,
      COALESCE(k.nama_kelas, 'Belum Bergabung') as kelas_aktif
    FROM siswa s
    LEFT JOIN (
      SELECT id_siswa, id_kelas FROM siswa_kelas
      WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
      GROUP BY id_siswa
    ) sk ON s.id_siswa = sk.id_siswa
    LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
    WHERE s.id_siswa = ? AND s.aktif = 1 AND s.deleted_at IS NULL
  `,
    [tahun, semester, session.user.id_siswa]
  );

  if (!siswaRows[0]) redirect('/login');

  return {
    siswa: siswaRows[0],
  };
}

export default async function SiswaAkunPage() {
  const data = await getData();

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <AkunForm siswa={data.siswa} />
    </div>
  );
}
