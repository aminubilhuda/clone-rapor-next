export function parseJsonArray<T = unknown>(
  raw: string | null | undefined,
  field = 'data'
): { ok: true; value: T[] } | { ok: false; error: string } {
  if (raw === null || raw === undefined || raw === '') {
    return { ok: true, value: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { ok: false, error: `Format ${field} tidak valid` };
    }
    return { ok: true, value: parsed as T[] };
  } catch {
    return { ok: false, error: `Format ${field} tidak valid` };
  }
}

export function toPositiveInt(value: unknown): number | null {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

export function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}
