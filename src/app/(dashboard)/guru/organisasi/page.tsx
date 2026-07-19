import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { redirect } from 'next/navigation';
import OrganisasiGuruClient from './_components/organisasi-guru-client';

export default async function OrganisasiGuruPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const idUser = session.user.id_user;
  const sekolah = await getSekolahWithFilter();

  const [orgRows]: any = await pool.query(
    `SELECT o.id_organisasi, o.nama_organisasi, o.kode
     FROM pembina_organisasi po
     JOIN organisasi o ON po.id_organisasi = o.id_organisasi
     WHERE po.id_user = ? AND po.deleted_at IS NULL AND o.deleted_at IS NULL
     GROUP BY o.id_organisasi, o.nama_organisasi, o.kode`,
    [idUser]
  );

  if (orgRows.length === 0) {
    return (
      <div className="text-center py-20">
        <h4 className="text-xl font-semibold mb-4 text-gray-600">Anda bukan pembina organisasi</h4>
        <p className="text-gray-400">Anda tidak membina organisasi manapun.</p>
      </div>
    );
  }

  const orgIds = orgRows.map((o: any) => o.id_organisasi);
  const placeholders = orgIds.map(() => '?').join(',');

  const [anggotaRows]: any = await pool.query(
    `SELECT so.id_siswa_organisasi, so.id_organisasi, so.tahun, so.semester,
            s.nama_siswa, s.nisn, k.nama_kelas
     FROM siswa_organisasi so
     JOIN siswa s ON so.id_siswa = s.id_siswa
     LEFT JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa AND sk.tahun = so.tahun AND sk.semester = so.semester AND sk.deleted_at IS NULL
     LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
     WHERE so.id_organisasi IN (${placeholders}) AND so.tahun = ? AND so.semester = ? AND so.deleted_at IS NULL AND s.deleted_at IS NULL
     ORDER BY so.id_organisasi, s.nama_siswa ASC`,
    [...orgIds, sekolah.tahun, sekolah.semester]
  );

  return (
    <div>
      <OrganisasiGuruClient organisasi={orgRows} anggota={anggotaRows} />
    </div>
  );
}
