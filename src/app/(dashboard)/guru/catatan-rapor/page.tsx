import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import CetakRaporGuruClient from './_components/cetak-rapor-guru-client';
import type { RowDataPacket } from 'mysql2';

interface WaliKelasRow extends RowDataPacket {
  id_kelas: number;
  nama_kelas: string;
}

interface SiswaRaporRow extends RowDataPacket {
  id_kelas: number;
  id_siswa: number;
  nama_siswa: string;
  nis: string;
  nisn: string;
  nama_kelas: string;
  catatan: string;
}

export default async function CetakRaporGuruPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const sekolah = await getSekolahWithFilter();
  const idUser = session.user.id_user;

  const [waliRows] = await pool.query<WaliKelasRow[]>(
    `SELECT kw.id_kelas, k.nama_kelas
     FROM kelas_wali kw
     JOIN kelas k ON kw.id_kelas = k.id_kelas
     WHERE kw.id_user = ? AND kw.tahun = ? AND kw.semester = ? AND kw.deleted_at IS NULL`,
    [idUser, sekolah.tahun, sekolah.semester]
  );

  if (waliRows.length === 0) {
    return (
      <div className="text-center py-20">
        <h4 className="text-xl font-semibold mb-4 text-gray-600">Anda bukan wali kelas</h4>
        <p className="text-gray-400">Anda tidak memiliki kelas yang diwali periode ini.</p>
      </div>
    );
  }

  const kelasIds = waliRows.map((kelas) => kelas.id_kelas);

  const [siswaRows] = await pool.query<SiswaRaporRow[]>(
    `SELECT sk.id_kelas, s.id_siswa, s.nama_siswa, s.nis, s.nisn, k.nama_kelas,
            COALESCE(cw.catatan, '') AS catatan
     FROM siswa s
     JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa
     JOIN kelas k ON sk.id_kelas = k.id_kelas
     LEFT JOIN catatan_wali cw
       ON cw.tahun = sk.tahun AND cw.semester = sk.semester
      AND cw.id_kelas = sk.id_kelas AND cw.id_siswa = sk.id_siswa
      AND cw.deleted_at IS NULL
     WHERE sk.tahun = ? AND sk.semester = ? AND sk.id_kelas IN (?)
       AND sk.deleted_at IS NULL AND s.deleted_at IS NULL AND s.aktif = 1
     ORDER BY sk.id_kelas, s.nama_siswa ASC`,
    [sekolah.tahun, sekolah.semester, kelasIds]
  );

  return (
    <div>
      <CetakRaporGuruClient
        data={siswaRows}
        kelasList={waliRows}
        tahun={sekolah.tahun}
        semester={sekolah.semester}
      />
    </div>
  );
}
