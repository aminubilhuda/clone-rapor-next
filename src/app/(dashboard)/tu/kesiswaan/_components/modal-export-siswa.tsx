'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';

interface ModalExportSiswaProps {
  open: boolean;
  onClose: () => void;
  refKelas: any[];
  currentSearch?: string;
}

export default function ModalExportSiswa({
  open,
  onClose,
  refKelas,
  currentSearch = '',
}: ModalExportSiswaProps) {
  const { showToast } = useToast();
  const [exportType, setExportType] = useState<'ringkas' | 'lengkap'>('ringkas');
  const [scope, setScope] = useState<'all' | 'kelas' | 'search'>(currentSearch ? 'search' : 'all');
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  if (!open) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const params = new URLSearchParams();
      params.set('type', exportType);

      if (scope === 'kelas' && selectedKelas) {
        params.set('id_kelas', selectedKelas);
      } else if (scope === 'search' && currentSearch) {
        params.set('search', currentSearch);
      }

      const url = `/api/tu/kesiswaan/export?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Gagal mengunduh file Excel');
      }

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      let filename = exportType === 'lengkap' ? 'Buku_Induk_Siswa.xlsx' : 'Data_Siswa.xlsx';

      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showToast('File Excel berhasil diekspor!', 'success');
      onClose();
    } catch (err: any) {
      console.error('Export error:', err);
      showToast(err?.message || 'Gagal mengekspor data!', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) onClose();
      }}
    >
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto animate-modal-in border border-[rgba(0,0,0,0.06)] relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1A1A2E]">Export Data Siswa ke Excel</h3>
              <p className="text-xs text-[#6B7280]">Unduh data siswa dalam format spreadsheet (.xlsx) yang rapi & berformat lengkap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Format Pilihan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2.5">
              1. Pilih Format Dokumen
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option Ringkas */}
              <div
                onClick={() => setExportType('ringkas')}
                className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all relative ${
                  exportType === 'ringkas'
                    ? 'border-[#DC2626] bg-red-50/20 shadow-sm'
                    : 'border-[rgba(0,0,0,0.06)] bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-[#1A1A2E]">Format Ringkas</span>
                  <span className="text-[10px] font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Data Pokok
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  16 kolom esensial: NIS, NISN, Nama Siswa, L/P, Tingkat & Kelas (contoh: XI & XI RPL), Jurusan, Tempat/Tgl Lahir, Agama, Kontak, Alamat, dan Orang Tua.
                </p>
              </div>

              {/* Option Lengkap */}
              <div
                onClick={() => setExportType('lengkap')}
                className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all relative ${
                  exportType === 'lengkap'
                    ? 'border-[#DC2626] bg-red-50/20 shadow-sm'
                    : 'border-[rgba(0,0,0,0.06)] bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-[#1A1A2E]">Format Lengkap</span>
                  <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Buku Induk
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  41 kolom lengkap: NIK, No. KK, Biodata Pribadi, Tingkat & Kelas Saat Ini, Data Ayah/Ibu/Wali detail, Riwayat Masuk, dan Akun Login Siswa.
                </p>
              </div>
            </div>
          </div>

          {/* Cakupan Data / Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2.5">
              2. Cakupan Data Siswa
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  scope === 'all'
                    ? 'border-[#DC2626] bg-red-50/10'
                    : 'border-[rgba(0,0,0,0.06)] hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                  className="w-4 h-4 text-[#DC2626] focus:ring-red-500/20"
                />
                <div>
                  <span className="text-sm font-medium text-[#1A1A2E]">Semua Siswa Aktif</span>
                  <p className="text-xs text-[#6B7280]">Mengekspor seluruh siswa terdaftar pada periode aktif</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  scope === 'kelas'
                    ? 'border-[#DC2626] bg-red-50/10'
                    : 'border-[rgba(0,0,0,0.06)] hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="kelas"
                  checked={scope === 'kelas'}
                  onChange={() => setScope('kelas')}
                  className="w-4 h-4 text-[#DC2626] focus:ring-red-500/20"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-[#1A1A2E]">Filter Berdasarkan Kelas</span>
                  <p className="text-xs text-[#6B7280] mb-2">Hanya siswa yang berada di kelas tertentu</p>
                  {scope === 'kelas' && (
                    <select
                      value={selectedKelas}
                      onChange={(e) => setSelectedKelas(e.target.value)}
                      className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {refKelas.map((k: any) => (
                        <option key={k.id_kelas} value={k.id_kelas}>
                          {k.nama_kelas}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>

              {currentSearch.trim() && (
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    scope === 'search'
                      ? 'border-[#DC2626] bg-red-50/10'
                      : 'border-[rgba(0,0,0,0.06)] hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    value="search"
                    checked={scope === 'search'}
                    onChange={() => setScope('search')}
                    className="w-4 h-4 text-[#DC2626] focus:ring-red-500/20"
                  />
                  <div>
                    <span className="text-sm font-medium text-[#1A1A2E]">Sesuai Hasil Pencarian Saat Ini</span>
                    <p className="text-xs text-[#6B7280]">
                      Kata kunci pencarian: <span className="font-semibold text-red-600">&ldquo;{currentSearch}&rdquo;</span>
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Keunggulan Format */}
          <div className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.04)] rounded-xl p-3 text-xs text-[#6B7280] space-y-1">
            <div className="font-medium text-[#1A1A2E] flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Fitur Dokumen Excel:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
              <li>Header & Banner resmi sekolah dengan styling warna elegan</li>
              <li>Freeze Header & Auto-filter kolom bawaan Excel</li>
              <li>Format NIK, NIS, NISN terjaga utuh sebagai teks (tidak terpotong & angka 0 aman)</li>
              <li>Baris zebra striping rapi dan baris total di bagian bawah</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.05)] bg-[#FAFBFD] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl active:scale-[0.98] transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || (scope === 'kelas' && !selectedKelas)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Excel...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Unduh File Excel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
