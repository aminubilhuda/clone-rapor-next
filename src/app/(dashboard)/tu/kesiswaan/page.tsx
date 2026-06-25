import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { redirect } from 'next/navigation';
import SiswaClient from './_components/siswa-client';

async function getSiswa() {
  const sekolah = await getSekolahWithFilter();

  const [siswa]: any = await pool.query(`
    SELECT
      s.id_siswa, s.nama_siswa, s.nis, s.nisn, s.terima_kelas,
      s.tempat_lahir, s.tanggal_lahir, s.kelamin, s.agama, s.jurusan,
      jk.jenis_kelamin, a.agama,
      kk.kompetensi_keahlian,
      COALESCE(k.nama_kelas, 'Belum Bergabung') as kelas_display
    FROM siswa s
    JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
    JOIN agama a ON s.agama = a.id_agama
    JOIN kompetensi_keahlian kk ON s.jurusan = kk.id_kompetensi_keahlian
    LEFT JOIN (
      SELECT id_siswa, id_kelas FROM siswa_kelas
      WHERE tahun = ? AND semester = ?
      GROUP BY id_siswa
    ) sk ON s.id_siswa = sk.id_siswa
    LEFT JOIN kelas k ON sk.id_kelas = k.id_kelas
    WHERE s.deleted_at IS NULL AND s.aktif = 1
    GROUP BY s.id_siswa
    ORDER BY s.id_siswa ASC
  `, [sekolah.tahun, sekolah.semester]);

  return siswa.map((s: any) => {
    let tglFormatted = '';
    const tgl = s.tanggal_lahir;
    if (tgl) {
      try {
        // Bisa berupa Date object (dari mysql2) atau string 'yyyy-mm-dd'
        const d = typeof tgl === 'string' ? new Date(tgl + 'T00:00:00') : new Date(tgl);
        if (!isNaN(d.getTime())) {
          const hari = String(d.getDate()).padStart(2, '0');
          const bulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
          ][d.getMonth()];
          const tahun = d.getFullYear();
          tglFormatted = `${hari} ${bulan} ${tahun}`;
        }
      } catch {}
    }
    return {
      ...s,
      tempat_tanggal_lahir: tglFormatted ? `${s.tempat_lahir}, ${tglFormatted}` : s.tempat_lahir,
    };
  });
}

async function getReferensi() {
  const [kelamin]: any = await pool.query('SELECT * FROM jenis_kelamin');
  const [agama]: any = await pool.query('SELECT * FROM agama');
  const [jurusan]: any = await pool.query('SELECT * FROM kompetensi_keahlian');
  return { kelamin, agama, jurusan };
}

export default async function KesiswaanPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');

  const [siswa, ref] = await Promise.all([getSiswa(), getReferensi()]);

  return (
    <div>
      <SiswaClient
        siswa={siswa}
        refKelamin={ref.kelamin}
        refAgama={ref.agama}
        refJurusan={ref.jurusan}
      />
    </div>
  );
}
