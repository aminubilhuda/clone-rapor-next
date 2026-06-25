'use client';

import { useState } from 'react';

interface ModalPiketHarianProps {
  open: boolean;
  onClose: () => void;
  piket: any | null;
  refHarian: any[];
  refUser: any[];
  onSave: (formData: FormData) => Promise<void>;
}

export default function ModalPiketHarian({ open, onClose, piket, refHarian, refUser, onSave }: ModalPiketHarianProps) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!piket;

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
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-md mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">
            {isEdit ? 'Edit Piket Harian' : 'Tambah Piket Harian'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id_piket_harian" value={piket?.id_piket_harian ?? ''} />

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Hari</label>
              <select name="id_harian" defaultValue={piket?.id_harian ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                <option value="">Pilih Hari</option>
                {refHarian.map((h: any) => (
                  <option key={h.id_harian} value={h.id_harian}>{h.harian}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Guru</label>
              <select name="id_user" defaultValue={piket?.id_user ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                <option value="">Pilih Guru</option>
                {refUser.map((u: any) => (
                  <option key={u.id_user} value={u.id_user}>{u.nama} ({u.username})</option>
                ))}
              </select>
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
