import { pool } from './db';

export async function isGuruPiketToday(idUser: number): Promise<boolean> {
  if (!Number.isInteger(idUser) || idUser <= 0) return false;

  const [rows]: any = await pool.query(
    `SELECT 1 FROM piket_harian
     WHERE id_user = ? AND id_harian = WEEKDAY(CURDATE()) + 1 AND deleted_at IS NULL
     LIMIT 1`,
    [idUser]
  );

  return rows.length > 0;
}
