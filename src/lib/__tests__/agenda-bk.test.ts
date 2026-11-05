import { describe, expect, it } from 'vitest';
import { formatAgendaDate, formatAgendaRange, groupAgendaByWeek, type AgendaBKRow } from '../agenda-bk';

function row(id: number, tanggal: string, waktu: string | null = null): AgendaBKRow {
  return {
    id_agenda: id,
    tanggal,
    waktu,
    jenis_kegiatan: `Kegiatan ${id}`,
    bidang: 'pribadi',
    sasaran: null,
    hasil: null,
    tindak_lanjut: null,
  };
}

describe('formatAgendaDate', () => {
  it('menampilkan hari dan tanggal dalam Bahasa Indonesia', () => {
    expect(formatAgendaDate('2026-08-10')).toBe('Senin, 10 Agustus 2026');
  });
});

describe('formatAgendaRange', () => {
  it('meringkas rentang dalam bulan yang sama', () => {
    expect(formatAgendaRange(new Date('2026-08-10T00:00:00Z'), new Date('2026-08-14T00:00:00Z'))).toBe(
      '10–14 Agustus 2026',
    );
  });

  it('menulis bulan berbeda', () => {
    expect(formatAgendaRange(new Date('2026-08-31T00:00:00Z'), new Date('2026-09-04T00:00:00Z'))).toBe(
      '31 Agustus – 4 September 2026',
    );
  });
});

describe('groupAgendaByWeek', () => {
  it('mengelompokkan berdasarkan minggu Senin dan mengurutkan tanggal', () => {
    const weeks = groupAgendaByWeek([
      row(2, '2026-08-18'),
      row(1, '2026-08-10'),
      row(3, '2026-08-11'),
    ]);

    expect(weeks).toHaveLength(2);
    expect(weeks[0].label).toBe('Minggu 1');
    expect(weeks[0].range).toBe('10–11 Agustus 2026');
    expect(weeks[0].rows.map((r) => r.id_agenda)).toEqual([1, 3]);
    expect(weeks[1].label).toBe('Minggu 2');
    expect(weeks[1].range).toBe('18 Agustus 2026');
  });
});
