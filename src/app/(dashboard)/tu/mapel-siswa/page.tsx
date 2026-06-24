import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import MapelSiswaGrid from './_components/mapel-siswa-grid';

async function getKelasList() {
  const [rows]: any = await pool.query(`
    SELECT k.id_kelas, k.nama_kelas, t.tingkat, kk.kompetensi_keahlian
    FROM kelas k
    JOIN tingkat t ON k.id_tingkat = t.id_tingkat
    LEFT JOIN kompetensi_keahlian kk ON k.id_kompetensi_keahlian = kk.id_kompetensi_keahlian
    ORDER BY k.id_kelas ASC
  `);
  return rows.map((k: any) => ({
    id: k.id_kelas,
    label: `${k.tingkat} ${k.nama_kelas} (${k.kompetensi_keahlian || '-'})`,
  }));
}

async function getSubjects(kelasId: number, tahun: number, semester: number) {
  const [rows]: any = await pool.query(`
    SELECT m.id_mapel, m.nama_mapel
    FROM mapel_kelas mk
    JOIN mapel m ON mk.id_mapel = m.id_mapel
    WHERE mk.id_kelas = ? AND mk.tahun = ? AND mk.semester = ?
    ORDER BY m.urut ASC
  `, [kelasId, tahun, semester]);
  return rows;
}

async function getStudents(kelasId: number, tahun: number, semester: number) {
  const [rows]: any = await pool.query(`
    SELECT s.id_siswa, s.nama_siswa, s.nisn
    FROM siswa_kelas sk
    JOIN siswa s ON sk.id_siswa = s.id_siswa
    WHERE sk.id_kelas = ? AND sk.tahun = ? AND sk.semester = ? AND sk.status = 1 AND s.deleted_at IS NULL
    ORDER BY s.nama_siswa ASC
  `, [kelasId, tahun, semester]);
  return rows;
}

async function getEnrollments(kelasId: number, tahun: number, semester: number) {
  const [rows]: any = await pool.query(`
    SELECT id_siswa, id_mapel
    FROM mapel_siswa
    WHERE id_kelas = ? AND tahun = ? AND semester = ? AND aktif = 1
  `, [kelasId, tahun, semester]);
  return rows;
}

export default async function MapelSiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ kelas?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) redirect('/login');

  const { kelas } = await searchParams;
  const sekolah = await getSekolahWithFilter();
  const kelasList = await getKelasList();

  let subjects: any[] = [];
  let students: any[] = [];

  if (kelas) {
    const kelasId = parseInt(kelas);
    const mapelRows = await getSubjects(kelasId, sekolah.tahun, sekolah.semester);
    const siswaRows = await getStudents(kelasId, sekolah.tahun, sekolah.semester);
    const enrollmentRows = await getEnrollments(kelasId, sekolah.tahun, sekolah.semester);

    subjects = mapelRows;
    const enrollmentMap: Record<number, Set<number>> = {};
    for (const e of enrollmentRows) {
      if (!enrollmentMap[e.id_siswa]) enrollmentMap[e.id_siswa] = new Set();
      enrollmentMap[e.id_siswa].add(e.id_mapel);
    }

    students = siswaRows.map((s: any) => ({
      id_siswa: s.id_siswa,
      nama_siswa: s.nama_siswa,
      nisn: s.nisn,
      enrollments: enrollmentMap[s.id_siswa] || new Set(),
    }));
  }

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Mapel Pilihan Siswa</h4>
      <MapelSiswaGrid
        kelasList={kelasList}
        selectedKelasId={kelas ? parseInt(kelas) : null}
        subjects={subjects}
        students={students}
        tahun={sekolah.tahun}
        semester={sekolah.semester}
      />
    </div>
  );
}
