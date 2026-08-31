import DashboardLayout from '@/components/layout/dashboard-layout';
import SidebarSiswa from '@/components/layout/sidebar-siswa';
import BottomNavSiswa from '@/components/layout/bottom-nav-siswa';

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout sidebar={<SidebarSiswa />} bottomNav={<BottomNavSiswa />}>
      {children}
    </DashboardLayout>
  );
}
