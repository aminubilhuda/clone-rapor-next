/* Mapping data DAPODIK → entity lokal (pure functions, tanpa akses DB). */

export function stripPrefix(s: string): string {
  return s
    .replace(/^Kec\.?\s+/i, '')
    .replace(/^Kab(upaten)?\.?\s+/i, '')
    .replace(/^Prov(insi)?\.?\s+/i, '')
    .trim();
}

/** "20252" → { tahun: 2025, semester: 2 } */
export function parseSemesterId(semesterId: string): { tahun: number; semester: number } | null {
  const m = /^(\d{4})([12])$/.exec((semesterId || '').trim());
  if (!m) return null;
  return { tahun: Number(m[1]), semester: Number(m[2]) };
}

export function resolveKelamin(k: string): number {
  return String(k || '').toUpperCase() === 'P' ? 2 : 1;
}

export function resolveAgama(agamaStr: string | null, agamaMap: Map<string, number>): number | null {
  if (!agamaStr) return null;
  return agamaMap.get(agamaStr.toLowerCase()) ?? null;
}

export function resolveKepegawaian(statusStr: string | null): number {
  const s = String(statusStr || '').toLowerCase();
  if (s.includes('pns') && s.includes('ppk')) return 3;
  if (s.includes('kemenag') || s.includes('depag')) return 4;
  if (s === 'pns' || s.includes('pns')) return 1;
  if (s === 'cpns' || s.includes('cpns')) return 2;
  return 5; // Honorer Sekolah
}

export function resolvePendidikan(pendidikanStr: string | null): number {
  const s = String(pendidikanStr || '').toUpperCase();
  if (s.startsWith('S3') || s.startsWith('S2')) return 1;
  if (s.startsWith('S1') || s.startsWith('D4')) return 2;
  if (s.startsWith('D3')) return 3;
  if (s.startsWith('D2')) return 4;
  return 5; // SMA / sederajat & lainnya
}

export function resolveJabatan(jenisPtkStr: string | null): number {
  const s = String(jenisPtkStr || '');
  if (s.toLowerCase().includes('kepala')) return 1;
  if (s.toLowerCase().includes('kependidikan')) return 2;
  return 3; // Guru
}

export function resolveJenisSiswa(jenisPendaftaranStr: string | null): number {
  const s = String(jenisPendaftaranStr || '').toLowerCase();
  if (s.includes('pindah')) return 2;
  return 1; // Siswa Baru / Lanjutan semester
}

export function resolveKelompokMapel(statusKurikulumStr: string | null): number {
  const s = String(statusKurikulumStr || '');
  return s.toLowerCase().includes('kelompok a') ? 1 : 2;
}

export function resolveTingkatId(tingkatPendidikanId: string | null): number | null {
  const t = Number(tingkatPendidikanId);
  if (t === 10) return 1;
  if (t === 11) return 2;
  if (t === 12) return 3;
  return null;
}

export function norm(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set(['dan', 'di', 'yang', 'untuk', 'pada', 'dalam', 'dengan', 'dari', 'ke', 'atau']);

/** Buat singkatan mapel, mis. "Pendidikan Agama Islam dan Budi Pekerti" → "PAIBP" */
export function buatSingkatan(nama: string): string {
  const words = String(nama || '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const initials = words
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w.toLowerCase()))
    .map((w) => w[0].toUpperCase())
    .join('');
  if (initials.length >= 2) return initials;
  return words[0]?.toUpperCase().slice(0, 3) || '';
}

/** Cek apakah nama jurusan DAPODIK cocok dengan kompetensi keahlian lokal
 *  (exact, substring, atau overlap token >= 50%). */
export function jurusanMatch(dapodikNama: string, lokalNama: string, lokalDeskripsi: string): boolean {
  const a = norm(dapodikNama);
  const b = norm(lokalNama);
  const c = norm(lokalDeskripsi);
  if (!a || !b) return false;
  if (a === b || a === c) return true;
  if (a.includes(b) || b.includes(a) || c.includes(a) || a.includes(c)) return true;

  const tokens = (s: string) => s.split(/\s+/).filter((w) => w.length > 3);
  const da = tokens(a);
  const dl = tokens(`${b} ${c}`);
  if (da.length === 0) return false;
  const hit = da.filter((t) => dl.includes(t)).length;
  return hit / da.length >= 0.5;
}

/* ---------- Entities ---------- */

export interface MappedSekolah {
  npsn: string;
  nama: string;
  alamat: string;
  email: string;
  kontak: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  website: string;
}

export function mapSekolah(raw: any): MappedSekolah | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    npsn: String(raw.npsn || ''),
    nama: String(raw.nama || ''),
    alamat: String(raw.alamat_jalan || ''),
    email: String(raw.email || ''),
    kontak: String(raw.nomor_telepon || ''),
    desa: String(raw.desa_kelurahan || ''),
    kecamatan: stripPrefix(String(raw.kecamatan || '')),
    kabupaten: stripPrefix(String(raw.kabupaten_kota || '')),
    provinsi: stripPrefix(String(raw.provinsi || '')),
    website: String(raw.website || ''),
  };
}

export interface MappedJurusan {
  nama: string;
}

export function mapJurusan(rombels: any[]): MappedJurusan[] {
  const seen = new Set<string>();
  const out: MappedJurusan[] = [];
  for (const r of rombels) {
    if (r.jenis_rombel_str !== 'Kelas') continue;
    const nama = String(r.jurusan_id_str || '').trim();
    if (nama && !seen.has(norm(nama))) {
      seen.add(norm(nama));
      out.push({ nama });
    }
  }
  return out;
}

export interface MappedKelas {
  nama: string;
  tingkatId: number | null;
  jurusanNama: string | null;
}

export function mapKelas(rombels: any[]): MappedKelas[] {
  const seen = new Set<string>();
  const out: MappedKelas[] = [];
  for (const r of rombels) {
    if (r.jenis_rombel_str !== 'Kelas') continue;
    const nama = String(r.nama || '').trim();
    if (!nama || seen.has(norm(nama))) continue;
    seen.add(norm(nama));
    out.push({
      nama,
      tingkatId: resolveTingkatId(r.tingkat_pendidikan_id),
      jurusanNama: r.jurusan_id_str ? String(r.jurusan_id_str) : null,
    });
  }
  return out;
}

export interface MappedGuru {
  nik: string;
  nama: string;
  kelamin: number;
  agama: string | null;
  nuptk: string;
  nip: string;
  jabatan: number;
  kepegawaian: number;
  ijazah: number;
  tempatLahir: string;
  tanggalLahir: string;
}

export function mapGuru(gtks: any[], agamaMap: Map<string, number>): MappedGuru[] {
  const out: MappedGuru[] = [];
  const seen = new Set<string>();
  for (const g of gtks) {
    const ptkId = String(g.ptk_id || '');
    if (seen.has(ptkId)) continue;
    seen.add(ptkId);
    out.push({
      nik: String(g.nik || ''),
      nama: String(g.nama || '').trim(),
      kelamin: resolveKelamin(g.jenis_kelamin),
      agama: g.agama_id_str ? String(g.agama_id_str) : null,
      nuptk: String(g.nuptk || ''),
      nip: String(g.nip || ''),
      jabatan: resolveJabatan(g.jenis_ptk_id_str),
      kepegawaian: resolveKepegawaian(g.status_kepegawaian_id_str),
      ijazah: resolvePendidikan(g.pendidikan_terakhir),
      tempatLahir: String(g.tempat_lahir || ''),
      tanggalLahir: String(g.tanggal_lahir || ''),
    });
    // lookup agama map supaya resolver konsisten
    if (g.agama_id_str) {
      const key = String(g.agama_id_str).toLowerCase();
      if (!agamaMap.has(key)) agamaMap.set(key, Number(g.agama_id) || 1);
    }
  }
  return out;
}

export interface MappedSiswa {
  nisn: string;
  nis: string;
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  kelamin: number;
  agama: string | null;
  kontak: string;
  namaAyah: string;
  pekerjaanAyah: string;
  namaIbu: string;
  pekerjaanIbu: string;
  namaWali: string;
  pekerjaanWali: string;
  anakKe: number;
  sekolahAsal: string;
  terimaTanggal: string;
  namaRombel: string;
  tingkatId: number | null;
  jenisPendaftaran: string;
}

export function mapSiswa(pds: any[], agamaMap: Map<string, number>): MappedSiswa[] {
  const out: MappedSiswa[] = [];
  const seen = new Set<string>();
  for (const p of pds) {
    const pesertaDidikId = String(p.peserta_didik_id || '');
    if (seen.has(pesertaDidikId)) continue;
    seen.add(pesertaDidikId);
    if (p.agama_id_str) {
      const key = String(p.agama_id_str).toLowerCase();
      if (!agamaMap.has(key)) agamaMap.set(key, Number(p.agama_id) || 1);
    }
    out.push({
      nisn: String(p.nisn || ''),
      nis: String(p.nipd || ''),
      nik: String(p.nik || ''),
      nama: String(p.nama || '').trim(),
      tempatLahir: String(p.tempat_lahir || ''),
      tanggalLahir: String(p.tanggal_lahir || ''),
      kelamin: resolveKelamin(p.jenis_kelamin),
      agama: p.agama_id_str ? String(p.agama_id_str) : null,
      kontak: String(p.nomor_telepon_seluler || p.nomor_telepon_rumah || ''),
      namaAyah: String(p.nama_ayah || ''),
      pekerjaanAyah: String(p.pekerjaan_ayah_id_str || ''),
      namaIbu: String(p.nama_ibu || ''),
      pekerjaanIbu: String(p.pekerjaan_ibu_id_str || ''),
      namaWali: String(p.nama_wali || ''),
      pekerjaanWali: String(p.pekerjaan_wali_id_str || ''),
      anakKe: parseInt(p.anak_keberapa, 10) || 0,
      sekolahAsal: String(p.sekolah_asal || ''),
      terimaTanggal: String(p.tanggal_masuk_sekolah || ''),
      namaRombel: String(p.nama_rombel || ''),
      tingkatId: resolveTingkatId(p.tingkat_pendidikan_id),
      jenisPendaftaran: String(p.jenis_pendaftaran_id_str || ''),
    });
  }
  return out;
}

export interface MappedKelasWali {
  namaRombel: string;
  waliNama: string | null;
}

export function mapKelasWali(rombels: any[]): MappedKelasWali[] {
  const out: MappedKelasWali[] = [];
  for (const r of rombels) {
    if (r.jenis_rombel_str !== 'Kelas') continue;
    const nama = String(r.nama || '').trim();
    if (!nama) continue;
    out.push({
      namaRombel: nama,
      waliNama: r.ptk_id_str ? String(r.ptk_id_str) : null,
    });
  }
  return out;
}

export interface MappedMapel {
  nama: string;
  kelompok: number;
}

export function mapMapel(rombels: any[]): MappedMapel[] {
  const seen = new Set<string>();
  const out: MappedMapel[] = [];
  for (const r of rombels) {
    if (r.jenis_rombel_str !== 'Kelas') continue;
    for (const p of r.pembelajaran || []) {
      const nama = String(p.nama_mata_pelajaran || p.mata_pelajaran_id_str || '').trim();
      if (!nama || seen.has(norm(nama))) continue;
      seen.add(norm(nama));
      out.push({ nama, kelompok: resolveKelompokMapel(p.status_di_kurikulum_str) });
    }
  }
  return out;
}

export interface MappedMapelKelas {
  namaRombel: string;
  mapelNama: string;
  guruNama: string | null;
}

export function mapMapelKelas(rombels: any[]): MappedMapelKelas[] {
  const out: MappedMapelKelas[] = [];
  for (const r of rombels) {
    if (r.jenis_rombel_str !== 'Kelas') continue;
    const namaRombel = String(r.nama || '').trim();
    if (!namaRombel) continue;
    for (const p of r.pembelajaran || []) {
      const mapelNama = String(p.nama_mata_pelajaran || p.mata_pelajaran_id_str || '').trim();
      if (!mapelNama) continue;
      out.push({ namaRombel, mapelNama, guruNama: p.ptk_id_str || null });
    }
  }
  return out;
}
