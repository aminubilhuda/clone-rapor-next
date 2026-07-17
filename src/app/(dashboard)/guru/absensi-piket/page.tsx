import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cekPiketHariIni } from '@/lib/actions/presensi-actions';
import AbsensiPiketClient from './_components/absensi-piket-client';

export default async function AbsensiPiketPage() {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 3) redirect('/login');

  const hariPiket = await cekPiketHariIni();

  if (!hariPiket) {
    return (
      <div>
        <h4 className="text-xl font-semibold mb-6">Absensi Piket Harian</h4>
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FEF2F2] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">Tidak Bertugas Hari Ini</h3>
          <p className="text-sm text-[#6B7280]">Anda tidak memiliki jadwal piket pada hari ini.</p>
        </div>
      </div>
    );
  }

  return <AbsensiPiketClient />;
}
