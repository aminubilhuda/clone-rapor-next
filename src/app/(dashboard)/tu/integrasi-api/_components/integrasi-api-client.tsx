'use client';

import { useState } from 'react';
import { ApiKeyItem, createApiKey, toggleApiKeyStatus, deleteApiKey } from '@/lib/actions/api-key-actions';
import { useToast } from '@/components/ui/toast-provider';

interface IntegrasiApiClientProps {
  initialKeys: ApiKeyItem[];
}

interface EndpointDoc {
  id: string;
  name: string;
  category: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  authRequired: boolean;
  params?: { name: string; type: string; required: boolean; description: string; default?: string }[];
  bodyParams?: { name: string; type: string; required: boolean; description: string; example?: any }[];
  sampleResponse: any;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: 'auth-login',
    name: 'Login Pengguna (Dapatkan JWT)',
    category: 'Autentikasi',
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'Endpoint untuk autentikasi pengguna (Admin, Guru, Siswa) dan memperoleh JWT Bearer Token.',
    authRequired: false,
    bodyParams: [
      { name: 'username', type: 'string', required: true, description: 'Username akun (NIP, NISN, atau username)', example: 'abdira' },
      { name: 'password', type: 'string', required: true, description: 'Password akun', example: 'abdira' },
    ],
    sampleResponse: {
      success: true,
      statusCode: 200,
      message: 'Login berhasil',
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer',
        expiresIn: 604800,
        user: {
          id_user: 1,
          username: 'abdira',
          nama: 'ADMINISTRATOR',
          jabatan: 2,
          nama_jabatan: 'Operator Sekolah',
          role: 'tu_admin',
        },
      },
    },
  },
  {
    id: 'auth-me',
    name: 'Profil Saya (Current User)',
    category: 'Autentikasi',
    method: 'GET',
    path: '/api/v1/auth/me',
    description: 'Mengambil informasi lengkap profil pengguna yang saat ini sedang login dari token.',
    authRequired: true,
    sampleResponse: {
      success: true,
      statusCode: 200,
      message: 'Profil user berhasil diambil',
      data: {
        id_user: 1,
        username: 'abdira',
        nama: 'ADMINISTRATOR',
        jabatan: 2,
        nama_jabatan: 'Operator Sekolah',
        nip: '-',
        nuptk: '-',
        kontak: '08123456789',
        is_bk: false,
      },
    },
  },
  {
    id: 'sekolah',
    name: 'Profil Sekolah & Periode Aktif',
    category: 'Sekolah & Periode',
    method: 'GET',
    path: '/api/v1/sekolah',
    description: 'Mengambil data profil sekolah lengkap (NPSN, NSS, Alamat, Kontak, Logo, Kepala Sekolah) dan status tahun/semester aktif saat ini.',
    authRequired: true,
    sampleResponse: {
      success: true,
      statusCode: 200,
      message: 'Data profil sekolah berhasil diambil',
      data: {
        id_sekolah: 1,
        npsn: '20505005',
        nama_sekolah: 'SMK ABDINEGARA',
        status_sekolah: 'Swasta',
        periode_aktif: {
          id_tahun: 3,
          tahun_pelajaran: '2026-2027',
          id_semester: 1,
          nama_semester: 'Ganjil',
        },
        kepala_sekolah: {
          nama: 'H. Sutrisno, M.Pd.',
          nip: '197203151998021004',
        },
      },
    },
  },
  {
    id: 'periode',
    name: 'Daftar Tahun Pelajaran & Semester',
    category: 'Sekolah & Periode',
    method: 'GET',
    path: '/api/v1/periode',
    description: 'Mengambil daftar semua tahun pelajaran dan semester yang terdaftar di sistem.',
    authRequired: true,
    sampleResponse: {
      success: true,
      statusCode: 200,
      data: {
        periode_aktif: { id_tahun: 3, id_semester: 1 },
        tahun_pelajaran: [
          { id_tahun_pelajaran: 1, tahun_pelajaran: '2024-2025', is_aktif: false },
          { id_tahun_pelajaran: 3, tahun_pelajaran: '2026-2027', is_aktif: true },
        ],
        semester: [
          { id_semester: 1, nama_semester: 'Ganjil', is_aktif: true },
          { id_semester: 2, nama_semester: 'Genap', is_aktif: false },
        ],
      },
    },
  },
  {
    id: 'jurusan',
    name: 'Daftar Jurusan (Kompetensi Keahlian)',
    category: 'Jurusan & Rombel',
    method: 'GET',
    path: '/api/v1/jurusan',
    description: 'Mengambil daftar kompetensi keahlian / jurusan beserta jumlah siswa aktif di dalamnya.',
    authRequired: true,
    sampleResponse: {
      success: true,
      statusCode: 200,
      data: [
        {
          id_jurusan: 1,
          nama_jurusan: 'Teknik Komputer dan Jaringan',
          deskripsi: 'Program Keahlian TKJ',
          total_siswa: 45,
        },
      ],
    },
  },
  {
    id: 'rombel',
    name: 'Daftar Rombongan Belajar (Kelas)',
    category: 'Jurusan & Rombel',
    method: 'GET',
    path: '/api/v1/rombel',
    description: 'Mengambil daftar rombongan belajar / kelas beserta informasi wali kelas dan jumlah siswa.',
    authRequired: true,
    params: [
      { name: 'tahun', type: 'number', required: false, description: 'Filter ID tahun pelajaran' },
      { name: 'semester', type: 'number', required: false, description: 'Filter ID semester' },
      { name: 'id_jurusan', type: 'number', required: false, description: 'Filter ID jurusan' },
    ],
    sampleResponse: {
      success: true,
      statusCode: 200,
      data: [
        {
          id_kelas: 1,
          nama_kelas: 'X TKJ 1',
          tingkat: { id_tingkat: 1, tingkat: 'Tingkat 10', tabjad: 'X' },
          jurusan: { id_jurusan: 1, nama_jurusan: 'Teknik Komputer dan Jaringan' },
          wali_kelas: { id_user: 5, nama: 'Budi Santoso, S.Pd.', nip: '19850101...' },
          jumlah_siswa: 32,
        },
      ],
    },
  },
  {
    id: 'rombel-siswa',
    name: 'Daftar Siswa Per Kelas',
    category: 'Jurusan & Rombel',
    method: 'GET',
    path: '/api/v1/rombel/1/siswa',
    description: 'Mengambil seluruh siswa yang terdaftar pada kelas tertentu pada tahun/semester aktif.',
    authRequired: true,
    sampleResponse: {
      success: true,
      statusCode: 200,
      data: {
        kelas: { id_kelas: 1, nama_kelas: 'X TKJ 1' },
        total_siswa: 32,
        siswa: [
          { id_siswa: 1, nama_siswa: 'AHMAD DANI', nis: '222310001', nisn: '0061234567' },
        ],
      },
    },
  },
  {
    id: 'siswa-list',
    name: 'Daftar Siswa (Filter & Paginasi)',
    category: 'Siswa & Guru',
    method: 'GET',
    path: '/api/v1/siswa',
    description: 'Mengambil daftar siswa dengan fitur pencarian nama/NIS/NISN, filter kelas, jurusan, serta paginasi.',
    authRequired: true,
    params: [
      { name: 'search', type: 'string', required: false, description: 'Kata kunci pencarian nama/NIS/NISN' },
      { name: 'id_kelas', type: 'number', required: false, description: 'Filter ID kelas' },
      { name: 'page', type: 'number', required: false, description: 'Nomor halaman (default: 1)', default: '1' },
      { name: 'limit', type: 'number', required: false, description: 'Jumlah data per halaman (default: 20)', default: '20' },
    ],
    sampleResponse: {
      success: true,
      statusCode: 200,
      data: [
        {
          id_siswa: 1,
          nama_siswa: 'AHMAD DANI',
          nis: '222310001',
          nisn: '0061234567',
          jenis_kelamin: 'Laki-laki',
          agama: 'Islam',
          jurusan: { id_jurusan: 1, nama_jurusan: 'Teknik Komputer dan Jaringan' },
          kelas_aktif: { id_kelas: 1, nama_kelas: 'X TKJ 1' },
        },
      ],
      meta: { page: 1, perPage: 20, total: 150, totalPages: 8 },
    },
  },
  {
    id: 'siswa-detail',
    name: 'Detail Biodata Siswa Lengkap',
    category: 'Siswa & Guru',
    method: 'GET',
    path: '/api/v1/siswa/1',
    description: 'Mengambil data profil siswa secara lengkap, termasuk biodata orang tua/wali dan riwayat kelas.',
    authRequired: true,
    sampleResponse: {
      success: true,
      statusCode: 200,
      data: {
        id_siswa: 1,
        nama_siswa: 'AHMAD DANI',
        nis: '222310001',
        orang_tua: {
          ayah: { nama: 'Suryanto', pekerjaan: 'Wiraswasta' },
          ibu: { nama: 'Siti Aminah', pekerjaan: 'Ibu Rumah Tangga' },
        },
        riwayat_kelas: [
          { id_kelas: 1, nama_kelas: 'X TKJ 1', tahun_pelajaran: '2026-2027', nama_semester: 'Ganjil' },
        ],
      },
    },
  },
  {
    id: 'guru-list',
    name: 'Daftar Guru & Pegawai',
    category: 'Siswa & Guru',
    method: 'GET',
    path: '/api/v1/guru',
    description: 'Mengambil daftar tenaga pendidik dan kependidikan di sekolah.',
    authRequired: true,
    params: [
      { name: 'search', type: 'string', required: false, description: 'Cari nama/NIP/NUPTK' },
      { name: 'jabatan', type: 'number', required: false, description: 'Filter jabatan (3 = Guru)' },
    ],
    sampleResponse: {
      success: true,
      statusCode: 200,
      data: [
        {
          id_user: 1,
          nama: 'ADMINISTRATOR',
          nip: '-',
          jabatan: { id_jabatan: 2, nama_jabatan: 'Operator Sekolah' },
          is_bk: false,
        },
      ],
    },
  },
  {
    id: 'ekskul-list',
    name: 'Daftar Ekstrakurikuler',
    category: 'Ekstrakurikuler',
    method: 'GET',
    path: '/api/v1/ekskul',
    description: 'Mengambil daftar ekstrakurikuler beserta nama pembina dan jumlah anggotanya.',
    authRequired: true,
    sampleResponse: {
      success: true,
      statusCode: 200,
      data: [
        {
          id_eskul: 1,
          nama_eskul: 'Pramuka',
          pembina: { id_user: 3, nama: 'Bambang Irawan, S.Pd.' },
          total_anggota: 45,
        },
      ],
    },
  },
  {
    id: 'nilai-list',
    name: 'Data Nilai Mata Pelajaran / Rapor',
    category: 'Nilai & Presensi',
    method: 'GET',
    path: '/api/v1/nilai?id_kelas=1',
    description: 'Mengambil nilai akhir mata pelajaran siswa. Bisa difilter berdasarkan id_kelas atau id_siswa.',
    authRequired: true,
    params: [
      { name: 'id_kelas', type: 'number', required: false, description: 'Filter ID kelas' },
      { name: 'id_siswa', type: 'number', required: false, description: 'Filter ID siswa' },
      { name: 'include_detail', type: 'boolean', required: false, description: 'Sertakan rincian nilai formatif & sumatif (true/false)' },
    ],
    sampleResponse: {
      success: true,
      statusCode: 200,
      data: [
        {
          id_nilai: 1,
          siswa: { id_siswa: 1, nama_siswa: 'AHMAD DANI' },
          mata_pelajaran: { id_mapel: 1, nama_mapel: 'Bahasa Indonesia', kode: 'BI' },
          nilai_akhir: 88,
        },
      ],
    },
  },
  {
    id: 'presensi-get',
    name: 'Rekapitulasi & Log Presensi',
    category: 'Nilai & Presensi',
    method: 'GET',
    path: '/api/v1/presensi?id_kelas=1',
    description: 'Mengambil log kehadiran dan rekapitulasi absen siswa (Hadir, Sakit, Izin, Alpa).',
    authRequired: true,
    params: [
      { name: 'id_kelas', type: 'number', required: false, description: 'Filter ID kelas' },
      { name: 'id_siswa', type: 'number', required: false, description: 'Filter ID siswa' },
      { name: 'tanggal', type: 'string', required: false, description: 'Filter tanggal (YYYY-MM-DD)' },
    ],
    sampleResponse: {
      success: true,
      statusCode: 200,
      data: {
        total_log: 32,
        logs: [
          {
            id_presensi: 1,
            tanggal: '2026-08-22',
            siswa: { id_siswa: 1, nama_siswa: 'AHMAD DANI' },
            status: { id_absen: 1, nama: 'Hadir', kode: 'H' },
            jumlah: 1,
          },
        ],
      },
    },
  },
  {
    id: 'presensi-post',
    name: 'Catat / Sinkronisasi Presensi',
    category: 'Nilai & Presensi',
    method: 'POST',
    path: '/api/v1/presensi',
    description: 'Mencatat presensi siswa baru dari aplikasi mobile atau scanner RFID/fingerprint.',
    authRequired: true,
    bodyParams: [
      { name: 'id_siswa', type: 'number', required: true, description: 'ID siswa yang diabsen', example: 1 },
      { name: 'id_absen', type: 'number', required: true, description: 'Status absen (1=Hadir, 2=Sakit, 3=Izin, 4=Alpa)', example: 1 },
      { name: 'tanggal', type: 'string', required: true, description: 'Tanggal absen format YYYY-MM-DD', example: '2026-08-22' },
      { name: 'id_kelas', type: 'number', required: false, description: 'ID kelas siswa (opsional, auto-resolve)', example: 1 },
    ],
    sampleResponse: {
      success: true,
      statusCode: 201,
      message: 'Data presensi berhasil disimpan',
      data: { id_siswa: 1, id_kelas: 1, id_absen: 1, tanggal: '2026-08-22', jumlah: 1 },
    },
  },
];

export default function IntegrasiApiClient({ initialKeys }: IntegrasiApiClientProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'keys' | 'docs'>('keys');
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);

  // Modal create key
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // Selected endpoint for testing in Docs tab
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [customParam, setCustomParam] = useState<string>('');

  const activeKey = keys.find((k) => k.is_active === 1)?.key_value || 'YOUR_API_KEY';

  const handleCopy = (text: string, label = 'Teks') => {
    navigator.clipboard.writeText(text);
    showToast(`${label} berhasil disalin ke clipboard!`, 'success');
  };

  const handleCreateKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await createApiKey(fd);
    setIsSubmitting(false);

    if (res.success && res.key) {
      setCreatedKey(res.key);
      showToast('API Key baru berhasil dibuat!', 'success');
      // Refresh list
      setKeys([
        {
          id_api_key: Date.now(),
          nama: (fd.get('nama') as string) || 'API Key',
          key_value: res.key,
          is_active: 1,
          deskripsi: (fd.get('deskripsi') as string) || null,
          last_used_at: null,
          created_at: new Date().toISOString(),
        },
        ...keys,
      ]);
    } else {
      showToast(res.error || 'Gagal membuat API Key', 'error');
    }
  };

  const handleToggleKey = async (id: number, currentActive: number) => {
    const res = await toggleApiKeyStatus(id, currentActive === 1);
    if (res.success) {
      setKeys(keys.map((k) => (k.id_api_key === id ? { ...k, is_active: res.is_active } : k)));
      showToast('Status API Key berhasil diperbarui', 'success');
    } else {
      showToast(res.error || 'Gagal mengubah status', 'error');
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus API Key ini? Akses aplikasi yang menggunakan key ini akan terputus.')) return;
    const res = await deleteApiKey(id);
    if (res.success) {
      setKeys(keys.filter((k) => k.id_api_key !== id));
      showToast('API Key berhasil dihapus', 'success');
    } else {
      showToast(res.error || 'Gagal menghapus API Key', 'error');
    }
  };

  const handleRunTest = async () => {
    setIsLoadingTest(true);
    setTestResult(null);
    try {
      let url = selectedEndpoint.path;
      if (customParam.trim()) {
        url += (url.includes('?') ? '&' : '?') + customParam.trim();
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (selectedEndpoint.authRequired && activeKey !== 'YOUR_API_KEY') {
        headers['X-API-KEY'] = activeKey;
      }

      let reqOptions: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (selectedEndpoint.method === 'POST') {
        const bodyPayload: Record<string, any> = {};
        selectedEndpoint.bodyParams?.forEach((p) => {
          bodyPayload[p.name] = p.example !== undefined ? p.example : 'test';
        });
        reqOptions.body = JSON.stringify(bodyPayload);
      }

      const res = await fetch(url, reqOptions);
      const json = await res.json();
      setTestResult({
        status: res.status,
        statusText: res.statusText,
        body: json,
      });
      showToast(`Response ${res.status} diterima`, res.ok ? 'success' : 'error');
    } catch (err: any) {
      setTestResult({
        status: 500,
        statusText: 'Client Error',
        body: { error: err.message },
      });
      showToast('Gagal menghubungi endpoint', 'error');
    } finally {
      setIsLoadingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A1A2E] via-[#242444] to-[#3B1E48] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              REST API v1 Active
            </span>
            <span className="text-xs text-white/50">Base URL: /api/v1</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Integrasi API & Dokumentasi Pengembang</h1>
          <p className="text-sm text-white/70 mt-1 max-w-2xl">
            Kelola kunci otorisasi API Key dan jelajahi dokumentasi interaktif untuk menghubungkan aplikasi mobile, scanner RFID, atau sistem eksternal.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/10 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'keys' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Manajemen API Key ({keys.length})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'docs' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Panduan & API Tester
          </button>
        </div>
      </div>

      {/* TAB 1: MANAJEMEN API KEY */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="font-semibold text-gray-800">Kunci Akses API (API Keys)</h2>
              <p className="text-xs text-gray-500">API Key digunakan pada Header <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono">X-API-KEY</code> untuk integrasi otomatis.</p>
            </div>
            <button
              onClick={() => {
                setCreatedKey(null);
                setShowModalAdd(true);
              }}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat API Key Baru
            </button>
          </div>

          {/* Table List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nama Aplikasi / Klien</th>
                    <th className="px-6 py-4">Kunci Token (API Key)</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4">Terakhir Digunakan</th>
                    <th className="px-6 py-4">Tanggal Dibuat</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-normal">
                  {keys.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                        Belum ada API Key yang dibuat. Klik &quot;Buat API Key Baru&quot; di atas.
                      </td>
                    </tr>
                  ) : (
                    keys.map((k) => (
                      <tr key={k.id_api_key} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div>{k.nama}</div>
                          {k.deskripsi && <div className="text-xs text-gray-400 font-normal mt-0.5">{k.deskripsi}</div>}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md border border-gray-200">
                              {k.key_value.substring(0, 16)}••••••••••••••••
                            </span>
                            <button
                              onClick={() => handleCopy(k.key_value, 'API Key')}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                              title="Salin API Key Lengkap"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleKey(k.id_api_key, k.is_active)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                              k.is_active === 1
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${k.is_active === 1 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {k.is_active === 1 ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {k.last_used_at ? new Date(k.last_used_at).toLocaleString('id-ID') : 'Belum pernah'}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(k.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteKey(k.id_api_key)}
                            className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition"
                            title="Hapus API Key"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PANDUAN DOKUMENTASI & TESTER */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Menu Endpoints */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Daftar Endpoint API v1</h3>
              <div className="space-y-1 max-h-[700px] overflow-y-auto pr-1">
                {ENDPOINTS.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEndpoint(ep);
                      setTestResult(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between gap-2 ${
                      selectedEndpoint.id === ep.id
                        ? 'bg-red-50 text-[#DC2626] font-semibold border border-red-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-medium">{ep.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono truncate">{ep.path}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        ep.method === 'POST' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Endpoint Details & Tester */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
              {/* Endpoint Header */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      selectedEndpoint.method === 'POST'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedEndpoint.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedEndpoint.description}</p>
              </div>

              {/* Authentication Info */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-blue-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Metode Autentikasi
                </div>
                {selectedEndpoint.authRequired ? (
                  <p>
                    Gunakan Header <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-700">X-API-KEY: {activeKey}</code> atau <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-700">Authorization: Bearer &lt;TOKEN_JWT&gt;</code>.
                  </p>
                ) : (
                  <p>Endpoint ini dapat diakses secara publik tanpa token (khusus login).</p>
                )}
              </div>

              {/* Parameters Table if any */}
              {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
                <div>
                  <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wider mb-2">Query Parameters</h4>
                  <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-600">
                        <tr>
                          <th className="p-2.5">Parameter</th>
                          <th className="p-2.5">Tipe</th>
                          <th className="p-2.5">Wajib</th>
                          <th className="p-2.5">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedEndpoint.params.map((p) => (
                          <tr key={p.name}>
                            <td className="p-2.5 font-mono text-red-600">{p.name}</td>
                            <td className="p-2.5 text-gray-500">{p.type}</td>
                            <td className="p-2.5">{p.required ? <span className="text-red-500 font-semibold">Ya</span> : 'Tidak'}</td>
                            <td className="p-2.5 text-gray-600">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* cURL Example Snippet */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wider">Contoh Request (cURL)</h4>
                  <button
                    onClick={() =>
                      handleCopy(
                        `curl -X ${selectedEndpoint.method} http://localhost:3000${selectedEndpoint.path} \\
  -H "Content-Type: application/json" ${
    selectedEndpoint.authRequired ? `\\\n  -H "X-API-KEY: ${activeKey}"` : ''
  }${
    selectedEndpoint.method === 'POST'
      ? ` \\\n  -d '${JSON.stringify(
          selectedEndpoint.bodyParams?.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.example }), {})
        )}'`
      : ''
  }`,
                        'Perintah cURL'
                      )
                    }
                    className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Salin cURL
                  </button>
                </div>
                <pre className="bg-[#1A1A2E] text-emerald-400 p-3.5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-gray-800">
                  {`curl -X ${selectedEndpoint.method} http://localhost:3000${selectedEndpoint.path} \\
  -H "Content-Type: application/json"${
    selectedEndpoint.authRequired ? ` \\\n  -H "X-API-KEY: ${activeKey}"` : ''
  }${
    selectedEndpoint.method === 'POST'
      ? ` \\\n  -d '${JSON.stringify(
          selectedEndpoint.bodyParams?.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.example }), {})
        )}'`
      : ''
  }`}
                </pre>
              </div>

              {/* Interactive Tester Playground */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    API Playground (Uji Langsung)
                  </h4>
                  <button
                    onClick={handleRunTest}
                    disabled={isLoadingTest}
                    className="bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-gray-400 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-sm"
                  >
                    {isLoadingTest ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Kirim Request (Test)
                      </>
                    )}
                  </button>
                </div>

                {/* Custom Query Input */}
                {selectedEndpoint.method === 'GET' && (
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Query Params Tambahan (opsional):
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: limit=5&search=Ahmad"
                      value={customParam}
                      onChange={(e) => setCustomParam(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                )}

                {/* Live Response Viewer */}
                {testResult && (
                  <div className="space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">Respons Server:</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          testResult.status >= 200 && testResult.status < 300
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        Status: {testResult.status} {testResult.statusText}
                      </span>
                    </div>
                    <pre className="bg-[#0D1117] text-gray-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-gray-800">
                      {JSON.stringify(testResult.body, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add API Key */}
      {showModalAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModalAdd(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Buat API Key Baru</h3>
              <button onClick={() => setShowModalAdd(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {createdKey ? (
              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm">
                  <div className="font-semibold flex items-center gap-2 text-emerald-900 mb-1">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    API Key Berhasil Dibuat!
                  </div>
                  Salin kunci ini sekarang. Kunci ini siap digunakan untuk aplikasi klien Anda.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Token API Key Anda:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdKey}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 font-bold"
                    />
                    <button
                      onClick={() => handleCopy(createdKey, 'API Key')}
                      className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-medium shrink-0"
                    >
                      Salin
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setShowModalAdd(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nama Aplikasi / Klien <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nama"
                    required
                    placeholder="misal: Aplikasi Android Siswa / Mesin Absensi"
                    className="w-full bg-[#F8F9FB] border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#DC2626] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Deskripsi / Keterangan (opsional)
                  </label>
                  <textarea
                    name="deskripsi"
                    rows={3}
                    placeholder="Keterangan peruntukan akses token..."
                    className="w-full bg-[#F8F9FB] border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#DC2626] transition"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModalAdd(false)}
                    className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
                  >
                    {isSubmitting ? 'Membuat...' : 'Generate API Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
