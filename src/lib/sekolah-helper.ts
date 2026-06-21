import { pool } from './db';
import { getViewFilter } from './view-filter';

export async function getSekolahWithFilter() {
  const [rows]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = 1');
  const sekolah = rows[0];

  const filter = await getViewFilter();

  if (filter.tahun && filter.semester) {
    sekolah.tahun = filter.tahun;
    sekolah.semester = filter.semester;
    sekolah.is_historical_view = true;
  } else {
    sekolah.is_historical_view = false;
  }

  return sekolah;
}
