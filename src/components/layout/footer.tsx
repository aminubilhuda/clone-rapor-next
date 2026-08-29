export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-8 pb-4 text-xs text-[#6B7280]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[rgba(0,0,0,0.06)] pt-4">
        <div className="flex items-center gap-2 text-center sm:text-left flex-wrap justify-center sm:justify-start">
          <span className="font-semibold text-[#1A1A2E]/80">E-Rapor SMK</span>
          <span className="text-gray-300">&bull;</span>
          <span>&copy; {currentYear} SMK Abdi Negara Tuban. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#6B7280]/80">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistem Aktif
          </span>
          <span>Versi 1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
