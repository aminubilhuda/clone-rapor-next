import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import P5BKClient from './_components/p5bk-client';

async function getData() {
  try {
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
  } catch (error) {
    console.error('P5BK data fetch error:', error);
    return [];
  }
}

async function getKelas() {
  try {
    const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
    return rows;
  } catch (error) {
    console.error('Kelas fetch error:', error);
    return [];
  }
}

async function getTema() {
  try {
    const [rows]: any = await pool.query('SELECT id_tema, tema FROM proyek_tema ORDER BY id_tema ASC');
    return rows;
  } catch (error) {
    console.error('Tema fetch error:', error);
    return [];
  }
}

async function getUser() {
  try {
    const [rows]: any = await pool.query('SELECT id_user, nama, username FROM users WHERE deleted_at IS NULL ORDER BY nama ASC');
    return rows;
  } catch (error) {
    console.error('User fetch error:', error);
    return [];
  }
}

async function getDimensiTree() {
  try {
    const [dimensi]: any = await pool.query('SELECT * FROM dimensi ORDER BY id_dimensi ASC');
    const [elemen]: any = await pool.query('SELECT * FROM elemen ORDER BY id_elemen ASC');
    const [subElemen]: any = await pool.query('SELECT * FROM sub_elemen ORDER BY id_dimensi, id_elemen, id_sub_elemen ASC');

    return dimensi.map((d: any) => ({
      ...d,
      elemen: elemen
        .filter((e: any) => e.id_dimensi === d.id_dimensi)
        .map((e: any) => ({
          ...e,
          sub_elemen: subElemen.filter((s: any) => s.id_elemen === e.id_elemen),
        })),
    }));
  } catch (error) {
    console.error('Dimensi tree fetch error:', error);
    return [];
  }
}

export default async function P5BKPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');
  const [data, refKelas, refTema, refUser, dimensiTree] = await Promise.all([
    getData(), getKelas(), getTema(), getUser(), getDimensiTree(),
  ]);

  return (
    <div>
      <P5BKClient data={data} refKelas={refKelas} refTema={refTema} refUser={refUser} dimensiTree={dimensiTree} />
    </div>
  );
}
