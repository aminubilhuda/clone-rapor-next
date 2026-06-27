'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

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
};

export default function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userName = session?.user?.name || 'User';
  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <div className="h-16 bg-white/80 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between px-6 premium-shadow" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
      <div>
        <h2 className="text-base font-semibold text-[#1A1A2E]">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1A1A2E]/5 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-[#1A1A2E]/60">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
