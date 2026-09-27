import { describe, it, expect } from 'vitest';
import { excelDateToISO, findHeaderLoose, findHeaderStrict, normHeader } from '../excel';

describe('normHeader', () => {
  it('normalizes punctuation and spacing', () => {
    expect(normHeader('Nama Siswa *')).toBe('nama siswa');
    expect(normHeader('tanggal_lahir')).toBe('tanggal lahir');
  });
});

describe('findHeaderStrict', () => {
  const headers = ['Nama Siswa *', 'NIS', 'NISN', 'Jenis Kelamin', 'Tgl Lahir'];

  it('matches normalized keys', () => {
    expect(findHeaderStrict(headers, ['nama siswa'])).toBe('Nama Siswa *');
    expect(findHeaderStrict(headers, ['tanggal lahir', 'tgl lahir'])).toBe('Tgl Lahir');
  });

  it('does not false-match nisn to nis', () => {
    expect(findHeaderStrict(['NISN'], ['nis'])).toBeNull();
  });
});

describe('findHeaderLoose', () => {
  it('matches substring keys', () => {
    expect(findHeaderLoose(['Tanggal Mulai PKL'], ['tanggal mulai'])).toBe('Tanggal Mulai PKL');
  });
});

describe('excelDateToISO', () => {
  it('handles excel serial numbers', () => {
    expect(excelDateToISO(45000)).toBe('2023-03-15');
  });

  it('handles DD/MM/YYYY and DD-MM-YYYY', () => {
    expect(excelDateToISO('27/09/2026')).toBe('2026-09-27');
    expect(excelDateToISO('5-1-2020')).toBe('2020-01-05');
  });

  it('handles YYYY-MM-DD', () => {
    expect(excelDateToISO('2026-09-27')).toBe('2026-09-27');
  });

  it('handles 2-digit years', () => {
    expect(excelDateToISO('27/09/26')).toBe('2026-09-27');
    expect(excelDateToISO('27/09/99')).toBe('1999-09-27');
  });

  it('returns null for empty or invalid', () => {
    expect(excelDateToISO(null)).toBeNull();
    expect(excelDateToISO('')).toBeNull();
  });
});
