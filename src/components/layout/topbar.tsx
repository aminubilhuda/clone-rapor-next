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
  '/guru/absensi-piket': 'Absensi Piket',
};

export default function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userName = session?.user?.name || 'User';
  const pageTitle = pageTitles[pathname] || 'Dashboard';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isGuru = pathname.startsWith('/guru');
  const roleLabel = isGuru ? 'Guru' : 'Tata Usaha';
  const profilHref = isGuru ? '/guru/profil' : '/tu/profil-user';

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
    <div className="h-16 bg-white/80 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between px-6 premium-shadow" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
      <div>
        <h2 className="text-base font-semibold text-[#1A1A2E]">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#1A1A2E]/5 transition-colors"
          >
            <div className="w-8 h-8 bg-[#1A1A2E]/5 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-[#1A1A2E]/60">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <svg className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] premium-shadow-lg py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.04)]">
                <p className="text-sm font-semibold text-[#1A1A2E] truncate">{userName}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{roleLabel}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <a
                  href={profilHref}
                  onClick={() => setIsProfileOpen(false)}
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
