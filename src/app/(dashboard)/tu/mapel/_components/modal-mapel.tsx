'use client';

import { useState } from 'react';

interface ModalMapelProps {
  open: boolean;
  onClose: () => void;
  mapel: any | null;
  refKelompok: any[];
  refInduk: any[];
  defaultParentId: number | null;
  onSave: (formData: FormData) => Promise<void>;
}

export default function ModalMapel({
  open,
  onClose,
  mapel,
  refKelompok,
  refInduk,
  defaultParentId,
  onSave,
}: ModalMapelProps) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!mapel;
  const isInduk = Number(mapel?.jumlah_anak || 0) > 0;
  const indukAwal = defaultParentId
    ? refInduk.find((m: any) => Number(m.id_mapel) === defaultParentId)
    : null;
  const defaultKelompok = mapel?.id_kelompok ?? indukAwal?.id_kelompok ?? '';

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await onSave(fd);
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-lg mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">
            {isEdit
              ? 'Edit Mata Pelajaran'
              : defaultParentId
                ? 'Tambah Sub Mapel'
                : 'Tambah Mata Pelajaran'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id_mapel" value={mapel?.id_mapel ?? ''} />

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Nama Mata Pelajaran</label>
              <input name="nama_mapel" defaultValue={mapel?.nama_mapel ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Singkatan</label>
              <input name="s_mapel" defaultValue={mapel?.s_mapel ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Kelompok</label>
              <select name="id_kelompok" defaultValue={defaultKelompok} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                {refKelompok.map((k: any) => (
                  <option key={k.id_kelompok} value={k.id_kelompok}>{k.huruf} - {k.kelompok}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
                Induk Mapel <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              {isInduk ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                  Mapel ini adalah induk. Sub-mapel tidak boleh punya induk lagi.
                </p>
              ) : (
                <>
                  <select
                    name="parent_id"
                    defaultValue={mapel?.parent_id ?? defaultParentId ?? ''}
                    className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
                  >
                    <option value="">— Mapel biasa (tanpa induk) —</option>
                    {refInduk
                      .filter((m: any) => m.id_mapel !== mapel?.id_mapel)
                      .map((m: any) => (
                        <option key={m.id_mapel} value={m.id_mapel}>
                          {m.nama_mapel}
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Kelompok sub-mapel harus sama dengan kelompok induk.
                  </p>
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Urutan</label>
              <input name="urut" type="number" defaultValue={mapel?.urut ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
