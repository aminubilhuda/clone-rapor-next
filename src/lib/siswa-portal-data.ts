import 'server-only';

import { auth } from '@/lib/auth';
import { JABATAN, SEKOLAH_ID } from '@/lib/constants';
import { pool } from '@/lib/db';
import { redirect } from 'next/navigation';

export type SiswaPortalContext = {
  siswa: {
    id_siswa: number;
    nama_siswa: string;
    nis: string;
    nisn: string;
    tempat_lahir: string;
    tanggal_lahir: string | Date | null;
    jenis_kelamin: string;
    agama: string;
    kontak_siswa: string;
    alamat: string;
    nama_kelas: string;
    kompetensi_keahlian: string;
  };
  periode: {
    tahun: number;
    semester: number;
    tahun_pelajaran: string;
    nama_semester: string;
  };
};

export async function getSiswaPortalContext(): Promise<SiswaPortalContext> {
  const session = await auth();
  if (
    !session?.user ||
    session.user.jabatan !== JABATAN.SISWA ||
    !session.user.id_siswa
  ) {
    redirect('/login');
  }

  const [sekolahRows]: any = await pool.query(
    `SELECT s.tahun, s.semester, tp.tahun_pelajaran, sm.semester AS nama_semester
     FROM sekolah s
     LEFT JOIN tahun_pelajaran tp ON tp.id_tahun_pelajaran = s.tahun
     LEFT JOIN semester sm ON sm.id_semester = s.semester
     WHERE s.id_sekolah = ?`,
    [SEKOLAH_ID]
  );
  const periode = sekolahRows[0];
  if (!periode) throw new Error('Periode sekolah aktif tidak ditemukan.');

  const [siswaRows]: any = await pool.query(
    `SELECT s.id_siswa, s.nama_siswa, s.nis, s.nisn, s.tempat_lahir,
            s.tanggal_lahir, s.kontak_siswa, s.alamat,
            COALESCE(jk.jenis_kelamin, '-') AS jenis_kelamin,
            COALESCE(a.agama, '-') AS agama,
            COALESCE(k.nama_kelas, 'Belum masuk kelas') AS nama_kelas,
            COALESCE(kk.kompetensi_keahlian, '-') AS kompetensi_keahlian
     FROM siswa s
     LEFT JOIN siswa_kelas sk
       ON sk.id_siswa = s.id_siswa
      AND sk.tahun = ?
      AND sk.semester = ?
      AND sk.deleted_at IS NULL
     LEFT JOIN kelas k ON k.id_kelas = sk.id_kelas
     LEFT JOIN kompetensi_keahlian kk
       ON kk.id_kompetensi_keahlian = COALESCE(s.jurusan, k.id_kompetensi_keahlian)
     LEFT JOIN jenis_kelamin jk ON jk.id_jenis_kelamin = s.kelamin
     LEFT JOIN agama a ON a.id_agama = s.agama
     WHERE s.id_siswa = ? AND s.aktif = 1 AND s.deleted_at IS NULL
     ORDER BY sk.id_siswa_kelas DESC
     LIMIT 1`,
    [periode.tahun, periode.semester, session.user.id_siswa]
  );

  if (!siswaRows[0]) throw new Error('Data siswa tidak ditemukan atau sudah tidak aktif.');

  return {
    siswa: siswaRows[0],
    periode: {
      tahun: Number(periode.tahun),
      semester: Number(periode.semester),
      tahun_pelajaran: periode.tahun_pelajaran || '-',
      nama_semester: periode.nama_semester || '-',
    },
  };
}

export async function getNilaiSiswa() {
  const context = await getSiswaPortalContext();
  const [rows]: any = await pool.query(
    `SELECT m.nama_mapel, n.nilai
     FROM mapel_siswa ms
     JOIN mapel m ON m.id_mapel = ms.id_mapel
     LEFT JOIN nilai_mata_pelajaran n
       ON n.id_siswa = ms.id_siswa
      AND n.id_mapel = ms.id_mapel
      AND n.tahun = ms.tahun
      AND n.semester = ms.semester
      AND n.deleted_at IS NULL
     WHERE ms.id_siswa = ?
       AND ms.tahun = ?
       AND ms.semester = ?
       AND ms.aktif = 1
       AND ms.deleted_at IS NULL
     ORDER BY m.id_kelompok, m.urut, m.nama_mapel`,
    [context.siswa.id_siswa, context.periode.tahun, context.periode.semester]
  );

  return {
    ...context,
    nilai: rows.map((item: any) => ({
      nama_mapel: String(item.nama_mapel),
      nilai: item.nilai === null ? null : Math.round(Number(item.nilai)),
    })) as Array<{ nama_mapel: string; nilai: number | null }>,
  };
}

export async function getPresensiSiswa() {
  const context = await getSiswaPortalContext();
  const [rows]: any = await pool.query(
    `SELECT a.absen, COALESCE(SUM(p.jumlah), 0) AS jumlah
     FROM absen a
     LEFT JOIN presensi p
       ON p.id_absen = a.id_absen
      AND p.id_siswa = ?
      AND p.tahun = ?
      AND p.semester = ?
      AND p.deleted_at IS NULL
     WHERE a.deleted_at IS NULL
     GROUP BY a.id_absen, a.absen, a.sort
     ORDER BY a.sort`,
    [context.siswa.id_siswa, context.periode.tahun, context.periode.semester]
  );

  return {
    ...context,
    presensi: rows.map((item: any) => ({
      absen: String(item.absen),
      jumlah: Number(item.jumlah) || 0,
    })) as Array<{ absen: string; jumlah: number }>,
  };
}
