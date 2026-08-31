import type { Metadata, Viewport } from 'next';
import './globals.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/toast-provider';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';
import { pool } from '@/lib/db';
import { SEKOLAH_ID } from '@/lib/constants';

async function getLogoFilename(): Promise<string | null> {
  try {
    const [rows]: any = await pool.query(
      'SELECT logo FROM sekolah WHERE id_sekolah = ? AND deleted_at IS NULL',
      [SEKOLAH_ID]
    );
    if (rows.length > 0 && rows[0].logo) {
      return rows[0].logo;
    }
  } catch {
    // Ignore
  }
  return null;
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export async function generateMetadata(): Promise<Metadata> {
  const logo = await getLogoFilename();
  
  // Use logo filename as cache buster - changes when logo changes
  const faviconUrl = logo 
    ? `/api/favicon?v=${logo}` 
    : '/favicon.ico';

  return {
    title: 'E-Rapor SMK Abdi Negara Tuban',
    description: 'Sistem Informasi Rapor SMK Abdi Negara Tuban',
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'E-Rapor',
    },
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/api/favicon" />
        <link rel="shortcut icon" href="/api/favicon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full overflow-hidden">
        <SessionProvider session={session}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
