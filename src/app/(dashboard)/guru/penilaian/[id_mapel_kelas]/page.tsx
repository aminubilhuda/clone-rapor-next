import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import PenilaianClient from './_components/penilaian-client';

interface PageProps {
  params: Promise<{ id_mapel_kelas: string }>;
  searchParams: Promise<{ detail?: string }>;
}

async function getPenilaianData(id_mapel_kelas: string, detail: string | undefined) {
  const sekolah = await getSekolahWithFilter();

  const [mapelKelasRows]: any = await pool.query(`
    SELECT mk.*, k.nama_kelas, m.nama_mapel, m.s_mapel
    FROM mapel_kelas mk
    JOIN kelas k ON mk.id_kelas = k.id_kelas
    JOIN mapel m ON mk.id_mapel = m.id_mapel
    WHERE mk.id_mapel_kelas = ? AND mk.tahun = ? AND mk.semester = ?
  `, [id_mapel_kelas, sekolah.tahun, sekolah.semester]);

  if (mapelKelasRows.length === 0) return null;
  const mapelKelas = mapelKelasRows[0];

  const [tujuanRows]: any = await pool.query(`
    SELECT * FROM tujuan_pembelajaran
    WHERE tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ?
    ORDER BY urut ASC
  `, [sekolah.tahun, sekolah.semester, mapelKelas.id_kelas, mapelKelas.id_mapel]);

  const [siswaRows]: any = await pool.query(`
    SELECT sk.*, s.nama_siswa, s.nis
    FROM siswa_kelas sk
    JOIN siswa s ON sk.id_siswa = s.id_siswa
    JOIN mapel_siswa ms ON sk.id_siswa = ms.id_siswa
      AND ms.tahun = sk.tahun AND ms.semester = sk.semester
    WHERE sk.tahun = ? AND sk.semester = ? AND sk.id_kelas = ?
      AND ms.id_mapel = ? AND ms.aktif = 1 AND s.aktif = 1 AND s.deleted_at IS NULL
    ORDER BY s.nis ASC
  `, [sekolah.tahun, sekolah.semester, mapelKelas.id_kelas, mapelKelas.id_mapel]);

  const activeDetail = detail || 'formatif';

  if (activeDetail === 'sumatif-as') {
    const [rf]: any = await pool.query(`
      SELECT n.*, tp.urut as tp_urut FROM nilai_formatif n
      LEFT JOIN tujuan_pembelajaran tp ON n.id_tujuan = tp.id_tujuan AND tp.tahun = n.tahun AND tp.semester = n.semester
      WHERE n.tahun = ? AND n.semester = ? AND n.id_kelas = ? AND n.id_mapel = ?
      ORDER BY n.id_siswa, tp_urut ASC
    `, [sekolah.tahun, sekolah.semester, mapelKelas.id_kelas, mapelKelas.id_mapel]);

    const [rph]: any = await pool.query(`
      SELECT n.*, tp.urut as tp_urut FROM nilai_sumatif_ph n
      LEFT JOIN tujuan_pembelajaran tp ON n.id_tujuan = tp.id_tujuan AND tp.tahun = n.tahun AND tp.semester = n.semester
      WHERE n.tahun = ? AND n.semester = ? AND n.id_kelas = ? AND n.id_mapel = ?
      ORDER BY n.id_siswa, tp_urut ASC
    `, [sekolah.tahun, sekolah.semester, mapelKelas.id_kelas, mapelKelas.id_mapel]);

    const [ras]: any = await pool.query(`
      SELECT * FROM nilai_sumatif_as
      WHERE tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ?
      ORDER BY id_siswa
    `, [sekolah.tahun, sekolah.semester, mapelKelas.id_kelas, mapelKelas.id_mapel]);

    return {
      mapelKelas,
      tujuanPembelajaran: [...tujuanRows],
      siswa: [...siswaRows],
      nilai: [...ras],
      activeDetail,
      nilaiFormatif: [...rf],
      nilaiPH: [...rph],
      nilaiAS: [...ras],
    };
  }

  const tableName = {
    'formatif': 'nilai_formatif',
    'sumatif-harian': 'nilai_sumatif_ph',
    'sumatif-ts': 'nilai_sumatif_ts',
    'sumatif-as': 'nilai_sumatif_as',
  }[activeDetail] || 'nilai_formatif';

  if (activeDetail === 'sumatif-ts') {
    const [rows]: any = await pool.query(
      `SELECT * FROM nilai_sumatif_ts WHERE tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? ORDER BY id_siswa`,
      [sekolah.tahun, sekolah.semester, mapelKelas.id_kelas, mapelKelas.id_mapel]
    );
    return {
      mapelKelas, siswa: [...siswaRows], tujuanPembelajaran: [],
      nilai: rows, activeDetail, nilaiFormatif: [], nilaiPH: [], nilaiAS: [],
    };
  }

  const [rows]: any = await pool.query(
    `SELECT n.*, tp.urut as tp_urut FROM \`${tableName}\` n
     LEFT JOIN tujuan_pembelajaran tp ON n.id_tujuan = tp.id_tujuan AND tp.tahun = n.tahun AND tp.semester = n.semester
     WHERE n.tahun = ? AND n.semester = ? AND n.id_kelas = ? AND n.id_mapel = ?
     ORDER BY n.id_siswa, tp_urut ASC`,
    [sekolah.tahun, sekolah.semester, mapelKelas.id_kelas, mapelKelas.id_mapel]
  );

  return {
    mapelKelas,
    tujuanPembelajaran: [...tujuanRows],
    siswa: [...siswaRows],
    nilai: rows,
    activeDetail,
    nilaiFormatif: [],
    nilaiPH: [],
    nilaiAS: [],
  };
}

export default async function PenilaianPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const { id_mapel_kelas } = await params;
  const { detail } = await searchParams;
  const data = await getPenilaianData(id_mapel_kelas, detail);

  if (!data) return <div className="text-red-500">Data tidak ditemukan.</div>;

  return (
    <div>
      <div className="mb-4">
        <a href="/guru/kelas-ku" className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          ← Kembali
        </a>
      </div>
      <PenilaianClient data={data} idMapelKelas={id_mapel_kelas} />
    </div>
  );
}
