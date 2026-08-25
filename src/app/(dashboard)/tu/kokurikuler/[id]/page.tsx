import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import KokurikulerEditClient from './_components/kokurikuler-edit-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProyekDetail(id: number) {
  try {
    const [rows]: any = await pool.query(
      `SELECT pk.*, k.nama_kelas, COALESCE(u.nama, '-') AS nama_pembina
       FROM proyek_kelas pk
       JOIN kelas k ON pk.id_kelas = k.id_kelas
       LEFT JOIN users u ON pk.id_user = u.id_user
       WHERE pk.id_proyek_kelas = ? AND pk.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Fetch proyek detail error:', error);
    return null;
  }
}

async function getTujuanList(idProyek: number) {
  try {
    const [rows]: any = await pool.query(
      `SELECT pt.id_proyek_tujuan, pt.id_proyek_kelas, pt.id_dimensi, pt.deskripsi, dk.dimensi AS nama_dimensi
       FROM proyek_tujuan pt
       JOIN dimensi_kokurikuler dk ON pt.id_dimensi = dk.id_dimensi
       WHERE pt.id_proyek_kelas = ? AND pt.deleted_at IS NULL
       ORDER BY pt.id_proyek_tujuan ASC`,
      [idProyek]
    );
    return rows;
  } catch (error) {
    console.error('Fetch tujuan list error:', error);
    return [];
  }
}

async function getDimensi() {
  try {
    const [rows]: any = await pool.query(
      'SELECT id_dimensi, dimensi FROM dimensi_kokurikuler WHERE deleted_at IS NULL ORDER BY id_dimensi ASC'
    );
    return rows;
  } catch {
    return [];
  }
}

async function getUsers() {
  try {
    const [rows]: any = await pool.query(
      'SELECT id_user, nama, username FROM users WHERE deleted_at IS NULL ORDER BY nama ASC'
    );
    return rows;
  } catch {
    return [];
  }
}

async function getKelas() {
  try {
    const [rows]: any = await pool.query('SELECT id_kelas, nama_kelas FROM kelas ORDER BY nama_kelas ASC');
    return rows;
  } catch {
    return [];
  }
}

export default async function KokurikulerEditPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');

  const { id } = await params;
  const proyekId = Number(id);
  if (isNaN(proyekId)) notFound();

  const [proyek, tujuanList, refDimensi, refUser, refKelas] = await Promise.all([
    getProyekDetail(proyekId),
    getTujuanList(proyekId),
    getDimensi(),
    getUsers(),
    getKelas(),
  ]);

  if (!proyek) notFound();

  return (
    <div>
      <KokurikulerEditClient
        proyek={proyek}
        tujuanList={tujuanList}
        refDimensi={refDimensi}
        refUser={refUser}
        refKelas={refKelas}
      />
    </div>
  );
}
