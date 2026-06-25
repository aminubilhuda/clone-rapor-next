import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/toast-provider';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Rapor SMK Abdi Negara Tuban',
  description: 'Sistem Informasi Rapor SMK Abdi Negara Tuban',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${outfit.className} min-h-full flex flex-col`}>
        <SessionProvider session={session}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
