import Topbar from './topbar';
import Footer from './footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  bottomNav?: React.ReactNode;
}

export default function DashboardLayout({ children, sidebar, bottomNav }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {sidebar}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className={`flex-1 min-h-0 overflow-y-auto bg-[#F8F9FB] p-3 sm:p-6 ${bottomNav ? 'pb-24 lg:pb-6' : ''}`}>
          <div className="min-h-full flex flex-col">
            <div className="flex-1 pb-6">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {bottomNav}
    </div>
  );
}
