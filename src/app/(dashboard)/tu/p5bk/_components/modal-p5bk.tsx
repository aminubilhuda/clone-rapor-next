'use client';

import { useState } from 'react';

interface ModalP5BKProps {
  open: boolean;
  onClose: () => void;
  p5bk: any | null;
  refKelas: any[];
  refTema: any[];
  refUser: any[];
  onSave: (formData: FormData) => Promise<void>;
}

export default function ModalP5BK({ open, onClose, p5bk, refKelas, refTema, refUser, onSave }: ModalP5BKProps) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!p5bk;

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
            {isEdit ? 'Edit P5BK' : 'Tambah P5BK'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id_proyek_kelas" value={p5bk?.id_proyek_kelas ?? ''} />

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Kelas</label>
              <select name="id_kelas" defaultValue={p5bk?.id_kelas ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                <option value="">Pilih Kelas</option>
                {refKelas.map((k: any) => (
                  <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Tema</label>
              <select name="id_tema" defaultValue={p5bk?.id_tema ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                <option value="">Pilih Tema</option>
                {refTema.map((t: any) => (
                  <option key={t.id_tema} value={t.id_tema}>{t.tema}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Pengguna</label>
              <select name="id_user" defaultValue={p5bk?.id_user ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                <option value="">Pilih Pengguna</option>
                {refUser.map((u: any) => (
                  <option key={u.id_user} value={u.id_user}>{u.nama} ({u.username})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Judul Proyek</label>
              <input name="judul_proyek" defaultValue={p5bk?.judul_proyek ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Deskripsi Singkat</label>
              <textarea name="deskripsi_singkat" defaultValue={p5bk?.deskripsi_singkat ?? ''} rows={3} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
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
