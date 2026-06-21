'use client';

import { useState } from 'react';

interface ModalMapelProps {
  open: boolean;
  onClose: () => void;
  mapel: any | null;
  refKelompok: any[];
  onSave: (formData: FormData) => Promise<void>;
}

export default function ModalMapel({ open, onClose, mapel, refKelompok, onSave }: ModalMapelProps) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!mapel;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mata Pelajaran</label>
              <input name="nama_mapel" defaultValue={mapel?.nama_mapel ?? ''} required className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Singkatan</label>
              <input name="s_mapel" defaultValue={mapel?.s_mapel ?? ''} required className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelompok</label>
              <select name="id_kelompok" defaultValue={mapel?.id_kelompok ?? ''} className="w-full border rounded px-3 py-2 text-sm bg-white">
                {refKelompok.map((k: any) => (
                  <option key={k.id_kelompok} value={k.id_kelompok}>{k.huruf} - {k.kelompok}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
              <input name="urut" type="number" defaultValue={mapel?.urut ?? ''} required className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
