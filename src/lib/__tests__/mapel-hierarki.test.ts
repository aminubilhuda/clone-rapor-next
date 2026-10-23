import { describe, it, expect } from 'vitest';
import { buildMapelHierarki, type MapelHierarkiRow } from '../mapel-hierarki';

const mapel = (
  id_mapel: number,
  nama_mapel: string,
  urut: number,
  parent_id: number | null = null
): MapelHierarkiRow => ({ id_mapel, nama_mapel, urut, parent_id });

describe('buildMapelHierarki', () => {
  it('mempertahankan urutan lama jika tidak ada anak', () => {
    const items = [mapel(2, 'B', 1), mapel(1, 'A', 2)];
    const hasil = buildMapelHierarki(items);
    expect(hasil.map((n) => n.nama_mapel)).toEqual(['B', 'A']);
    expect(hasil.every((n) => !n.is_parent)).toBe(true);
  });

  it('mengelompokkan anak di bawah induk walau induk tidak ikut terdaftar', () => {
    const items = [mapel(11, 'Basis Data', 1, 20), mapel(12, 'Pemrograman Web', 2, 20)];
    const parentById = new Map([[20, mapel(20, 'RPL', 5)]]);
    const hasil = buildMapelHierarki(items, parentById);
    expect(hasil).toHaveLength(1);
    expect(hasil[0]).toMatchObject({ id_mapel: 20, nama_mapel: 'RPL', is_parent: true });
    expect(hasil[0].items.map((i) => i.nama_mapel)).toEqual(['Basis Data', 'Pemrograman Web']);
  });

  it('mengurutkan anak berdasarkan urut, nama, lalu id', () => {
    const items = [
      mapel(13, 'Zeta', 2, 20),
      mapel(12, 'Beta', 1, 20),
      mapel(11, 'Alpha', 1, 20),
    ];
    const parentById = new Map([[20, mapel(20, 'RPL', 1)]]);
    const hasil = buildMapelHierarki(items, parentById);
    expect(hasil[0].items.map((i) => i.id_mapel)).toEqual([11, 12, 13]);
  });

  it('menempatkan blok induk sesuai urut induk di antara mapel biasa', () => {
    const items = [mapel(1, 'Matematika', 1), mapel(11, 'Basis Data', 1, 20)];
    const parentById = new Map([[20, mapel(20, 'RPL', 2)]]);
    const hasil = buildMapelHierarki(items, parentById);
    expect(hasil.map((n) => n.nama_mapel)).toEqual(['Matematika', 'RPL']);
  });

  it('anak yatim tetap tampil sebagai mapel biasa', () => {
    const items = [mapel(11, 'Basis Data', 1, 99)];
    const hasil = buildMapelHierarki(items);
    expect(hasil).toEqual([
      { id_mapel: 11, nama_mapel: 'Basis Data', is_parent: false, items: [items[0]] },
    ]);
  });

  it('membuang baris induk jika induk dan anak sama-sama terdaftar', () => {
    const items = [mapel(20, 'RPL', 2), mapel(11, 'Basis Data', 1, 20)];
    const hasil = buildMapelHierarki(items);
    expect(hasil).toHaveLength(1);
    expect(hasil[0].is_parent).toBe(true);
    expect(hasil[0].items).toHaveLength(1);
  });
});
