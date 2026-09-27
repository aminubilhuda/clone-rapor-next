import { pool } from './db';

export async function getTodayHarianId(): Promise<number | null> {
  const [rows]: any = await pool.query('SELECT WEEKDAY(CURDATE()) + 1 AS hari_id');
  const hariId = Number(rows?.[0]?.hari_id);

  if (!Number.isInteger(hariId) || hariId < 1 || hariId > 6) return null;

  return hariId;
}

export async function isGuruPiketToday(idUser: number): Promise<boolean> {
  if (!Number.isInteger(idUser) || idUser <= 0) return false;

  const hariId = await getTodayHarianId();
  if (!hariId) return false;

  const [rows]: any = await pool.query(
    `SELECT 1 FROM piket_harian
     WHERE id_user = ? AND id_harian = ? AND deleted_at IS NULL
     LIMIT 1`,
    [idUser, hariId]
  );

  return rows.length > 0;
}
