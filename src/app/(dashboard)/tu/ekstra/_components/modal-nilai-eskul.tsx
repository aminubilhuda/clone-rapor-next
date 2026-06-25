'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { bulkUpdateSiswaEkstra } from '@/lib/actions/ekstra-actions';

interface NilaiRow {
  id_siswa_eskul: number;
  nama_siswa: string;
  nisn: string;
  predikat: string;
  keterangan: string;
}

interface ModalNilaiEskulProps {
  open: boolean;
  onClose: () => void;
  eskul: any;
  anggota: any[];
}

export default function ModalNilaiEskul({ open, onClose, eskul, anggota }: ModalNilaiEskulProps) {
  const { showToast } = useToast();
  const [rows, setRows] = useState<NilaiRow[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && eskul) {
      const filtered = anggota
        .filter((a: any) => a.id_eskul === eskul.id_eskul && a.id_siswa_eskul)
        .map((a: any) => ({
          id_siswa_eskul: a.id_siswa_eskul,
          nama_siswa: a.nama_siswa || '',
          nisn: a.nisn || '',
          predikat: a.predikat || '',
          keterangan: a.keterangan || '',
        }));
      setRows(filtered);
      setSearch('');
    }
  }, [open, eskul?.id_eskul, anggota]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => !q || r.nama_siswa.toLowerCase().includes(q) || r.nisn.toLowerCase().includes(q));
  }, [rows, search]);

  const setField = (id: number, field: 'predikat' | 'keterangan', value: string) => {
    setRows((prev) => prev.map((r) => r.id_siswa_eskul === id ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    setSaving(true);
    const items = rows.map((r) => ({ id_siswa_eskul: r.id_siswa_eskul, predikat: r.predikat, keterangan: r.keterangan }));
    const result = await bulkUpdateSiswaEkstra(items);
    if (result.success) {
      showToast('Nilai berhasil disimpan!', 'success');
      onClose();
    } else {
      showToast(result.error || 'Gagal menyimpan nilai!', 'error');
    }
    setSaving(false);
  };

  if (!open || !eskul) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-4xl mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">
            Nilai Eskul — {eskul.nama_eskul}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-4">
          <input
            type="text"
            placeholder="Cari siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.04)] sticky top-0 bg-white z-10">
                  <th className="text-left px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-10">No.</th>
                  <th className="text-left px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-48">Nama Siswa</th>
                  <th className="text-left px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-40">Predikat</th>
                  <th className="text-left px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-[#6B7280]">
                      {rows.length === 0 ? 'Belum ada anggota' : 'Siswa tidak ditemukan'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id_siswa_eskul} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      <td className="px-3 py-2 text-[#6B7280] w-10">{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-[#1A1A2E] w-48 truncate">{r.nama_siswa}</td>
                      <td className="px-3 py-2 w-40">
                        <select
                          value={r.predikat}
                          onChange={(e) => setField(r.id_siswa_eskul, 'predikat', e.target.value)}
                          className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
                        >
                          <option value="">-</option>
                          <option value="Sangat Baik">Sangat Baik</option>
                          <option value="Baik">Baik</option>
                          <option value="Cukup">Cukup</option>
                          <option value="Kurang">Kurang</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 w-1/2">
                        <textarea
                          value={r.keterangan}
                          onChange={(e) => setField(r.id_siswa_eskul, 'keterangan', e.target.value)}
                          placeholder="Keterangan"
                          rows={2}
                          className="w-full min-h-[80px] bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all resize-none"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </button>
        </div>
      </div>
    </div>
  );
}
