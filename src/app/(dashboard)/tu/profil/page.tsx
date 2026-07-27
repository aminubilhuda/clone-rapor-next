import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { redirect } from 'next/navigation';
import ProfilForm from './_components/profil-form';

async function getProfil() {
  try {
    const sekolah = await getSekolahWithFilter();
    const [kepalaRows]: any = await pool.query(
      `SELECT * FROM kepala_sekolah
       WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
       ORDER BY id_kepala_sekolah DESC LIMIT 1`,
      [sekolah.tahun, sekolah.semester]
    );
    const [pegawaiRows]: any = await pool.query(`
      SELECT u.id_user, u.nama, u.nip, u.nuptk, j.jabatan AS nama_jabatan
      FROM users u
      LEFT JOIN jabatan j ON u.jabatan = j.id_jabatan
      WHERE u.deleted_at IS NULL AND u.jabatan IN (1, 3)
      ORDER BY u.nama
    `);
    const [semesterRows]: any = await pool.query('SELECT * FROM semester WHERE id_semester = ?', [sekolah.semester]);
    const [tahunRows]: any = await pool.query('SELECT * FROM tahun_pelajaran WHERE id_tahun_pelajaran = ?', [sekolah.tahun]);
    const kepala = kepalaRows[0];
    const kepalaUser = kepala
      ? pegawaiRows.find((pegawai: any) =>
          pegawai.nama === kepala.nama && String(pegawai.nip || '') === String(kepala.nip || '')
        )
      : null;

    return {
      sekolah,
      kepala,
      pegawai: pegawaiRows,
      kepalaUserId: kepalaUser?.id_user || null,
      semester: semesterRows[0],
      tahun: tahunRows[0],
    };
  } catch (e) {
    return null;
  }
}

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');

  const data = await getProfil();
  if (!data) return <div className="text-red-500">Gagal memuat data.</div>;

  const { sekolah, kepala, pegawai, kepalaUserId, tahun, semester: sem } = data;

  return (
    <div>
      {sekolah.is_historical_view && (
        <div className="mb-4 text-sm text-yellow-600 bg-yellow-50 rounded-xl px-4 py-2 border border-yellow-200">
          Histori: {sem?.semester} {tahun?.tahun_pelajaran}
        </div>
      )}

      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Data Sekolah</h3>
        </div>
        <div className="p-6">
          <ProfilForm
            sekolah={sekolah}
            kepala={kepala}
            pegawai={pegawai}
            kepalaUserId={kepalaUserId}
            periode={`${sem?.semester || ''} ${tahun?.tahun_pelajaran || ''}`.trim()}
          />
        </div>
      </div>
    </div>
  );
}
