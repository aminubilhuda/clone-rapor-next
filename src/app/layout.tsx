import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/toast-provider';
import { pool } from '@/lib/db';

const outfit = Outfit({ subsets: ['latin'] });

async function getLogoFilename(): Promise<string | null> {
  try {
    const [rows]: any = await pool.query(
      'SELECT logo FROM sekolah WHERE id_sekolah = 1 AND deleted_at IS NULL'
    );
    if (rows.length > 0 && rows[0].logo) {
      return rows[0].logo;
    }
  } catch {
    // Ignore
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const logo = await getLogoFilename();
  
  // Use logo filename as cache buster - changes when logo changes
  const faviconUrl = logo 
    ? `/api/favicon?v=${logo}` 
    : '/favicon.ico';

  return {
    title: 'E-Rapor SMK Abdi Negara Tuban',
    description: 'Sistem Informasi Rapor SMK Abdi Negara Tuban',
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
      </head>
      <body className={`${outfit.className} h-full overflow-hidden`}>
        <SessionProvider session={session}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
