'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const pageTitles: Record<string, string> = {
  '/tu': 'Dashboard',
  '/tu/profil': 'Profile Sekolah',
  '/tu/pegawai': 'Data Pegawai',
  '/tu/kesiswaan': 'Data Siswa',
  '/tu/mapel': 'Mata Pelajaran',
  '/tu/ekstra': 'Ekstrakurikuler',
  '/tu/organisasi': 'Organisasi',
  '/tu/kompetensi': 'Kompetensi Keahlian',
  '/tu/prakerin': 'Prakerin',
  '/tu/deskripsi-rapor': 'Deskripsi Rapor',
  '/tu/rombel': 'Kelas / Rombel',
  '/tu/anggota-kelas': 'Anggota Kelas',
  '/tu/mapel-kelas': 'Mapel Kelas',
  '/tu/mapel-siswa': 'Mapel Pilihan Siswa',
  '/tu/naik-kelas': 'Naik Kelas',
  '/tu/laporan-pendidikan': 'Laporan Pendidikan',
  '/tu/laporan-pendidikan/daftar-rapor': 'Daftar Rapor',
  '/tu/p5bk': 'P5BK',
  '/tu/piket-harian': 'Piket Harian',
  '/tu/pengaturan': 'Pengaturan',
  '/tu/singkron-dapodik': 'Singkron DAPODIK',
  '/tu/notifikasi': 'Kirim Notifikasi',
  '/guru/absensi-piket': 'Absensi Piket',
  '/guru/rekap-absensi-bk': 'Rekap Absensi BK',
  '/guru/catatan-wali': 'Catatan Wali',
  '/guru/catatan-rapor': 'Daftar Rapor',
  '/siswa': 'Dashboard Siswa',
  '/siswa/profile': 'Profil Saya',
  '/siswa/akun': 'Akun & Keamanan',
  '/siswa/nilai': 'Nilai Saya',
  '/siswa/presensi': 'Presensi Saya',
};

export default function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userName = session?.user?.name || 'User';
  const pageTitle = pageTitles[pathname] || 'Dashboard';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isGuru = pathname.startsWith('/guru');
  const isSiswa = pathname.startsWith('/siswa');
  const roleLabel = isSiswa ? 'Siswa' : isGuru ? 'Guru' : 'Tata Usaha';
  const profilHref = isSiswa ? '/siswa/profile' : isGuru ? '/guru/profil' : '/tu/profil-user';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-16 items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.06)] bg-white/80 pl-16 pr-4 backdrop-blur-md premium-shadow lg:px-6" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-[#1A1A2E]">
          {pageTitle}
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-10 max-w-52 items-center gap-2 rounded-lg px-1.5 transition-colors hover:bg-[#1A1A2E]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A2E]/20"
            title={`Menu profil ${userName}`}
            aria-label={`Menu profil ${userName}`}
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            aria-controls="profile-menu"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A1A2E]/5" aria-hidden="true">
              <span className="text-xs font-medium text-[#1A1A2E]/60">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden max-w-36 truncate text-sm font-medium text-[#1A1A2E] sm:block">
              {userName}
            </span>
            <svg className={`hidden h-4 w-4 shrink-0 text-[#6B7280] transition-transform duration-200 sm:block ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isProfileOpen && (
            <div id="profile-menu" role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.06)] bg-white premium-shadow-lg">
              <div className="flex items-center gap-3 border-b border-[rgba(0,0,0,0.04)] px-4 py-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A1A2E]/5" aria-hidden="true">
                  <span className="text-sm font-semibold text-[#1A1A2E]/60">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1A1A2E]">{userName}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{roleLabel}</p>
                </div>
              </div>

              <div className="py-1">
                <a
                  href={profilHref}
                  onClick={() => setIsProfileOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A1A2E] hover:bg-[#F8F9FB] transition-colors"
                >
                  <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil
                </a>
                <div className="border-t border-[rgba(0,0,0,0.04)] my-1" />
                <button
                  onClick={async () => {
                    await signOut({ redirect: false });
                    window.location.href = '/login';
                  }}
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
