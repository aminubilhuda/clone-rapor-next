import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { redirect } from 'next/navigation';
import { getSiswaList, getSiswaCount } from '@/lib/actions/siswa-actions';
import SiswaClient from './_components/siswa-client';

async function getReferensi() {
  try {
    const [kelamin]: any = await pool.query('SELECT * FROM jenis_kelamin');
    const [agama]: any = await pool.query('SELECT * FROM agama');
    const [jurusan]: any = await pool.query('SELECT * FROM kompetensi_keahlian');
    const [tingkat]: any = await pool.query('SELECT * FROM tingkat WHERE deleted_at IS NULL');
    const [hubKeluarga]: any = await pool.query('SELECT * FROM hubungan_keluarga WHERE deleted_at IS NULL');
    const [jenisSiswa]: any = await pool.query('SELECT * FROM jenis_siswa WHERE deleted_at IS NULL');
    const [pendidikan]: any = await pool.query('SELECT * FROM pendidikan WHERE deleted_at IS NULL');
    const [kelas]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas WHERE deleted_at IS NULL ORDER BY nama_kelas ASC');
    return { kelamin, agama, jurusan, tingkat, hubKeluarga, jenisSiswa, pendidikan, kelas };
  } catch (error) {
    console.error('Referensi fetch error:', error);
    return { kelamin: [], agama: [], jurusan: [], tingkat: [], hubKeluarga: [], jenisSiswa: [], pendidikan: [], kelas: [] };
  }
}

export default async function KesiswaanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');

  const params = await searchParams;
  const search = params.search ?? '';
  const page = Math.max(0, parseInt(params.page ?? '0', 10) || 0);
  const perPage = Math.min(100, Math.max(1, parseInt(params.perPage ?? '10', 10) || 10));

  const sekolah = await getSekolahWithFilter();
  const [siswa, total, ref] = await Promise.all([
    getSiswaList(search, page, perPage, sekolah.tahun, sekolah.semester),
    getSiswaCount(search, sekolah.tahun, sekolah.semester),
    getReferensi(),
  ]);

  return (
    <div>
      <SiswaClient
        siswa={siswa}
        total={total}
        page={page}
        perPage={perPage}
        search={search}
        refKelamin={ref.kelamin}
        refAgama={ref.agama}
        refJurusan={ref.jurusan}
        refTingkat={ref.tingkat}
        refHubKeluarga={ref.hubKeluarga}
        refJenisSiswa={ref.jenisSiswa}
        refPendidikan={ref.pendidikan}
        refKelas={ref.kelas}
      />
    </div>
  );
}
