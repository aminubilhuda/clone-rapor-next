import Topbar from './topbar';
import Footer from './footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  bottomNav?: React.ReactNode;
}

export default function DashboardLayout({ children, sidebar, bottomNav }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      {/* Sidebar */}
      <div className="contents print:hidden">{sidebar}</div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden print:block print:overflow-visible">
        <div className="print:hidden">
          <Topbar />
        </div>
        <main className={`flex-1 min-h-0 overflow-y-auto bg-[#F8F9FB] p-3 sm:p-6 print:overflow-visible print:bg-white print:p-0 ${bottomNav ? 'pb-24 lg:pb-6' : ''}`}>
          <div className="min-h-full flex flex-col">
            <div className="flex-1 pb-6">
              {children}
            </div>
            <div className="print:hidden">
              <Footer />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {bottomNav}
    </div>
  );
}
