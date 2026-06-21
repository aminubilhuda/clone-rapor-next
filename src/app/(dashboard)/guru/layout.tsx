import DashboardLayout from '@/components/layout/dashboard-layout';
import SidebarGuru from '@/components/layout/sidebar-guru';

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout sidebar={<SidebarGuru />}>
      {children}
    </DashboardLayout>
  );
}
