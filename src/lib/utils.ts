// Format date to Indonesian format (dd Month yyyy)
export function formatDateIndonesia(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Get sekolah data from database
export async function getSekolahData(pool: any) {
  const [rows]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = 1');
  return rows[0] || null;
}

// Generate random string (for form codes etc)
export function randomString(length: number): string {
  const chars = 'ABCDEFGHJKLMNOPQRSTUVWXYZ123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get current user
export async function getCurrentUser(pool: any, idUser: number) {
  const [rows]: any = await pool.query('SELECT * FROM users WHERE id_user = ?', [idUser]);
  return rows[0] || null;
}
