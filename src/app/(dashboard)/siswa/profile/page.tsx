import { auth } from '@/lib/auth';
import { JABATAN } from '@/lib/constants';
import { pool } from '@/lib/db';
import { redirect } from 'next/navigation';
import ProfileForm from './_components/profile-form';

async function getData() {
  const session = await auth();
  if (!session?.user?.id_siswa || session.user.jabatan !== JABATAN.SISWA) redirect('/login');

  const [sekolahRows]: any = await pool.query('SELECT tahun, semester FROM sekolah LIMIT 1');
  const tahun = sekolahRows[0]?.tahun || 0;
  const semester = sekolahRows[0]?.semester || 0;

  const [siswaRows]: any = await pool.query(`
    SELECT
      s.id_siswa, s.nama_siswa, s.nik_pd, s.nkk,
      s.nis, s.nisn, s.terima_kelas,
      s.tempat_lahir, s.tanggal_lahir, s.kelamin, s.agama, s.jurusan,
      s.kontak_siswa, s.hub_keluarga, s.jumlah_saudara, s.anak_ke,
      s.nama_ayah, s.nik_ayah, s.tahun_ayah, s.pendidikan_ayah, s.pekerjaan_ayah, s.kontak_ayah,
      s.nama_ibu, s.nik_ibu, s.tahun_ibu, s.pendidikan_ibu, s.pekerjaan_ibu, s.kontak_ibu,
      s.alamat, s.alamat_orang_tua,
      s.nama_wali, s.alamat_wali, s.pekerjaan_wali, s.kontak_wali,
      s.terima_tingkat, s.sekolah_asal, s.terima_tanggal,
      s.username, s.foto, s.jenis_siswa,
      jk.jenis_kelamin, a.agama as nama_agama,
      kk.kompetensi_keahlian,
      COALESCE(k.nama_kelas, 'Belum Bergabung') as kelas_aktif
    FROM siswa s
    LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
    LEFT JOIN agama a ON s.agama = a.id_agama
    LEFT JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
    LEFT JOIN (
      SELECT id_siswa, id_kelas FROM siswa_kelas
      WHERE tahun = ? AND semester = ? AND deleted_at IS NULL
      GROUP BY id_siswa
    ) sk ON s.id_siswa = sk.id_siswa
    LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
    WHERE s.id_siswa = ? AND s.aktif = 1 AND s.deleted_at IS NULL
  `, [tahun, semester, session.user.id_siswa]);

  if (!siswaRows[0]) redirect('/login');

  const [kelamin]: any = await pool.query('SELECT * FROM jenis_kelamin');
  const [agama]: any = await pool.query('SELECT * FROM agama');
  const [jurusan]: any = await pool.query('SELECT * FROM kompetensi_keahlian');
  const [tingkat]: any = await pool.query('SELECT * FROM tingkat WHERE deleted_at IS NULL');
  const [hubKeluarga]: any = await pool.query('SELECT * FROM hubungan_keluarga WHERE deleted_at IS NULL');
  const [jenisSiswa]: any = await pool.query('SELECT * FROM jenis_siswa WHERE deleted_at IS NULL');
  const [pendidikan]: any = await pool.query('SELECT * FROM pendidikan WHERE deleted_at IS NULL');

  return {
    siswa: siswaRows[0],
    refKelamin: kelamin,
    refAgama: agama,
    refJurusan: jurusan,
    refTingkat: tingkat,
    refHubKeluarga: hubKeluarga,
    refJenisSiswa: jenisSiswa,
    refPendidikan: pendidikan,
  };
}

export default async function SiswaProfilePage() {
  const data = await getData();

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <ProfileForm
        siswa={data.siswa}
        refKelamin={data.refKelamin}
        refAgama={data.refAgama}
        refJurusan={data.refJurusan}
        refTingkat={data.refTingkat}
        refHubKeluarga={data.refHubKeluarga}
        refJenisSiswa={data.refJenisSiswa}
        refPendidikan={data.refPendidikan}
      />
    </div>
  );
}