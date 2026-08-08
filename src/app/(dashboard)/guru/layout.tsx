import DashboardLayout from '@/components/layout/dashboard-layout';
import SidebarGuru from '@/components/layout/sidebar-guru';
import DapodikSyncBanner from '@/components/dapodik-sync-banner';

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout sidebar={<SidebarGuru />}>
      <DapodikSyncBanner />
      {children}
    </DashboardLayout>
  );
}
