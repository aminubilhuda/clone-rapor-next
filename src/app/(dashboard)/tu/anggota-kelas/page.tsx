import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import AnggotaKelasClient from './_components/anggota-kelas-client';

async function getData() {
  try {
    const sekolah = await getSekolahWithFilter();
    const [kelasRows, siswaRows, anggotaRows]: any[] = await Promise.all([
      pool.query(`
        SELECT k.id_kelas, k.nama_kelas, COUNT(sk.id_siswa_kelas) AS jumlah_anggota
        FROM kelas k
        LEFT JOIN siswa_kelas sk ON k.id_kelas = sk.id_kelas
          AND sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL
        GROUP BY k.id_kelas, k.nama_kelas
        ORDER BY k.nama_kelas ASC
      `, [sekolah.tahun, sekolah.semester]),
      pool.query('SELECT id_siswa, nama_siswa, nisn, terima_kelas FROM siswa WHERE deleted_at IS NULL AND aktif = 1 ORDER BY nama_siswa ASC'),
      pool.query(`
        SELECT sk.id_siswa_kelas, sk.id_kelas, sk.id_siswa, s.nama_siswa, s.nisn
        FROM siswa_kelas sk
        JOIN siswa s ON sk.id_siswa = s.id_siswa
        WHERE sk.tahun = ? AND sk.semester = ? AND sk.deleted_at IS NULL AND s.deleted_at IS NULL
      `, [sekolah.tahun, sekolah.semester]),
    ]);

    return { data: kelasRows[0], refSiswa: siswaRows[0], anggotaKelas: anggotaRows[0] };
  } catch (error) {
    console.error('Anggota kelas data fetch error:', error);
    return { data: [], refSiswa: [], anggotaKelas: [] };
  }
}

export default async function AnggotaKelasPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');
  const { data, refSiswa, anggotaKelas } = await getData();

  return (
    <div>
      <AnggotaKelasClient data={data} refSiswa={refSiswa} anggotaKelas={anggotaKelas} />
    </div>
  );
}
