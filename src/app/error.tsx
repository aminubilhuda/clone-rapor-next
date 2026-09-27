'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-4">
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] p-10 text-center max-w-md w-full">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#1A1A2E] mb-2">Terjadi Kesalahan</h1>
        <p className="text-sm text-[#6B7280] mb-6">
          Sistem gagal memuat halaman ini. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="bg-[#DC2626] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#B91C1C] transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
