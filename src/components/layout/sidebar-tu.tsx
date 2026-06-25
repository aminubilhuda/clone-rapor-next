'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

interface Option {
  value: string;
  label: string;
  tahun: string;
  semester: string;
}
interface SidebarData {
  options: Option[];
  currentValue: string;
  activeLabel: string;
  isHistorical: boolean;
}

const menuItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', href: '/tu', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    ],
  },
  {
    section: 'Data Sekolah',
    items: [
      { label: 'Profile Sekolah', href: '/tu/profil', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { label: 'Pegawai', href: '/tu/pegawai', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { label: 'Data Siswa', href: '/tu/kesiswaan', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { label: 'Mata Pelajaran', href: '/tu/mapel', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
      { label: 'Ekstrakurikuler', href: '/tu/ekstra', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
      { label: 'Kompetensi Keahlian', href: '/tu/kompetensi', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
      { label: 'Prakerin', href: '/tu/prakerin', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { label: 'Deskripsi Rapor', href: '/tu/deskripsi-rapor', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ],
  },
  {
    section: 'Kelas',
    items: [
      { label: 'Kelas/Rombel', href: '/tu/rombel', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      { label: 'Anggota Kelas', href: '/tu/anggota-kelas', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { label: 'Mapel Kelas', href: '/tu/mapel-kelas', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
      { label: 'Mapel Pilihan Siswa', href: '/tu/mapel-siswa', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { label: 'Naik Kelas', href: '/tu/naik-kelas', icon: 'M13 7l5 5m0 0l-5 5m5-5H6' },
    ],
  },
  {
    section: 'Laporan & Pengaturan',
    items: [
      { label: 'Leger Nilai', href: '/tu/laporan-pendidikan', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { label: 'P5BK', href: '/tu/p5bk', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { label: 'Piket Harian', href: '/tu/piket-harian', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { label: 'Pengaturan', href: '/tu/pengaturan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ],
  },
];

export default function SidebarTU({ data }: { data?: SidebarData }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const options = data?.options || [];
  const currentValue = data?.currentValue || '';
  const activeLabel = data?.activeLabel || 'Data Aktif';
  const isHistorical = data?.isHistorical || false;

  const handleChange = (val: string) => {
    const opt = options.find(o => o.value === val);
    const f = document.createElement('form');
    f.method = 'POST';
    f.action = '/api/tu/view-filter';
    if (!opt) {
      const i = document.createElement('input');
      i.name = 'action'; i.value = 'clear'; i.type = 'hidden';
      f.appendChild(i);
    } else {
      const i1 = document.createElement('input');
      i1.name = 'tahun'; i1.value = opt.tahun; i1.type = 'hidden';
      const i2 = document.createElement('input');
      i2.name = 'semester'; i2.value = opt.semester; i2.type = 'hidden';
      f.appendChild(i1); f.appendChild(i2);
    }
    const r = document.createElement('input');
    r.name = 'redirect'; r.value = window.location.pathname; r.type = 'hidden';
    f.appendChild(r);
    document.body.appendChild(f);
    f.submit();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-20 transition-opacity duration-300 lg:hidden ${collapsed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setCollapsed(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-[#0F0F1A] text-white flex flex-col transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${collapsed ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/[0.06]">
          <Link href="/tu" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Tata Usaha</h1>
              <p className="text-[11px] text-white/40">E-Rapor SMK</p>
            </div>
          </Link>
        </div>

        {/* Profile */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" id="sidebar-user-name">Admin</p>
            <p className="text-[11px] text-emerald-400/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400/80 rounded-full inline-block" />
              online
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-white/30 hover:text-red-400/80 transition-colors"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Year/Semester Filter */}
        {options.length > 0 && (
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
              Filter Periode
            </p>
            <select
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full text-xs bg-white/5 text-white/80 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition"
            >
              <option value="" className="bg-[#0F0F1A]">Data Aktif ({activeLabel})</option>
              {options.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0F0F1A]">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {menuItems.map((group) => (
            <div key={group.section}>
              <button
                onClick={() => toggleSection(group.section)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest hover:text-white/60 transition-colors"
              >
                {group.section}
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${expandedSections[group.section] !== false ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {(expandedSections[group.section] !== false) && (
                <div className="space-y-0.5 mt-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                        isActive(item.href)
                          ? 'bg-red-500/10 text-red-400 shadow-[inset_3px_0_0_rgba(239,68,68,0.6)]'
                          : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
                      }`}
                    >
                      <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-[#0F0F1A] text-white p-2 rounded-lg premium-shadow"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>
    </>
  );
}
