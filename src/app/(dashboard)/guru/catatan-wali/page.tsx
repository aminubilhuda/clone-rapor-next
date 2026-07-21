import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import CatatanWaliClient from './_components/catatan-wali-client';
import type { RowDataPacket } from 'mysql2';

interface KelasWaliRow extends RowDataPacket {
  id_kelas: number;
  nama_kelas: string;
}

interface SiswaCatatanRow extends RowDataPacket {
  id_kelas: number;
  id_siswa: number;
  nama_siswa: string;
  nis: string | null;
  nisn: string | null;
  catatan: string;
}

export default async function CatatanWaliPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3 || !session.user.id_user) redirect('/login');

  const sekolah = await getSekolahWithFilter();
  const [kelasRows] = await pool.query<KelasWaliRow[]>(
    `SELECT DISTINCT k.id_kelas, k.nama_kelas
     FROM kelas_wali kw
     JOIN kelas k ON k.id_kelas = kw.id_kelas
     WHERE kw.id_user = ? AND kw.tahun = ? AND kw.semester = ?
       AND kw.deleted_at IS NULL
     ORDER BY k.nama_kelas ASC`,
    [session.user.id_user, sekolah.tahun, sekolah.semester]
  );

  if (kelasRows.length === 0) {
    return (
      <div className="py-20 text-center">
        <h4 className="text-xl font-semibold text-gray-600">Anda bukan wali kelas</h4>
        <p className="mt-2 text-sm text-gray-400">Anda tidak memiliki kelas yang diwali pada periode ini.</p>
      </div>
    );
  }

  const kelasIds = kelasRows.map((kelas) => kelas.id_kelas);
  const [siswaRows] = await pool.query<SiswaCatatanRow[]>(
    `SELECT sk.id_kelas, s.id_siswa, s.nama_siswa, s.nis, s.nisn,
            COALESCE(cw.catatan, '') AS catatan
     FROM siswa_kelas sk
     JOIN siswa s ON s.id_siswa = sk.id_siswa
     LEFT JOIN catatan_wali cw
       ON cw.tahun = sk.tahun AND cw.semester = sk.semester
      AND cw.id_kelas = sk.id_kelas AND cw.id_siswa = sk.id_siswa
      AND cw.deleted_at IS NULL
     WHERE sk.tahun = ? AND sk.semester = ? AND sk.id_kelas IN (?)
       AND sk.deleted_at IS NULL AND s.deleted_at IS NULL AND s.aktif = 1
     ORDER BY sk.id_kelas, s.nama_siswa ASC`,
    [sekolah.tahun, sekolah.semester, kelasIds]
  );

  return <CatatanWaliClient kelasList={kelasRows} initialSiswa={siswaRows} />;
}
