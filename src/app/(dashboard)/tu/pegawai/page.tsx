import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PegawaiClient from './_components/pegawai-client';

async function getPegawai() {
  const [pegawai]: any = await pool.query(`
    SELECT u.*, j.jabatan as nama_jabatan, ag.agama as nama_agama, jk.jenis_kelamin,
           k.kepegawaian, tt.tugas_tambahan,
           CASE WHEN u.moto = 1 THEN 'BK' ELSE '-' END as bk_display,
           CASE WHEN u.moto = 1 THEN 'bg-green-100 text-green-700' ELSE 'bg-gray-100 text-gray-500' END as bk_style
    FROM users u
    LEFT JOIN jabatan j ON u.jabatan = j.id_jabatan
    LEFT JOIN agama ag ON u.agama = ag.id_agama
    LEFT JOIN jenis_kelamin jk ON u.kelamin = jk.id_jenis_kelamin
    LEFT JOIN kepegawaian k ON u.id_kepegawaian = k.id_kepegawaian
    LEFT JOIN tugas_tambahan tt ON u.id_tugas_tambahan = tt.id_tugas_tambahan
    ORDER BY u.id_user ASC
  `);
  return pegawai;
}

async function getReferensi() {
  const [jabatan]: any = await pool.query('SELECT * FROM jabatan ORDER BY id_jabatan');
  const [kelamin]: any = await pool.query('SELECT * FROM jenis_kelamin');
  const [agama]: any = await pool.query('SELECT * FROM agama');
  const [kepegawaian]: any = await pool.query('SELECT * FROM kepegawaian');
  const [tugasTambahan]: any = await pool.query('SELECT * FROM tugas_tambahan ORDER BY id_tugas_tambahan');
  return { jabatan, kelamin, agama, kepegawaian, tugasTambahan };
}

export default async function PegawaiPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');

  const [pegawai, ref] = await Promise.all([getPegawai(), getReferensi()]);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Data Pegawai / Tenaga Pendidik</h4>
      <PegawaiClient
        pegawai={pegawai}
        refJabatan={ref.jabatan}
        refKelamin={ref.kelamin}
        refAgama={ref.agama}
        refKepegawaian={ref.kepegawaian}
        refTugasTambahan={ref.tugasTambahan}
      />
    </div>
  );
}
