import { pool } from './db';
import { auth } from './auth';
import { getViewFilter } from './view-filter';
import { JABATAN, SEKOLAH_ID } from './constants';

export async function getSekolahAktif() {
  const [rows]: any = await pool.query(
    'SELECT tahun, semester FROM sekolah WHERE id_sekolah = ?',
    [SEKOLAH_ID]
  );
  const sekolah = rows[0];
  if (!sekolah) {
    throw new Error('Data sekolah tidak ditemukan.');
  }
  return sekolah;
}

export async function getSekolahWithFilter() {
  const [rows]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = ?', [SEKOLAH_ID]);
  const sekolah = rows[0];

  if (!sekolah) {
    throw new Error('Data sekolah tidak ditemukan. Pastikan tabel sekolah memiliki record dengan id_sekolah = ' + SEKOLAH_ID + '.');
  }

  const session = await auth();
  const filter = await getViewFilter();

  if (session?.user?.jabatan === JABATAN.TU_ADMIN && filter.tahun && filter.semester) {
    sekolah.tahun = filter.tahun;
    sekolah.semester = filter.semester;
    sekolah.is_historical_view = true;
  } else {
    sekolah.is_historical_view = false;
  }

  return sekolah;
}
