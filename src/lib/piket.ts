import { pool } from './db';

export async function isGuruPiketToday(idUser: number): Promise<boolean> {
  if (!Number.isInteger(idUser) || idUser <= 0) return false;

  const [rows]: any = await pool.query(
    `SELECT 1
     FROM piket_harian ph
     JOIN harian h ON h.id_harian = ph.id_harian
     WHERE ph.id_user = ?
       AND ph.deleted_at IS NULL
       AND h.deleted_at IS NULL
       AND h.harian = ELT(WEEKDAY(CURDATE()) + 1, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')
     LIMIT 1`,
    [idUser]
  );

  return rows.length > 0;
}
