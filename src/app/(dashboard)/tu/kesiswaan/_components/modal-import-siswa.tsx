'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/toast-provider';

interface ModalImportSiswaProps {
  open: boolean;
  onClose: () => void;
  refKelamin: any[];
  refAgama: any[];
  refJurusan: any[];
  refTingkat: any[];
  onImport: (rows: any[]) => Promise<{ success: boolean; count?: number; inserted?: number; updated?: number; errors?: string[] }>;
}

const COLUMN_MAP: { keys: string[]; field: string }[] = [
  { keys: ['nama siswa *', 'nama siswa', 'nama', 'nama_lengkap'], field: 'nama_siswa' },
  { keys: ['nis'], field: 'nis' },
  { keys: ['nisn'], field: 'nisn' },
  { keys: ['tempat lahir', 'tempat_lahir', 'tempat'], field: 'tempat_lahir' },
  { keys: ['tanggal lahir', 'tgl lahir', 'tanggal_lahir', 'tgl_lahir', 'ttl'], field: 'tanggal_lahir' },
  { keys: ['jenis kelamin', 'kelamin', 'jk', 'jenis_kelamin', 'jenis kelamin'], field: 'kelamin' },
  { keys: ['agama'], field: 'agama' },
  { keys: ['jurusan', 'kompetensi keahlian', 'kompetensi_keahlian'], field: 'jurusan' },
  { keys: ['kontak', 'telepon', 'hp', 'no hp', 'no. hp', 'kontak_siswa'], field: 'kontak_siswa' },
  { keys: ['alamat'], field: 'alamat' },
  { keys: ['terima kelas', 'kelas', 'terima_kelas'], field: 'terima_kelas' },
  { keys: ['tanggal masuk', 'tgl masuk', 'terima tanggal', 'terima_tanggal', 'tgl_masuk'], field: 'terima_tanggal' },
  { keys: ['tingkat', 'terima tingkat', 'terima_tingkat'], field: 'terima_tingkat' },
  { keys: ['username *', 'username', 'user', 'login'], field: 'username' },
  { keys: ['password *', 'password', 'pass', 'pwd'], field: 'password' },
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
    // DD/MM/YYYY or DD-MM-YYYY
    const parts = cleaned.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (parts) return `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    // YYYY-MM-DD or YYYY/MM/DD
    const parts2 = cleaned.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (parts2) return `${parts2[1]}-${parts2[2].padStart(2, '0')}-${parts2[3].padStart(2, '0')}`;
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  return null;
}

export default function ModalImportSiswa({ open, onClose, refKelamin, refAgama, refJurusan, refTingkat, onImport }: ModalImportSiswaProps) {
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

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (json.length === 0) {
          showToast('File Excel kosong.', 'error');
          setLoading(false);
          return;
        }

        const excelHeaders = Object.keys(json[0]);
        const map: Record<string, string> = {};
        for (const cm of COLUMN_MAP) {
          const found = findHeader(excelHeaders, cm.keys);
          if (found) map[cm.field] = found;
        }

        // Build lookup maps for FK fields
        const kelaminMap = new Map<string, number>();
        for (const k of refKelamin) {
          kelaminMap.set(k.jenis_kelamin.toLowerCase(), k.id_jenis_kelamin);
          // alias: Laki-laki = L, Perempuan = P
          if (k.jenis_kelamin.toLowerCase().includes('laki')) {
            kelaminMap.set('l', k.id_jenis_kelamin);
            kelaminMap.set('laki-laki', k.id_jenis_kelamin);
            kelaminMap.set('lk', k.id_jenis_kelamin);
            kelaminMap.set('pria', k.id_jenis_kelamin);
          }
          if (k.jenis_kelamin.toLowerCase().includes('perempuan')) {
            kelaminMap.set('p', k.id_jenis_kelamin);
            kelaminMap.set('perempuan', k.id_jenis_kelamin);
            kelaminMap.set('pr', k.id_jenis_kelamin);
            kelaminMap.set('wanita', k.id_jenis_kelamin);
          }
        }

        const agamaMap = new Map<string, number>();
        for (const a of refAgama) {
          agamaMap.set(a.agama.toLowerCase(), a.id_agama);
        }

        const jurusanMap = new Map<string, number>();
        for (const j of refJurusan) {
          jurusanMap.set(j.kompetensi_keahlian.toLowerCase(), j.id_kompetensi_keahlian);
        }

        const mapped = json.map((row: any) => {
          const r: any = {};
          if (map.nama_siswa) r.nama_siswa = String(row[map.nama_siswa] ?? '').trim();
          if (map.nis) r.nis = String(row[map.nis] ?? '').trim();
          if (map.nisn) r.nisn = String(row[map.nisn] ?? '').trim();
          if (map.tempat_lahir) r.tempat_lahir = String(row[map.tempat_lahir] ?? '').trim();
          r.tanggal_lahir = map.tanggal_lahir ? excelDateToISO(row[map.tanggal_lahir]) : null;

          // FK mapping: text → ID
          if (map.kelamin) {
            const raw = String(row[map.kelamin] ?? '').trim().toLowerCase();
            r.kelamin = kelaminMap.get(raw) ?? null;
          }
          if (map.agama) {
            const raw = String(row[map.agama] ?? '').trim().toLowerCase();
            r.agama = agamaMap.get(raw) ?? null;
          }
          if (map.jurusan) {
            const raw = String(row[map.jurusan] ?? '').trim().toLowerCase();
            r.jurusan = jurusanMap.get(raw) ?? null;
          }

          if (map.kontak_siswa) r.kontak_siswa = String(row[map.kontak_siswa] ?? '').trim();
          if (map.alamat) r.alamat = String(row[map.alamat] ?? '').trim();
          if (map.terima_kelas) r.terima_kelas = String(row[map.terima_kelas] ?? '').trim();
          r.terima_tanggal = map.terima_tanggal ? excelDateToISO(row[map.terima_tanggal]) : null;

          // terima_tingkat: number langsung atau lookup dari roman
          if (map.terima_tingkat) {
            const raw = String(row[map.terima_tingkat] ?? '').trim();
            const num = parseInt(raw, 10);
            if (!isNaN(num) && num > 0) {
              r.terima_tingkat = num;
            } else {
              const roman = raw.toUpperCase();
              const found = refTingkat.find((t: any) => String(t.tabjad).trim().toUpperCase() === roman);
              r.terima_tingkat = found?.id_tingkat ?? null;
            }
          }

          if (map.username) r.username = String(row[map.username] ?? '').trim();
          if (map.password) r.password = String(row[map.password] ?? '').trim();
          return r;
        });

        setRows(mapped);
        setColumnMap(map);
      } catch (err: any) {
        showToast('Gagal membaca file: ' + (err.message || ''), 'error');
      } finally {
        setLoading(false);
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
      showToast(`Berhasil: ${result.inserted} baru, ${result.updated} diupdate`, 'success');
      setRows(null);
      setColumnMap({});
      if (fileRef.current) fileRef.current.value = '';
      onClose();
    } else {
      const msgs = result.errors?.length ? result.errors : ['Gagal import data'];
      showToast(msgs.join('; '), 'error');
    }
  };

  const resetAndClose = () => {
    setRows(null);
    setColumnMap({});
    setLoading(false);
    if (fileRef.current) fileRef.current.value = '';
    onClose();
  };

  const requiredFields = ['nama_siswa', 'username', 'password'];
  const optionalFields = ['nis', 'nisn', 'tempat_lahir', 'tanggal_lahir', 'kelamin', 'agama', 'jurusan', 'kontak_siswa', 'alamat', 'terima_kelas', 'terima_tanggal', 'terima_tingkat'];
  const allFields = [...requiredFields, ...optionalFields];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !importing) resetAndClose(); }}
    >
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-3xl mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)] relative">
        {importing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-[#1A1A2E]">Mengimport data...</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">Import Data Siswa</h3>
          <button onClick={resetAndClose} disabled={importing} className="text-gray-400 hover:text-gray-600 transition disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {!rows ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B7280]">
                  Upload file Excel (.xlsx/.xls) dengan kolom: Nama Siswa, NIS, NISN, Jenis Kelamin, Agama, Jurusan, dll.
                </p>
                <a
                  href="/api/tu/kesiswaan/template"
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
                <span className="text-sm text-[#6B7280]">
                  {loading ? 'Membaca file...' : 'Klik untuk pilih file'}
                </span>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} disabled={loading} className="hidden" />
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
                    {allFields.map((field) => {
                      const found = !!columnMap[field];
                      const isRequired = requiredFields.includes(field);
                      return (
                        <li key={field} className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${found ? 'bg-green-500' : isRequired ? 'bg-red-400' : 'bg-yellow-400'}`} />
                          {field.replace(/_/g, ' ')} {found ? `→ "${columnMap[field]}"` : isRequired ? '(wajib!)' : '(opsional)'}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {rows.length > 0 && (
                <div className="overflow-x-auto max-h-52 border border-[rgba(0,0,0,0.06)] rounded-xl">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[rgba(0,0,0,0.04)] bg-[#F8F9FB]">
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">#</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">Nama</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">NIS</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">NISN</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">Kelas</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">Tgl Masuk</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] font-medium">Username</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b border-[rgba(0,0,0,0.03)]">
                          <td className="px-3 py-2 text-[#6B7280]">{i + 1}</td>
                          <td className="px-3 py-2 text-[#1A1A2E]">{row.nama_siswa || '-'}</td>
                          <td className="px-3 py-2">{row.nis || '-'}</td>
                          <td className="px-3 py-2">{row.nisn || '-'}</td>
                          <td className="px-3 py-2">{row.terima_kelas || '-'}</td>
                          <td className="px-3 py-2">{row.terima_tanggal || '-'}</td>
                          <td className="px-3 py-2">{row.username || '-'}</td>
                        </tr>
                      ))}
                      {rows.length > 10 && (
                        <tr>
                          <td colSpan={7} className="text-center py-2 text-[#6B7280] text-xs">
                            ... dan {rows.length - 10} data lainnya
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {!columnMap.nama_siswa && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 border border-red-100">
                  Kolom <strong>Nama Siswa</strong> tidak ditemukan. Pastikan file Excel memiliki header yang sesuai.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={resetAndClose}
                  disabled={importing}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleImport}
                  disabled={!columnMap.nama_siswa || importing}
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
