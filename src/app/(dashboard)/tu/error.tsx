'use client';

export default function TuError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-20">
      <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-red-500 mb-2">Terjadi kesalahan</p>
      <p className="text-sm text-[#6B7280] mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="bg-[#DC2626] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#B91C1C] transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}
