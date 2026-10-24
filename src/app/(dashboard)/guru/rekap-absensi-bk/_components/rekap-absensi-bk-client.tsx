'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import {
  getKelasListForBK,
  getRekapAbsensiBK,
  updatePresensiInline,
} from '@/lib/actions/presensi-actions';

interface KelasItem {
  id_kelas: number;
  nama_kelas: string;
  jumlah: number;
}

interface RekapItem {
  id_siswa: number;
  nama_siswa: string;
  hadir: number;
  sakit: number;
  izin: number;
  tanpa_berita: number;
}

const ABSEN_COLS = [
  { key: 'hadir', label: 'H', full: 'Hadir', text: 'text-emerald-600', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  { key: 'sakit', label: 'S', full: 'Sakit', text: 'text-amber-600', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700' },
  { key: 'izin', label: 'I', full: 'Izin', text: 'text-sky-600', dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700' },
  { key: 'tanpa_berita', label: 'TB', full: 'Tanpa Berita', text: 'text-rose-600', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700' },
] as const;

const selKey = (idSiswa: number, field: string) => `${idSiswa}-${field}`;

export default function RekapAbsensiBKClient() {
  const { showToast } = useToast();
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [rekapData, setRekapData] = useState<RekapItem[]>([]);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const cancelRef = useRef<string | null>(null);

  useEffect(() => {
    getKelasListForBK().then((data) => {
      setKelasList(data);
      setLoadingKelas(false);
    });
  }, []);

  const loadData = useCallback(async (idKelas: number) => {
    setLoadingData(true);
    setRekapData([]);
    const data = await getRekapAbsensiBK(idKelas);
    setRekapData(data);
    setLoadingData(false);
  }, []);

  const handleKelasChange = (idKelas: number) => {
    setSelectedKelas(idKelas);
    setSearch('');
    setDraft({});
    if (idKelas) loadData(idKelas);
  };

  const commitValue = async (idSiswa: number, field: string, raw: string, original: number) => {
    const key = selKey(idSiswa, field);
    const jumlah = Math.max(0, parseInt(raw || '0', 10) || 0);
    const clearDraft = () =>
      setDraft((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });

    if (jumlah === original) {
      clearDraft();
      return;
    }

    const idAbsen = field === 'hadir' ? 1 : field === 'sakit' ? 2 : field === 'izin' ? 3 : 4;
    const result = await updatePresensiInline(idSiswa, selectedKelas!, idAbsen, jumlah);

    if (result.success) {
      setRekapData((prev) =>
        prev.map((r) => (r.id_siswa === idSiswa ? { ...r, [field]: jumlah } : r))
      );
      showToast('Berhasil diupdate', 'success');
    } else {
      showToast(result.error || 'Gagal update', 'error');
    }

    clearDraft();
  };

  const filtered = rekapData.filter((r) =>
    r.nama_siswa.toLowerCase().includes(search.toLowerCase())
  );

  const totalHadir = filtered.reduce((sum, r) => sum + r.hadir, 0);
  const totalSakit = filtered.reduce((sum, r) => sum + r.sakit, 0);
  const totalIzin = filtered.reduce((sum, r) => sum + r.izin, 0);
  const totalTB = filtered.reduce((sum, r) => sum + r.tanpa_berita, 0);
  const totalAll = totalHadir + totalSakit + totalIzin + totalTB;
  const totalPerKolom: Record<string, number> = {
    hadir: totalHadir,
    sakit: totalSakit,
    izin: totalIzin,
    tanpa_berita: totalTB,
  };

  const showEmpty = !loadingKelas && !selectedKelas;
  const showTable = !loadingData && selectedKelas && rekapData.length > 0;
  const showNoData = !loadingData && selectedKelas && rekapData.length === 0;

  return (
    <div className="h-full flex flex-col">
      <h4 className="text-xl font-semibold mb-4 shrink-0">Rekap Absensi — Guru BK</h4>

      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="shrink-0 border-b border-[rgba(0,0,0,0.04)] px-5 py-3 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-[#1A1A2E]">Kelas</label>
          <select
            value={selectedKelas ?? ''}
            onChange={(e) => handleKelasChange(Number(e.target.value))}
            disabled={loadingKelas}
            className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all disabled:opacity-50"
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasList.map((k) => (
              <option key={k.id_kelas} value={k.id_kelas}>
                {k.nama_kelas} ({k.jumlah} siswa)
              </option>
            ))}
          </select>

          {showTable && (
            <>
              <span className="text-[rgba(0,0,0,0.08)]">|</span>
              <span className="text-xs text-[#6B7280]">{filtered.length} siswa</span>
              <div className="ml-auto">
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama siswa..."
                    className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all w-48"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Empty */}
          {showEmpty && (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-14 h-14 mb-3 rounded-full bg-[#F8F9FB] flex items-center justify-center">
                <svg className="w-7 h-7 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#1A1A2E]">Pilih Kelas</p>
              <p className="text-xs text-[#6B7280] mt-1">Pilih kelas untuk melihat rekap absensi siswa.</p>
            </div>
          )}

          {/* Loading */}
          {loadingData && (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-7 h-7 border-2 border-[#DC2626]/20 border-t-[#DC2626] rounded-full animate-spin mb-3" />
              <p className="text-xs text-[#6B7280]">Memuat data rekap...</p>
            </div>
          )}

          {/* No Data */}
          {showNoData && (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <p className="text-sm text-[#6B7280]">Belum ada data presensi untuk kelas ini.</p>
            </div>
          )}

          {/* Table */}
          {showTable && (
            <>
              <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(0,0,0,0.04)] bg-white px-5 py-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Ringkasan</span>
                {ABSEN_COLS.map((col) => (
                  <span
                    key={col.key}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${col.chip}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                    {col.full}
                    <span className="font-bold tabular-nums">{totalPerKolom[col.key]}</span>
                  </span>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="sticky top-0 z-10 bg-[#F8F9FB]">
                    <tr className="border-b border-[rgba(0,0,0,0.06)]">
                      <th className="w-12 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">No</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Nama Siswa</th>
                      {ABSEN_COLS.map((col) => (
                        <th
                          key={col.key}
                          title={col.full}
                          className="w-16 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                            {col.label}
                          </span>
                        </th>
                      ))}
                      <th className="w-20 px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => {
                      const jumlah = row.hadir + row.sakit + row.izin + row.tanpa_berita;
                      return (
                        <tr
                          key={row.id_siswa}
                          className="border-b border-[rgba(0,0,0,0.04)] transition-colors last:border-0 hover:bg-[#F8F9FB]/70"
                        >
                          <td className="px-4 py-1.5 text-xs tabular-nums text-[#9CA3AF]">{i + 1}</td>
                          <td className="px-4 py-1.5 font-medium text-[#1A1A2E]">{row.nama_siswa}</td>
                          {ABSEN_COLS.map((col) => {
                            const key = selKey(row.id_siswa, col.key);
                            const value = Number(row[col.key as keyof RekapItem]) || 0;
                            const raw = draft[key] ?? (value === 0 ? '' : String(value));
                            return (
                              <td key={col.key} className="px-2 py-1.5 text-center">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={raw}
                                  placeholder="–"
                                  aria-label={`${col.full} ${row.nama_siswa}`}
                                  onChange={(e) => {
                                    const next = e.target.value.replace(/[^\d]/g, '');
                                    setDraft((prev) => ({ ...prev, [key]: next }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.currentTarget.blur();
                                    } else if (e.key === 'Escape') {
                                      cancelRef.current = key;
                                      setDraft((prev) => {
                                        if (!(key in prev)) return prev;
                                        const next = { ...prev };
                                        delete next[key];
                                        return next;
                                      });
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  onBlur={(e) => {
                                    if (cancelRef.current === key) {
                                      cancelRef.current = null;
                                      return;
                                    }
                                    void commitValue(row.id_siswa, col.key, e.currentTarget.value, value);
                                  }}
                                  onFocus={(e) => e.currentTarget.select()}
                                  className={`h-8 w-12 rounded-md border border-[rgba(0,0,0,0.06)] bg-white text-center text-sm font-semibold tabular-nums outline-none transition-colors placeholder:font-normal placeholder:text-[#D1D5DB] hover:border-[rgba(0,0,0,0.12)] focus:border-[#DC2626] focus:ring-2 focus:ring-red-500/20 ${
                                    raw !== '' ? col.text : 'text-[#1A1A2E]'
                                  }`}
                                />
                              </td>
                            );
                          })}
                          <td className="px-3 py-1.5 text-center text-sm font-semibold tabular-nums text-[#1A1A2E]">
                            {jumlah === 0 ? (
                              <span className="font-normal text-[#D1D5DB]">–</span>
                            ) : (
                              jumlah
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[rgba(0,0,0,0.08)] bg-[#F8F9FB]">
                      <td colSpan={2} className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Total</td>
                      {ABSEN_COLS.map((col) => {
                        const total = totalPerKolom[col.key];
                        return (
                          <td key={col.key} className="px-2 py-2.5 text-center">
                            {total === 0 ? (
                              <span className="text-[#D1D5DB]">–</span>
                            ) : (
                              <span className={`text-sm font-bold tabular-nums ${col.text}`}>{total}</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center text-sm font-bold tabular-nums text-[#1A1A2E]">
                        {totalAll === 0 ? (
                          <span className="font-normal text-[#D1D5DB]">–</span>
                        ) : (
                          totalAll
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer hint */}
        {showTable && (
          <div className="shrink-0 border-t border-[rgba(0,0,0,0.04)] px-5 py-2.5">
            <p className="text-xs text-[#6B7280]">Ketik langsung pada kolom H/S/I/TB. Enter menyimpan, Esc membatalkan, kosong berarti 0.</p>
          </div>
        )}
      </div>
    </div>
  );
}
