export interface DapodikConnection {
  url: string;
  token: string;
  npsn: string;
}

interface DapodikResponse<T> {
  results: number;
  id: string;
  start: number;
  limit: number;
  rows: T;
}

const DEFAULT_PAGE_SIZE = 100;
const MAX_ROWS = 10000;
const TIMEOUT_MS = 20000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function rawFetch(conn: DapodikConnection, endpoint: string, start: number, limit: number) {
  const base = conn.url.replace(/\/+$/, '');
  const url = `${base}/${endpoint}?npsn=${encodeURIComponent(conn.npsn)}&start=${start}&limit=${limit}`;

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAY_MS * attempt);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${conn.token}` },
        cache: 'no-store',
        signal: controller.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Gagal memuat ${endpoint} (HTTP ${res.status})`);
      }
      try {
        return JSON.parse(text) as DapodikResponse<unknown>;
      } catch (e) {
        throw new Error(`Respons ${endpoint} bukan JSON valid: ${text.slice(0, 120)}`);
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        lastErr = new Error(`Timeout memuat ${endpoint} (lebih dari ${TIMEOUT_MS / 1000} detik)`);
      } else {
        lastErr = e;
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr ?? new Error(`Gagal memuat ${endpoint}`);
}

/** Ambil semua baris dengan paginasi otomatis (rows berupa array). */
export async function fetchDapodik<T extends Record<string, unknown>>(
  conn: DapodikConnection,
  endpoint: string
): Promise<T[]> {
  const all: T[] = [];
  let start = 0;
  let total = Infinity;

  while (start < total && all.length < MAX_ROWS) {
    const data = await rawFetch(conn, endpoint, start, DEFAULT_PAGE_SIZE);
    total = data.results;
    if (!Array.isArray(data.rows)) {
      throw new Error(`Respons ${endpoint} tidak valid (rows bukan array)`);
    }
    all.push(...(data.rows as T[]));
    if ((data.rows as T[]).length === 0) break;
    start += (data.rows as T[]).length;
  }
  return all;
}

/** Ambil satu record (getSekolah — rows berupa objek tunggal). */
export async function fetchDapodikSingle<T extends Record<string, unknown>>(
  conn: DapodikConnection,
  endpoint: string
): Promise<T> {
  const data = await rawFetch(conn, endpoint, 0, 1);
  if (data.rows == null || Array.isArray(data.rows)) {
    throw new Error(`Respons ${endpoint} tidak valid`);
  }
  return data.rows as T;
}
