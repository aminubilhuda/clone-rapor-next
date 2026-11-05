export interface AgendaBKRow {
  id_agenda: number;
  tanggal: string;
  waktu: string | null;
  jenis_kegiatan: string;
  bidang: string;
  sasaran: string | null;
  hasil: string | null;
  tindak_lanjut: string | null;
}

export interface AgendaBKWeek {
  key: string;
  label: string;
  range: string;
  rows: AgendaBKRow[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

const dayFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', timeZone: 'UTC' });
const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'UTC' });
const yearFormatter = new Intl.DateTimeFormat('id-ID', { year: 'numeric', timeZone: 'UTC' });
const fullDateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfWeek(date: Date): Date {
  const day = date.getUTCDay();
  const diff = (day + 6) % 7;
  return new Date(date.getTime() - diff * DAY_MS);
}

export function formatAgendaDate(value: string): string {
  const date = parseDate(value);
  return date ? fullDateFormatter.format(date) : value;
}

export function formatAgendaRange(start: Date, end: Date): string {
  const d1 = dayFormatter.format(start);
  const d2 = dayFormatter.format(end);
  const m1 = monthFormatter.format(start);
  const m2 = monthFormatter.format(end);
  const y1 = yearFormatter.format(start);
  const y2 = yearFormatter.format(end);

  if (y1 !== y2) return `${d1} ${m1} ${y1} – ${d2} ${m2} ${y2}`;
  if (m1 !== m2) return `${d1} ${m1} – ${d2} ${m2} ${y1}`;
  if (d1 === d2) return `${d1} ${m1} ${y1}`;
  return `${d1}–${d2} ${m1} ${y1}`;
}

export function groupAgendaByWeek(rows: AgendaBKRow[]): AgendaBKWeek[] {
  const sorted = [...rows].sort((a, b) => {
    const byDate = a.tanggal.localeCompare(b.tanggal);
    if (byDate !== 0) return byDate;
    return (a.waktu ?? '').localeCompare(b.waktu ?? '');
  });

  const grouped = new Map<string, AgendaBKRow[]>();
  for (const row of sorted) {
    const date = parseDate(row.tanggal);
    if (!date) continue;
    const key = startOfWeek(date).toISOString().slice(0, 10);
    const list = grouped.get(key) ?? [];
    list.push(row);
    grouped.set(key, list);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, weekRows], index) => {
      const first = parseDate(weekRows[0].tanggal)!;
      const last = parseDate(weekRows[weekRows.length - 1].tanggal)!;
      return {
        key,
        label: `Minggu ${index + 1}`,
        range: formatAgendaRange(first, last),
        rows: weekRows,
      };
    });
}
