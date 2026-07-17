import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import BukuIndukGuruClient from './_components/buku-induk-guru-client';

export default async function BukuIndukGuruPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const sekolah = await getSekolahWithFilter();
  const idUser = session.user.id_user;

  const [waliRows]: any = await pool.query(
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

  const idKelas = waliRows[0].id_kelas;
  const namaKelas = waliRows[0].nama_kelas;

  const [siswaRows]: any = await pool.query(
    `SELECT s.id_siswa, s.nama_siswa, s.nisn, s.nis, s.tempat_lahir, s.tanggal_lahir,
            s.kelamin, s.agama, s.kontak_siswa, s.jumlah_saudara, s.anak_ke,
            s.nama_ayah, s.nik_ayah, s.tahun_ayah, s.pendidikan_ayah, s.pekerjaan_ayah, s.kontak_ayah,
            s.nama_ibu, s.nik_ibu, s.tahun_ibu, s.pendidikan_ibu, s.pekerjaan_ibu, s.kontak_ibu,
            s.alamat, s.alamat_orang_tua,
            s.nama_wali, s.alamat_wali, s.pekerjaan_wali, s.kontak_wali,
            s.sekolah_asal, s.terima_tanggal, s.terima_kelas,
            s.jenis_siswa, s.aktif,
            a.agama AS nama_agama,
            jk.jenis_kelamin AS nama_kelamin,
            js.jenis_siswa AS nama_jenis_siswa,
            t.tingkat, k.nama_kelas,
            sk.tahun, sk.semester
     FROM siswa s
     JOIN siswa_kelas sk ON s.id_siswa = sk.id_siswa
     JOIN kelas k ON sk.id_kelas = k.id_kelas
     JOIN tingkat t ON k.id_tingkat = t.id_tingkat
     LEFT JOIN agama a ON s.agama = a.id_agama
     LEFT JOIN jenis_kelamin jk ON s.kelamin = jk.id_jenis_kelamin
     LEFT JOIN jenis_siswa js ON s.jenis_siswa = js.id_jenis_siswa
     WHERE sk.tahun = ? AND sk.semester = ? AND sk.id_kelas = ?
       AND sk.deleted_at IS NULL AND s.aktif = 1
     ORDER BY s.nama_siswa ASC`,
    [sekolah.tahun, sekolah.semester, idKelas]
  );

  return (
    <div>
      <BukuIndukGuruClient data={siswaRows} namaKelas={namaKelas} />
    </div>
  );
}
