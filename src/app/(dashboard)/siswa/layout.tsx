import DashboardLayout from '@/components/layout/dashboard-layout';
import SidebarSiswa from '@/components/layout/sidebar-siswa';

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout sidebar={<SidebarSiswa />}>
      {children}
    </DashboardLayout>
  );
}
