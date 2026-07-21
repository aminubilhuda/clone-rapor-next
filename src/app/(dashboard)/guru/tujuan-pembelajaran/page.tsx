import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import TPMultiKelasClient from './_components/tp-multi-kelas-client';

interface PageProps {
  searchParams: Promise<{ id_mapel?: string; id_tingkat?: string }>;
}

async function getOptions(idUser: number) {
  const sekolah = await getSekolahWithFilter();

  const [rows]: any = await pool.query(`
    SELECT m.id_mapel, m.nama_mapel, t.id_tingkat, t.tingkat, t.tabjad,
      GROUP_CONCAT(DISTINCT k.nama_kelas ORDER BY k.nama_kelas SEPARATOR ', ') AS kelas_list
    FROM mapel_kelas mk
    JOIN mapel m ON mk.id_mapel = m.id_mapel
    JOIN kelas k ON mk.id_kelas = k.id_kelas
    JOIN tingkat t ON k.id_tingkat = t.id_tingkat
    WHERE mk.tahun = ? AND mk.semester = ? AND mk.id_user = ?
    GROUP BY m.id_mapel, m.nama_mapel, t.id_tingkat, t.tingkat, t.tabjad
    ORDER BY t.tingkat ASC, m.nama_mapel ASC
  `, [sekolah.tahun, sekolah.semester, idUser]);

  return rows;
}

async function getDetail(idMapel: number, idTingkat: number, idUser: number) {
  const sekolah = await getSekolahWithFilter();

  const [mapelRows]: any = await pool.query(
    'SELECT * FROM mapel WHERE id_mapel = ?', [idMapel]
  );
  if (mapelRows.length === 0) return null;

  const [kelasRows]: any = await pool.query(`
    SELECT DISTINCT k.id_kelas, k.nama_kelas
    FROM mapel_kelas mk
    JOIN kelas k ON mk.id_kelas = k.id_kelas
    WHERE mk.id_mapel = ? AND mk.tahun = ? AND mk.semester = ? AND mk.id_user = ? AND k.id_tingkat = ?
    ORDER BY k.nama_kelas ASC
  `, [idMapel, sekolah.tahun, sekolah.semester, idUser, idTingkat]);

  if (kelasRows.length === 0) return null;

  const kelasIds = kelasRows.map((k: any) => k.id_kelas);

  const [tpRows]: any = await pool.query(`
    SELECT tp.id_tujuan, tp.urut AS kode, tp.tujuan, tp.kktp, tp.urut,
           k.nama_kelas, k.id_kelas
    FROM tujuan_pembelajaran tp
    JOIN kelas k ON tp.id_kelas = k.id_kelas
    WHERE tp.tahun = ? AND tp.semester = ? AND tp.id_mapel = ? AND tp.id_user = ?
      AND tp.id_kelas IN (${kelasIds.map(() => '?').join(',')})
    ORDER BY tp.urut ASC
  `, [sekolah.tahun, sekolah.semester, idMapel, idUser, ...kelasIds]);

  const displayKey = (row: any) => {
    if (!row.kode) return row.urut;
    const parts = row.kode.split('-');
    return parts[parts.length - 1] || row.urut;
  };

  const tpGrouped = tpRows.reduce((acc: any[], row: any) => {
    const key = displayKey(row);
    const existing = acc.find(t => displayKey(t) === key);
    if (existing) {
      const kelasSudahAda = existing.kelas.some(
        (kelas: any) => kelas.id_kelas === row.id_kelas
      );
      if (!kelasSudahAda) {
        existing.kelas.push({ id_kelas: row.id_kelas, nama_kelas: row.nama_kelas });
      }
    } else {
      acc.push({
        id_tujuan: row.id_tujuan,
        kode: row.kode,
        tujuan: row.tujuan,
        kktp: row.kktp, urut: row.urut,
        kelas: [{ id_kelas: row.id_kelas, nama_kelas: row.nama_kelas }],
      });
    }
    return acc;
  }, []);

  return {
    mapel: mapelRows[0],
    kelasList: kelasRows,
    tp: tpGrouped,
  };
}

export default async function TujuanPembelajaranPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const { id_mapel, id_tingkat } = await searchParams;
  const options = await getOptions(session.user.id_user!);

  let selectedData = null;
  if (id_mapel && id_tingkat) {
    selectedData = await getDetail(Number(id_mapel), Number(id_tingkat), session.user.id_user!);
  }

  return (
    <TPMultiKelasClient
      options={options}
      selectedMapel={id_mapel ? Number(id_mapel) : null}
      selectedTingkat={id_tingkat ? Number(id_tingkat) : null}
      selectedData={selectedData}
    />
  );
}
