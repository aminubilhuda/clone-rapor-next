'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/siswa',
    icon: (active) => (
      <svg className="w-5 h-5 transition-transform" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 1.5 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Nilai',
    href: '/siswa/nilai',
    icon: (active) => (
      <svg className="w-5 h-5 transition-transform" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 1.5 : 2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Presensi',
    href: '/siswa/presensi',
    icon: (active) => (
      <svg className="w-5 h-5 transition-transform" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 1.5 : 2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Profil',
    href: '/siswa/profile',
    icon: (active) => (
      <svg className="w-5 h-5 transition-transform" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 1.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function BottomNavSiswa() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi Utama Siswa"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[rgba(0,0,0,0.06)] px-3 pt-2 pb-safe lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/siswa'
              ? pathname === '/siswa'
              : pathname.startsWith(item.href) ||
                (item.href === '/siswa/profile' && pathname.startsWith('/siswa/akun'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-[#DC2626] font-bold'
                  : 'text-[#6B7280] hover:text-[#1A1A2E] font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-red-50 text-[#DC2626]' : 'text-inherit'
                }`}
              >
                {item.icon(isActive)}
              </div>
              <span className="text-[11px] tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
