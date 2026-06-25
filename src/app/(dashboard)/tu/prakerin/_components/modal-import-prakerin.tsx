'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/toast-provider';

interface ModalImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (rows: any[]) => Promise<{ success: boolean; count?: number; errors?: string[] }>;
}

const COLUMN_MAP: { keys: string[]; field: string }[] = [
  { keys: ['mitra'], field: 'mitra' },
  { keys: ['lokasi', 'alamat'], field: 'lokasi' },
  { keys: ['tanggal mulai', 'tgl mulai', 'mulai'], field: 'tanggal_mulai' },
  { keys: ['tanggal akhir', 'tgl akhir', 'tanggal selesai', 'tgl selesai', 'akhir', 'selesai'], field: 'tanggal_akhir' },
  { keys: ['pembimbing', 'guru pendamping', 'guru', 'pendamping', 'instruktur'], field: 'instruktur' },
];

function findHeader(headers: string[], keys: string[]): string | null {
  const lower = headers.map(h => h.toLowerCase().trim());
  for (const key of keys) {
    const idx = lower.findIndex(h => h === key || h.includes(key) || key.includes(h));
    if (idx >= 0) return headers[idx];
  }
  return null;
}

function excelDateToISO(value: any): string | null {
  if (!value) return null;
  if (typeof value === 'number') {
    const d = new Date((value - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    const parts = cleaned.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (parts) return `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    const parts2 = cleaned.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (parts2) return `${parts2[1]}-${parts2[2].padStart(2, '0')}-${parts2[3].padStart(2, '0')}`;
  }
  return null;
}

export default function ModalImportPrakerin({ open, onClose, onImport }: ModalImportProps) {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<any[] | null>(null);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (json.length === 0) {
          showToast('File Excel kosong.', 'error');
          return;
        }

        const excelHeaders = Object.keys(json[0]);
        const map: Record<string, string> = {};
        for (const cm of COLUMN_MAP) {
          const found = findHeader(excelHeaders, cm.keys);
          if (found) map[cm.field] = found;
        }

        const mapped = json.map((row: any) => {
          const r: any = {};
          if (map.mitra) r.mitra = String(row[map.mitra]).trim();
          if (map.lokasi) r.lokasi = String(row[map.lokasi]).trim();
          r.tanggal_mulai = excelDateToISO(map.tanggal_mulai ? row[map.tanggal_mulai] : null);
          r.tanggal_akhir = excelDateToISO(map.tanggal_akhir ? row[map.tanggal_akhir] : null);
          if (map.instruktur) r.instruktur = String(row[map.instruktur]).trim();
          return r;
        });

        setRows(mapped);
        setColumnMap(map);
      } catch (err: any) {
        showToast('Gagal membaca file: ' + (err.message || ''), 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!rows || rows.length === 0) return;
    setImporting(true);
    const result = await onImport(rows);
    setImporting(false);
    if (result.success) {
      showToast(`Berhasil import ${result.count} data!`, 'success');
      setRows(null);
      setColumnMap({});
      if (fileRef.current) fileRef.current.value = '';
      onClose();
    } else {
      const msg = result.errors?.length ? `Gagal: ${result.errors.join(', ')}` : 'Gagal import data';
      showToast(msg, 'error');
    }
  };

  const resetAndClose = () => {
    setRows(null);
    setColumnMap({});
    if (fileRef.current) fileRef.current.value = '';
    onClose();
  };

  const hasMitra = !!columnMap.mitra;
  const hasLokasi = !!columnMap.lokasi;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) resetAndClose(); }}
    >
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-2xl mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">Import Excel Prakerin</h3>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {!rows ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B7280]">
                  Pilih file Excel (.xlsx, .xls) dengan kolom: mitra, lokasi/alamat, tanggal mulai, tanggal akhir, pembimbing/guru pendamping.
                </p>
                <a
                  href="/api/tu/prakerin/template"
                  className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium flex items-center gap-1.5 shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Template
                </a>
              </div>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-xl p-8 cursor-pointer hover:border-[#DC2626]/40 transition-colors bg-[#F8F9FB]">
                <svg className="w-8 h-8 text-[#6B7280] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-[#6B7280]">Klik untuk pilih file</span>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
              </label>
            </>
          ) : (
            <>
              <div className="bg-[#F8F9FB] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#1A1A2E]">Data ditemukan:</span>
                  <span className="text-[#DC2626] font-semibold">{rows.length} baris</span>
                </div>
                <div className="border-t border-[rgba(0,0,0,0.06)] pt-2">
                  <p className="text-[#6B7280] mb-1">Mapping kolom:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${hasMitra ? 'bg-green-500' : 'bg-red-400'}`} />
                      Mitra {hasMitra ? `→ "${columnMap.mitra}"` : '(tidak ditemukan!)'}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${hasLokasi ? 'bg-green-500' : 'bg-red-400'}`} />
                      Lokasi {hasLokasi ? `→ "${columnMap.lokasi}"` : '(tidak ditemukan!)'}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${columnMap.tanggal_mulai ? 'bg-green-500' : 'bg-yellow-400'}`} />
                      Tanggal Mulai {columnMap.tanggal_mulai ? `→ "${columnMap.tanggal_mulai}"` : '(opsional, dilewati)'}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${columnMap.tanggal_akhir ? 'bg-green-500' : 'bg-yellow-400'}`} />
                      Tanggal Akhir {columnMap.tanggal_akhir ? `→ "${columnMap.tanggal_akhir}"` : '(opsional, dilewati)'}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${columnMap.instruktur ? 'bg-green-500' : 'bg-yellow-400'}`} />
                      Pembimbing/Instruktur {columnMap.instruktur ? `→ "${columnMap.instruktur}"` : '(opsional, dilewati)'}
                    </li>
                  </ul>
                </div>
              </div>

              {rows.length > 0 && rows[0].mitra && (
                <div className="overflow-x-auto max-h-48 border border-[rgba(0,0,0,0.06)] rounded-xl">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[rgba(0,0,0,0.04)] bg-[#F8F9FB]">
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">#</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">Mitra</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">Lokasi</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">Mulai</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">Akhir</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">Pembimbing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b border-[rgba(0,0,0,0.03)]">
                          <td className="px-3 py-2 text-[#6B7280]">{i + 1}</td>
                          <td className="px-3 py-2 text-[#1A1A2E]">{row.mitra || '-'}</td>
                          <td className="px-3 py-2">{row.lokasi || '-'}</td>
                          <td className="px-3 py-2">{row.tanggal_mulai || '-'}</td>
                          <td className="px-3 py-2">{row.tanggal_akhir || '-'}</td>
                          <td className="px-3 py-2">{row.instruktur || '-'}</td>
                        </tr>
                      ))}
                      {rows.length > 10 && (
                        <tr>
                          <td colSpan={6} className="text-center py-2 text-[#6B7280] text-xs">
                            ... dan {rows.length - 10} data lainnya
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {!hasMitra && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 border border-red-100">
                  Kolom <strong>Mitra</strong> tidak ditemukan. Pastikan file Excel memiliki header yang sesuai.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={resetAndClose}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleImport}
                  disabled={!hasMitra || importing}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  {importing ? 'Mengimport...' : `Import ${rows.length} Data`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
