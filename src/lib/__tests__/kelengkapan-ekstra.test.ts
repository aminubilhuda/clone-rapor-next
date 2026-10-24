import { describe, expect, it } from 'vitest';
import {
  hrefKelengkapan,
  labelKelengkapan,
  type KelengkapanItem,
} from '../kelengkapan-ekstra';

const item = (over: Partial<KelengkapanItem> = {}): KelengkapanItem => ({
  jenis: 'eskul',
  id: 1,
  nama: 'Pramuka',
  anggota: 0,
  tanpaPredikat: 0,
  lengkap: false,
  ...over,
});

describe('labelKelengkapan', () => {
  it('menandai eskul tanpa anggota', () => {
    expect(labelKelengkapan(item())).toBe('belum ada anggota');
  });

  it('menandai anggota yang belum punya predikat', () => {
    expect(labelKelengkapan(item({ anggota: 5, tanpaPredikat: 2 }))).toBe(
      '2 anggota belum ada predikat',
    );
  });

  it('menyatakan lengkap bila semua anggota berpredikat', () => {
    expect(labelKelengkapan(item({ anggota: 5, lengkap: true }))).toBe('sudah lengkap');
  });

  it('organisasi cukup dinilai dari jumlah anggota', () => {
    expect(
      labelKelengkapan(item({ jenis: 'organisasi', anggota: 3, lengkap: true })),
    ).toBe('sudah lengkap');
    expect(labelKelengkapan(item({ jenis: 'organisasi' }))).toBe('belum ada anggota');
  });
});

describe('hrefKelengkapan', () => {
  it('mengarahkan eskul ke halaman detailnya', () => {
    expect(hrefKelengkapan(item({ id: 7 }))).toBe('/guru/ekstra?id_eskul=7');
  });

  it('mengarahkan organisasi ke halaman organisasi', () => {
    expect(hrefKelengkapan(item({ jenis: 'organisasi', id: 3 }))).toBe('/guru/organisasi');
  });
});
