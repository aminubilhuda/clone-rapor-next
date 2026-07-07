import { pool } from './db';
import { auth } from './auth';
import { getViewFilter } from './view-filter';

export async function getSekolahWithFilter() {
  const [rows]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = 1');
  const sekolah = rows[0];

  const session = await auth();
  const filter = await getViewFilter();

  if (session?.user?.jabatan === 2 && filter.tahun && filter.semester) {
    // Filter cookie hanya untuk TU (jabatan=2) — Guru dkk. selalu pakai
    // tahun/semester aktif dari database.
    sekolah.tahun = filter.tahun;
    sekolah.semester = filter.semester;
    sekolah.is_historical_view = true;
  } else {
    sekolah.is_historical_view = false;
  }

  return sekolah;
}
