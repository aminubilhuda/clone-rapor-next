import Link from 'next/link';

export const metadata = {
  title: '404 - Halaman Tidak Ditemukan',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-4">
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] p-10 text-center max-w-md w-full">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4">
          <span className="text-xl font-bold text-[#DC2626]">404</span>
        </div>
        <h1 className="text-xl font-bold text-[#1A1A2E] mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-[#6B7280] mb-6">
          Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#DC2626] hover:bg-[#B91C1C] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
