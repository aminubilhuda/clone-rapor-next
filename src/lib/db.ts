import mysql from 'mysql2/promise';

const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 50,
    connectTimeout: 10000,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export { pool };

// Typed wrapper over pool.query. Returns the row array as T[] so call sites
// avoid `const [rows]: any = await pool.query(...)`.
// ponytail: opt-in — adopt incrementally; existing `: any` call sites still work.
export async function dbQuery<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}
