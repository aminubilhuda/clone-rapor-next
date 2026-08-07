'use client';

import { useState, useEffect, useCallback } from 'react';
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
  { key: 'hadir', label: 'H', color: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]' },
  { key: 'sakit', label: 'S', color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]' },
  { key: 'izin', label: 'I', color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]' },
  { key: 'tanpa_berita', label: 'TB', color: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]' },
] as const;

export default function RekapAbsensiBKClient() {
  const { showToast } = useToast();
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [rekapData, setRekapData] = useState<RekapItem[]>([]);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [search, setSearch] = useState('');
  const [editingCell, setEditingCell] = useState<{ idSiswa: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

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
    setEditingCell(null);
    if (idKelas) loadData(idKelas);
  };

  const handleDoubleClick = (idSiswa: number, field: string, value: number) => {
    setEditingCell({ idSiswa, field });
    setEditValue(String(value));
  };

  const handleSave = async (idSiswa: number, field: string) => {
    const jumlah = parseInt(editValue) || 0;
    const idAbsen = field === 'hadir' ? 1 : field === 'sakit' ? 2 : field === 'izin' ? 3 : 4;

    setSaving(true);
    const result = await updatePresensiInline(idSiswa, selectedKelas!, idAbsen, jumlah);
    setSaving(false);

    if (result.success) {
      setRekapData((prev) =>
        prev.map((r) =>
          r.id_siswa === idSiswa ? { ...r, [field]: jumlah } : r
        )
      );
      showToast('Berhasil diupdate', 'success');
    } else {
      showToast(result.error || 'Gagal update', 'error');
    }

    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, idSiswa: number, field: string) => {
    if (e.key === 'Enter') {
      handleSave(idSiswa, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const filtered = rekapData.filter((r) =>
    r.nama_siswa.toLowerCase().includes(search.toLowerCase())
  );

  const totalHadir = filtered.reduce((sum, r) => sum + r.hadir, 0);
  const totalSakit = filtered.reduce((sum, r) => sum + r.sakit, 0);
  const totalIzin = filtered.reduce((sum, r) => sum + r.izin, 0);
  const totalTB = filtered.reduce((sum, r) => sum + r.tanpa_berita, 0);
  const totalAll = totalHadir + totalSakit + totalIzin + totalTB;

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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-[rgba(0,0,0,0.06)]">
                    <th className="text-left px-5 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-10">No</th>
                    <th className="text-left px-5 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Nama Siswa</th>
                    {ABSEN_COLS.map((col) => (
                      <th key={col.key} className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-20">
                        {col.label}
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-20">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => {
                    const jumlah = row.hadir + row.sakit + row.izin + row.tanpa_berita;
                    return (
                      <tr key={row.id_siswa} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                        <td className="px-5 py-2.5 text-[#6B7280]">{i + 1}</td>
                        <td className="px-5 py-2.5 font-medium text-[#1A1A2E]">{row.nama_siswa}</td>
                        {ABSEN_COLS.map((col) => {
                          const isEditing = editingCell?.idSiswa === row.id_siswa && editingCell?.field === col.key;
                          const value = row[col.key as keyof RekapItem] as number;
                          return (
                            <td key={col.key} className={`px-4 py-2.5 text-center ${col.bg}`}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, row.id_siswa, col.key)}
                                  onBlur={() => handleSave(row.id_siswa, col.key)}
                                  autoFocus
                                  disabled={saving}
                                  className="w-14 text-center text-sm font-semibold bg-white border border-[rgba(0,0,0,0.12)] rounded px-1 py-0.5 outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                              ) : (
                                <span
                                  className={`inline-block w-14 text-center font-semibold cursor-pointer hover:opacity-70 ${col.color}`}
                                  onDoubleClick={() => handleDoubleClick(row.id_siswa, col.key, value)}
                                  title="Double-click untuk edit"
                                >
                                  {value}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-2.5 text-center font-bold text-[#1A1A2E]">
                          {jumlah}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[rgba(0,0,0,0.08)] bg-[#F8F9FB] font-semibold">
                    <td colSpan={2} className="px-5 py-3 text-[#1A1A2E] text-right">Total</td>
                    {ABSEN_COLS.map((col) => {
                      const totals: Record<string, number> = {
                        hadir: totalHadir,
                        sakit: totalSakit,
                        izin: totalIzin,
                        tanpa_berita: totalTB,
                      };
                      return (
                        <td key={col.key} className={`px-4 py-3 text-center ${col.color}`}>
                          {totals[col.key]}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center font-bold text-[#1A1A2E]">{totalAll}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Footer hint */}
        {showTable && (
          <div className="shrink-0 border-t border-[rgba(0,0,0,0.04)] px-5 py-2.5">
            <p className="text-xs text-[#6B7280]">Double-click pada angka di kolom H/S/I/TB untuk mengedit jumlah presensi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
