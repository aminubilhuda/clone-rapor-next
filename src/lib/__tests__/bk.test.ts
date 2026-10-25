import { describe, expect, it } from 'vitest';
import {
  BIDANG_BK,
  JENIS_BK,
  JENIS_FIELDS,
  bidangToArray,
  formatKelamin,
  isJenisLayananBK,
  sesiSummary,
  type BKSession,
} from '../bk';

describe('BK helpers', () => {
  it('mengenali 8 jenis layanan', () => {
    expect(JENIS_BK).toHaveLength(8);
    expect(isJenisLayananBK('home_visit')).toBe(true);
    expect(isJenisLayananBK('klasikal')).toBe(false);
  });

  it('memetakan bidang bimbingan dari string SET', () => {
    expect(bidangToArray('pribadi,sosial')).toEqual(['pribadi', 'sosial']);
    expect(bidangToArray('pribadi,tidak-ada')).toEqual(['pribadi']);
    expect(bidangToArray('')).toEqual([]);
    expect(BIDANG_BK.map((b) => b.key)).toEqual(['pribadi', 'sosial', 'belajar', 'karir']);
  });

  it('memformat jenis kelamin numerik', () => {
    expect(formatKelamin(1)).toBe('L');
    expect(formatKelamin('2')).toBe('P');
    expect(formatKelamin('L')).toBe('L');
    expect(formatKelamin(null)).toBe('—');
  });

  it('menentukan field wajib per jenis', () => {
    expect(JENIS_FIELDS.konseling_individu.required).toContain('permasalahan');
    expect(JENIS_FIELDS.konsultasi.required).toContain('topik');
    expect(JENIS_FIELDS.konseling_kelompok.minPeserta).toBe(2);
    expect(JENIS_FIELDS.home_visit.requiredHeader).toContain('tujuan');
    expect(JENIS_FIELDS.home_visit.peserta).toContain('hasil');
  });

  it('memilih ringkasan sesi sesuai field yang terisi', () => {
    const base = { permasalahan: null, topik: null, peristiwa: null, tujuan: null, pembinaan: null, hasil: null } as BKSession;
    expect(sesiSummary({ ...base, permasalahan: 'Sulit fokus' })).toBe('Sulit fokus');
    expect(sesiSummary({ ...base, topik: 'Konsultasi orang tua' })).toBe('Konsultasi orang tua');
    expect(sesiSummary(base)).toBe('Belum ada catatan');
  });
});
