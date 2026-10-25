export default function CetakLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cetak-scroll h-full overflow-y-auto bg-[#eef0f3] print:h-auto print:overflow-visible print:bg-white">
      {children}
    </div>
  );
}
