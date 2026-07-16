import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import DKNClient from './_components/dkn-client';

export default async function DaftarKumpulanNilaiPage({ searchParams }: { searchParams: Promise<{ id_tingkat?: string; id_kelas?: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');

  const params = await searchParams;
  const sekolah = await getSekolahWithFilter();
  const id_tingkat = params.id_tingkat ? Number(params.id_tingkat) : undefined;
  const id_kelas = params.id_kelas ? Number(params.id_kelas) : undefined;

  const [[tingkatRows], [jurusanRows], [kelasRows], [tpRows], [semRowsOpts]] = await Promise.all([
    pool.query('SELECT id_tingkat, tingkat, tabjad FROM tingkat ORDER BY id_tingkat'),
    pool.query('SELECT id_kompetensi_keahlian, kompetensi_keahlian FROM kompetensi_keahlian ORDER BY kompetensi_keahlian'),
    pool.query('SELECT id_kelas, nama_kelas, id_tingkat, id_kompetensi_keahlian FROM kelas WHERE deleted_at IS NULL ORDER BY nama_kelas'),
    pool.query('SELECT id_tahun_pelajaran, tahun_pelajaran FROM tahun_pelajaran ORDER BY id_tahun_pelajaran ASC'),
    pool.query('SELECT id_semester, semester FROM semester ORDER BY id_semester ASC'),
  ]);

  let siswa: any[] = [];
  let mapels: any[] = [];
  let grades: any[] = [];
  let semesterSeqs: any[] = [];

  if (id_kelas) {
    const [siswaRows]: any = await pool.query(`
      SELECT DISTINCT s.id_siswa, s.nisn, s.nama_siswa
      FROM siswa s
      JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa AND sk.deleted_at IS NULL
      WHERE s.deleted_at IS NULL AND sk.id_kelas = ?
        AND sk.tahun = ? AND sk.semester = ?
      ORDER BY s.nama_siswa
    `, [id_kelas, sekolah.tahun, sekolah.semester]);
    siswa = siswaRows;

    if (siswa.length > 0) {
      const ids = siswa.map((s: any) => s.id_siswa);

      const [mapelRows]: any = await pool.query(`
        SELECT DISTINCT m.id_mapel, m.nama_mapel, m.urut
        FROM nilai_mata_pelajaran nmp
        JOIN mapel m ON nmp.id_mapel = m.id_mapel AND m.deleted_at IS NULL
        WHERE nmp.id_siswa IN (?) AND nmp.deleted_at IS NULL
        ORDER BY m.urut ASC
      `, [ids]);
      mapels = mapelRows;

      const [gradeRows]: any = await pool.query(`
        SELECT nmp.id_siswa, nmp.id_mapel, nmp.tahun, nmp.semester, nmp.nilai
        FROM nilai_mata_pelajaran nmp
        WHERE nmp.id_siswa IN (?) AND nmp.deleted_at IS NULL
      `, [ids]);
      grades = gradeRows;

      const [semRows]: any = await pool.query(`
        SELECT DISTINCT tahun, semester
        FROM nilai_mata_pelajaran
        WHERE id_siswa IN (?) AND deleted_at IS NULL
        ORDER BY tahun ASC, semester ASC
      `, [ids]);
      semesterSeqs = semRows.map((r: any, i: number) => ({ ...r, seq: i + 1 }));
    }
  }

  return (
    <DKNClient
      tingkatList={tingkatRows as any[]}
      jurusanList={jurusanRows as any[]}
      kelasList={kelasRows as any[]}
      tahunPelajaranList={tpRows as any[]}
      semesterList={semRowsOpts as any[]}
      siswa={siswa}
      mapels={mapels}
      grades={grades}
      semesterSeqs={semesterSeqs}
      selectedTingkat={id_tingkat}
      selectedKelas={id_kelas}
      currentTahun={sekolah.tahun}
      currentSemester={sekolah.semester}
    />
  );
}
