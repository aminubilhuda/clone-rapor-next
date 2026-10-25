'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function PrintToolbar({ backHref, title }: { backHref: string; title?: string }) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <div className="no-print fixed right-4 top-4 z-50 flex items-center gap-2">
      <Link
        href={backHref}
        className="rounded-lg border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-xs font-medium text-[#1A1A2E] shadow-sm transition-colors hover:border-[#DC2626] hover:text-[#DC2626]"
      >
        Kembali
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#B91C1C]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Cetak / Simpan PDF
      </button>
    </div>
  );
}
