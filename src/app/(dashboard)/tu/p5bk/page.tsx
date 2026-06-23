import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import P5BKClient from './_components/p5bk-client';

async function getData() {
  const sekolah = await getSekolahWithFilter();
  const [rows]: any = await pool.query(`
    SELECT pk.*, k.nama_kelas, pt.tema, u.nama AS nama_user
    FROM proyek_kelas pk
    JOIN kelas k ON pk.id_kelas = k.id_kelas
    JOIN proyek_tema pt ON pk.id_tema = pt.id_tema
    LEFT JOIN users u ON pk.id_user = u.id_user
    WHERE pk.tahun = ? AND pk.semester = ?
    ORDER BY pk.id_proyek_kelas DESC
  `, [sekolah.tahun, sekolah.semester]);
  return rows;
}

async function getKelas() {
  const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
  return rows;
}

async function getTema() {
  const [rows]: any = await pool.query('SELECT id_tema, tema FROM proyek_tema ORDER BY id_tema ASC');
  return rows;
}

async function getUser() {
  const [rows]: any = await pool.query('SELECT id_user, nama, username FROM users ORDER BY nama ASC');
  return rows;
}

export default async function P5BKPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');
  const [data, refKelas, refTema, refUser] = await Promise.all([getData(), getKelas(), getTema(), getUser()]);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">P5BK</h4>
      <P5BKClient data={data} refKelas={refKelas} refTema={refTema} refUser={refUser} />
    </div>
  );
}
