'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const menus = [
  {
    label: 'Dashboard',
    href: '/siswa',
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  },
  {
    label: 'Nilai Saya',
    href: '/siswa/nilai',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: 'Presensi',
    href: '/siswa/presensi',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
];

export default function SidebarSiswa() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sekolah-logo')
      .then((response) => response.json())
      .then((data) => {
        if (data.logo) setLogo(`/api/uploads/sekolah/${data.logo}`);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity lg:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-64 flex-col bg-[#0F0F1A] text-white transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-white/[0.06] px-6">
          <Link href="/siswa" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white/10">
              {logo ? (
                <img
                  src={logo}
                  alt="Logo Sekolah"
                  className="h-full w-full object-contain"
                  onError={() => setLogo(null)}
                />
              ) : (
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.1 12.1 0 0121 17.5c-2.88 1.64-5.98 2.5-9 2.5s-6.12-.86-9-2.5a12.1 12.1 0 012.84-6.922L12 14z" />
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Portal Siswa</h1>
              <p className="text-[11px] text-white/40">E-Rapor SMK</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Menu Siswa
          </p>
          {menus.map((menu) => {
            const active = pathname === menu.href;
            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  active
                    ? 'bg-red-500/10 text-red-400 shadow-[inset_3px_0_0_rgba(239,68,68,0.6)]'
                    : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
                }`}
              >
                <svg className="h-4 w-4 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menu.icon} />
                </svg>
                <span>{menu.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] px-6 py-4">
          <p className="text-xs leading-relaxed text-white/35">
            Informasi yang ditampilkan mengikuti periode akademik aktif.
          </p>
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-[#0F0F1A] p-2 text-white premium-shadow lg:hidden"
        aria-label={open ? 'Tutup menu' : 'Buka menu'}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>
    </>
  );
}
