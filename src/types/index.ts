import 'next-auth';
import '@auth/core/jwt';

// ===== Database Row Types =====
export interface User {
  id_user: number;
  jabatan: number;
  nama: string;
  kelamin: number;
  agama: number;
  nip: string;
  nuptk: string;
  kontak: string;
  id_kepegawaian: number;
  ijazah: number;
  id_tugas_tambahan: number;
  username: string;
  password: string;
  foto: string;
  moto: string;
}

export interface Sekolah {
  id_sekolah: number;
  npsn: string;
  nama_sekolah: string;
  id_jenjang: number;
  bentuk_sekolah: number;
  yayasan: string;
  website: string;
  alamat: string;
  email: string;
  kontak: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  logo_prov: string;
  tahun: number;
  semester: number;
  logo: string;
  gambar1: string;
  lokasi: number;
  visi: string;
  misi: string;
  frame_peta: string;
  is_historical_view?: boolean;
}

export interface KepalaSekolah {
  id_kepala: number;
  tahun: number;
  semester: number;
  nama_kepala: string;
  nip_kepala: string;
}

export interface Semester {
  id_semester: number;
  semester: string;
}

export interface TahunPelajaran {
  id_tahun_pelajaran: number;
  tahun_pelajaran: string;
}

export interface Kelas {
  id_kelas: number;
  id_tingkat: number;
  id_kompetensi_keahlian: number;
  nama_kelas: string;
}

export interface KelasWali {
  id_kelas_wali: number;
  tahun: number;
  semester: number;
  id_kelas: number;
  id_user: number;
}

export interface Mapel {
  id_mapel: number;
  id_sekolah: number;
  id_kelompok: number;
  nama_mapel: string;
  s_mapel: string;
  agama: number | null;
  urut: number;
}

export interface MapelKelas {
  id_mapel_kelas: number;
  tahun: number;
  semester: number;
  id_kelas: number;
  id_mapel: number;
  id_user: number | null;
}

export interface Siswa {
  id_siswa: number;
  nama_siswa: string;
  nis: string;
  nisn: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  kelamin: number;
  agama: number;
  alamat: string;
  jurusan: number;
  aktif: number;
}

export interface SiswaKelas {
  id_siswa_kelas: number;
  tahun: number;
  semester: number;
  id_tingkat: number;
  id_kelas: number;
  id_siswa: number;
  status: number;
}

export interface TujuanPembelajaran {
  id_tujuan: number;
  tahun: number;
  semester: number;
  id_tingkat: number;
  id_kelas: number;
  id_mapel: number;
  id_user: number;
  urut: string;
  tujuan: string;
  kktp: number;
}

// ===== Extend NextAuth types =====
declare module 'next-auth' {
  interface User {
    jabatan?: number;
    id_user?: number;
  }
  interface Session {
    user: {
      id_user?: number;
      jabatan?: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    jabatan?: number;
    id_user?: number;
  }
}
