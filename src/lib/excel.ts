export const normHeader = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function findHeaderStrict(headers: string[], keys: string[]): string | null {
  for (const key of keys) {
    const nk = normHeader(key);
    if (!nk) continue;
    for (const h of headers) {
      if (normHeader(h) === nk) return h;
    }
  }

  for (const key of keys) {
    const tokens = normHeader(key).split(' ').filter(Boolean);
    if (tokens.length === 0) continue;
    for (const h of headers) {
      const headerTokens = new Set(normHeader(h).split(' ').filter(Boolean));
      if (headerTokens.size > 0 && tokens.every((t) => headerTokens.has(t))) return h;
    }
  }

  return null;
}

export function findHeaderLoose(headers: string[], keys: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const key of keys) {
    const idx = lower.findIndex((h) => h === key || h.includes(key) || key.includes(h));
    if (idx >= 0) return headers[idx];
  }
  return null;
}

export function excelDateToISO(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === 'number') {
    const d = new Date((value - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/\s+/g, ' ').trim();

    const ymd = cleaned.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;

    const dmy4 = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmy4) return `${dmy4[3]}-${dmy4[2].padStart(2, '0')}-${dmy4[1].padStart(2, '0')}`;

    const dmy2 = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/);
    if (dmy2) {
      const yy = parseInt(dmy2[3], 10);
      const yyyy = yy > 50 ? 1900 + yy : 2000 + yy;
      return `${yyyy}-${dmy2[2].padStart(2, '0')}-${dmy2[1].padStart(2, '0')}`;
    }

    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  }

  return null;
}
