'use client';

import { useState } from 'react';

interface ModalPrakerinProps {
  open: boolean;
  onClose: () => void;
  prakerin: any | null;
  refUser: any[];
  onSave: (formData: FormData) => Promise<void>;
}

export default function ModalPrakerin({ open, onClose, prakerin, refUser, onSave }: ModalPrakerinProps) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!prakerin;

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Prakerin' : 'Tambah Prakerin'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id_prakerin" value={prakerin?.id_prakerin ?? ''} />

          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mitra</label>
                <input name="mitra" defaultValue={prakerin?.mitra ?? ''} required className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input name="lokasi" defaultValue={prakerin?.lokasi ?? ''} required className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input name="tanggal_mulai" type="date" defaultValue={prakerin?.tanggal_mulai ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                <input name="tanggal_akhir" type="date" defaultValue={prakerin?.tanggal_akhir ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instruktur</label>
                <input name="instruktur" defaultValue={prakerin?.instruktur ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pengguna</label>
                <select name="id_user" defaultValue={prakerin?.id_user ?? ''} className="w-full border rounded px-3 py-2 text-sm bg-white">
                  <option value="">Pilih Pengguna</option>
                  {refUser.map((u: any) => (
                    <option key={u.id_user} value={u.id_user}>{u.nama} ({u.username})</option>
                  ))}
                </select>
              </div>
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
