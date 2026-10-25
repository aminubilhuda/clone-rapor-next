export const JENIS_BK = [
  {
    key: 'konseling_individu',
    label: 'Konseling Individu',
    short: 'Individu',
    desc: 'Pendampingan pribadi siswa',
    color: 'emerald',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    key: 'konseling_kelompok',
    label: 'Konseling Kelompok',
    short: 'Kelompok',
    desc: 'Pendampingan beberapa siswa',
    color: 'sky',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    key: 'mediasi',
    label: 'Mediasi',
    short: 'Mediasi',
    desc: 'Penengahan konflik',
    color: 'amber',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
  {
    key: 'konsultasi',
    label: 'Konsultasi',
    short: 'Konsultasi',
    desc: 'Konsultasi dengan pihak terkait',
    color: 'violet',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    key: 'catatan_anekdot',
    label: 'Catatan Anekdot',
    short: 'Anekdot',
    desc: 'Catatan peristiwa penting',
    color: 'rose',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
  {
    key: 'konferensi_kasus',
    label: 'Konferensi Kasus',
    short: 'Konferensi',
    desc: 'Pembahasan kasus bersama',
    color: 'indigo',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    key: 'home_visit',
    label: 'Home Visit',
    short: 'Home Visit',
    desc: 'Kunjungan ke rumah siswa',
    color: 'teal',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    key: 'referal',
    label: 'Referal / Alih Tangan',
    short: 'Referal',
    desc: 'Rujukan ke pihak lain',
    color: 'orange',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
] as const;

export type JenisLayananBK = (typeof JENIS_BK)[number]['key'];

export const JENIS_KEYS = JENIS_BK.map((j) => j.key);

export function isJenisLayananBK(value: string): value is JenisLayananBK {
  return (JENIS_KEYS as string[]).includes(value);
}

export function getJenisConfig(key: string) {
  return JENIS_BK.find((j) => j.key === key) ?? JENIS_BK[0];
}

export const BIDANG_BK = [
  { key: 'pribadi', label: 'Pribadi' },
  { key: 'sosial', label: 'Sosial' },
  { key: 'belajar', label: 'Belajar' },
  { key: 'karir', label: 'Karier' },
] as const;

export type BidangBK = (typeof BIDANG_BK)[number]['key'];

export const BIDANG_LABEL: Record<string, string> = {
  pribadi: 'Pribadi',
  sosial: 'Sosial',
  belajar: 'Belajar',
  karir: 'Karier',
};

export function bidangToArray(value: string | null | undefined): BidangBK[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v): v is BidangBK => (BIDANG_BK as readonly { key: string }[]).some((b) => b.key === v));
}

export const HEADER_FIELD_LABEL: Record<string, string> = {
  agenda: 'Agenda / Topik Sesi',
  pelaksana: 'Pelaksana',
  tempat: 'Tempat',
  pihak_terlibat: 'Pihak-pihak yang Terlibat',
  tujuan: 'Tujuan Home Visit',
  petugas: 'Petugas',
};

export const PESERTA_FIELD_LABEL: Record<string, string> = {
  permasalahan: 'Permasalahan',
  arahan: 'Arahan',
  tindak_lanjut: 'Tindak Lanjut',
  topik: 'Topik',
  pelaksana_dituju: 'Pelaksana yang Dituju',
  hasil: 'Hasil',
  peristiwa: 'Peristiwa',
  informan: 'Informan',
  pembinaan: 'Pembinaan yang Sudah Dilakukan',
  referal: 'Referal',
  dirujuk_ke: 'Dirujuk Ke',
};

export type BKHeaderField = 'agenda' | 'pelaksana' | 'tempat' | 'pihak_terlibat' | 'tujuan' | 'petugas';

export type BKPesertaField =
  | 'permasalahan'
  | 'arahan'
  | 'tindak_lanjut'
  | 'topik'
  | 'pelaksana_dituju'
  | 'hasil'
  | 'peristiwa'
  | 'informan'
  | 'pembinaan'
  | 'referal'
  | 'dirujuk_ke';

export interface JenisFieldConfig {
  header: BKHeaderField[];
  peserta: BKPesertaField[];
  requiredHeader: BKHeaderField[];
  required: BKPesertaField[];
  minPeserta: number;
  multiPeserta: boolean;
}

export const JENIS_FIELDS: Record<JenisLayananBK, JenisFieldConfig> = {
  konseling_individu: {
    header: ['agenda'],
    peserta: ['permasalahan', 'arahan', 'tindak_lanjut'],
    requiredHeader: [],
    required: ['permasalahan'],
    minPeserta: 1,
    multiPeserta: false,
  },
  konseling_kelompok: {
    header: ['agenda'],
    peserta: ['permasalahan', 'arahan', 'tindak_lanjut'],
    requiredHeader: [],
    required: ['permasalahan'],
    minPeserta: 2,
    multiPeserta: true,
  },
  mediasi: {
    header: ['agenda', 'pelaksana'],
    peserta: ['permasalahan', 'arahan', 'tindak_lanjut'],
    requiredHeader: [],
    required: ['permasalahan'],
    minPeserta: 1,
    multiPeserta: false,
  },
  konsultasi: {
    header: ['agenda'],
    peserta: ['topik', 'pelaksana_dituju', 'hasil'],
    requiredHeader: [],
    required: ['topik'],
    minPeserta: 1,
    multiPeserta: false,
  },
  catatan_anekdot: {
    header: ['agenda', 'tempat'],
    peserta: ['peristiwa', 'informan'],
    requiredHeader: [],
    required: ['peristiwa'],
    minPeserta: 1,
    multiPeserta: false,
  },
  konferensi_kasus: {
    header: ['agenda', 'pihak_terlibat'],
    peserta: ['permasalahan', 'arahan', 'tindak_lanjut'],
    requiredHeader: [],
    required: ['permasalahan'],
    minPeserta: 1,
    multiPeserta: false,
  },
  home_visit: {
    header: ['agenda', 'tujuan', 'petugas'],
    peserta: ['hasil'],
    requiredHeader: ['tujuan'],
    required: [],
    minPeserta: 1,
    multiPeserta: false,
  },
  referal: {
    header: ['agenda'],
    peserta: ['permasalahan', 'pembinaan', 'referal', 'dirujuk_ke'],
    requiredHeader: [],
    required: ['permasalahan'],
    minPeserta: 1,
    multiPeserta: false,
  },
};

export interface BKStudent {
  id_siswa: number;
  nama_siswa: string;
  nis: string | null;
  nisn: string | null;
  kelamin: string | null;
}

export interface BKSession {
  id_layanan: number;
  id_user: number;
  tanggal: string;
  jam: string | null;
  agenda: string | null;
  pelaksana: string | null;
  tempat: string | null;
  pihak_terlibat: string | null;
  tujuan: string | null;
  petugas: string | null;
  id_siswa: number;
  bidang_bimbingan: string;
  permasalahan: string | null;
  arahan: string | null;
  tindak_lanjut: string | null;
  topik: string | null;
  pelaksana_dituju: string | null;
  hasil: string | null;
  peristiwa: string | null;
  informan: string | null;
  pembinaan: string | null;
  referal: string | null;
  dirujuk_ke: string | null;
}

export function sesiSummary(session: BKSession): string {
  return (
    session.permasalahan ||
    session.topik ||
    session.peristiwa ||
    session.tujuan ||
    session.pembinaan ||
    session.hasil ||
    'Belum ada catatan'
  );
}

export function formatKelamin(value: string | number | null | undefined): string {
  if (value === 1 || value === '1' || value === 'L') return 'L';
  if (value === 2 || value === '2' || value === 'P') return 'P';
  return '—';
}

export function formatTanggal(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function formatTanggalPendek(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}
