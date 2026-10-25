'use client';

import { useState } from 'react';
import { JENIS_BK } from '@/lib/bk';
import type { BKClass } from '@/lib/actions/bk-actions';
import { exportBKRekap, getBKRekap, getBKRekapTU } from '@/lib/actions/bk-actions';
import { useToast } from '@/components/ui/toast-provider';

interface Row {
  id_siswa: number;
  nama_siswa: string;
  nis: string | null;
  kelamin: string | null;
  total: number;
  [key: string]: any;
}

interface Props {
  classes: BKClass[];
  idKelas: number | null;
  rows: Row[];
  forTU?: boolean;
}

export default function BKRekapClient({ classes, idKelas, rows, forTU = false }: Props) {
  const { showToast } = useToast();
  const [data, setData] = useState<Row[]>(rows);
  const [kelas, setKelas] = useState<number | null>(idKelas);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleKelas = async (value: number) => {
    setKelas(value);
    setLoading(true);
    const result = forTU ? await getBKRekapTU(value) : await getBKRekap(value);
    setData(result.rows as Row[]);
    setLoading(false);
  };

  const handleExport = async () => {
    if (!kelas) return;
    setExporting(true);
    const result = await exportBKRekap(kelas, forTU);
    setExporting(false);
    if (!result.success) {
      showToast(result.error || 'Gagal export', 'error');
      return;
    }
    const binary = atob(result.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Rekap Excel diunduh', 'success');
  };

  const totals = JENIS_BK.map((jenis) =>
    data.reduce((sum, row) => sum + Number(row[jenis.key] ?? 0), 0),
  );
  const grandTotal = data.reduce((sum, row) => sum + Number(row.total ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-xl font-semibold text-[#1A1A2E]">Rekap Layanan BK</h4>
          <p className="mt-1 text-sm text-[#6B7280]">
            Jumlah sesi per siswa untuk setiap jenis layanan.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={!kelas || exporting || data.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1A2E] transition-colors hover:border-[#DC2626] hover:text-[#DC2626] disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {exporting ? 'Menyiapkan…' : 'Export Excel'}
        </button>
      </div>

      <div className="rounded-xl border border-[rgba(0,0,0,0.04)] bg-white premium-shadow">
        <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(0,0,0,0.04)] px-5 py-3">
          <select
            value={kelas ?? ''}
            onChange={(e) => handleKelas(Number(e.target.value))}
            className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-[#F8F9FB] px-3 py-1.5 text-xs outline-none focus:border-[#DC2626]"
          >
            {classes.map((k) => (
              <option key={k.id_kelas} value={k.id_kelas}>
                {k.nama_kelas} ({k.jumlah})
              </option>
            ))}
          </select>
          <span className="text-xs text-[#9CA3AF]">{data.length} siswa</span>
          {loading && <span className="text-xs text-[#9CA3AF]">Memuat…</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-[#F8F9FB]">
              <tr className="border-b border-[rgba(0,0,0,0.06)]">
                <th className="w-10 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">No</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Nama Siswa</th>
                <th className="w-24 px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">NIS</th>
                {JENIS_BK.map((jenis) => (
                  <th key={jenis.key} className="w-12 px-1.5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]" title={jenis.label}>
                    {jenis.short}
                  </th>
                ))}
                <th className="w-14 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4 + JENIS_BK.length} className="px-4 py-12 text-center text-sm text-[#9CA3AF]">
                    Belum ada data siswa.
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id_siswa} className="border-b border-[rgba(0,0,0,0.04)] last:border-0 hover:bg-[#F8F9FB]/60">
                    <td className="px-3 py-2 text-xs tabular-nums text-[#9CA3AF]">{index + 1}</td>
                    <td className="px-3 py-2 font-medium text-[#1A1A2E]">{row.nama_siswa}</td>
                    <td className="px-2 py-2 text-xs text-[#6B7280]">{row.nis ?? '—'}</td>
                    {JENIS_BK.map((jenis) => {
                      const value = Number(row[jenis.key] ?? 0);
                      return (
                        <td key={jenis.key} className="px-1.5 py-2 text-center">
                          {value === 0 ? (
                            <span className="text-[#D1D5DB]">–</span>
                          ) : (
                            <span className="text-sm font-semibold tabular-nums text-[#1A1A2E]">{value}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-center text-sm font-bold tabular-nums text-[#DC2626]">
                      {row.total === 0 ? <span className="font-normal text-[#D1D5DB]">–</span> : row.total}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-[rgba(0,0,0,0.08)] bg-[#F8F9FB]">
                <td colSpan={3} className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Total
                </td>
                {totals.map((total, index) => (
                  <td key={JENIS_BK[index].key} className="px-1.5 py-2.5 text-center text-xs font-bold tabular-nums text-[#1A1A2E]">
                    {total === 0 ? <span className="font-normal text-[#D1D5DB]">–</span> : total}
                  </td>
                ))}
                <td className="px-2 py-2.5 text-center text-sm font-bold tabular-nums text-[#DC2626]">
                  {grandTotal === 0 ? <span className="font-normal text-[#D1D5DB]">–</span> : grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
