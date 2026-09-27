import { describe, it, expect } from 'vitest';
import { escapeHtml, generateRaporHTML } from '../pdf-templates/rapor-template';

describe('escapeHtml', () => {
  it('escapes html special characters', () => {
    expect(escapeHtml('<b>"x" & \'y\'</b>')).toBe('&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
  });
});

describe('generateRaporHTML', () => {
  it('escapes untrusted student and school data', () => {
    const html = generateRaporHTML(
      'buku_induk',
      [{ id_siswa: 1, nama_siswa: '<img src=x onerror=alert(1)>', nis: '1', nisn: '2', nama_kelas: "X' AK" }],
      {
        nama_sekolah: 'S<svg onload=alert(2)>',
        alamat: 'A & B',
        logo: "x'; alert(3); //.png",
        nama_kepsek: "Kepsek'",
        nip_kepsek: '123',
      },
      '2026-2027',
      'Ganjil'
    );

    expect(html).not.toContain('<img src=x onerror');
    expect(html).not.toContain('<svg onload');
    expect(html).toContain('X&#39; AK');
    expect(html).toContain('A &amp; B');
  });
});
