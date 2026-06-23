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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <select name="id_kelas" defaultValue={p5bk?.id_kelas ?? ''} required className="w-full border rounded px-3 py-2 text-sm bg-white">
                <option value="">Pilih Kelas</option>
                {refKelas.map((k: any) => (
                  <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
              <select name="id_tema" defaultValue={p5bk?.id_tema ?? ''} required className="w-full border rounded px-3 py-2 text-sm bg-white">
                <option value="">Pilih Tema</option>
                {refTema.map((t: any) => (
                  <option key={t.id_tema} value={t.id_tema}>{t.tema}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pengguna</label>
              <select name="id_user" defaultValue={p5bk?.id_user ?? ''} required className="w-full border rounded px-3 py-2 text-sm bg-white">
                <option value="">Pilih Pengguna</option>
                {refUser.map((u: any) => (
                  <option key={u.id_user} value={u.id_user}>{u.nama} ({u.username})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Proyek</label>
              <input name="judul_proyek" defaultValue={p5bk?.judul_proyek ?? ''} required className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
              <textarea name="deskripsi_singkat" defaultValue={p5bk?.deskripsi_singkat ?? ''} rows={3} className="w-full border rounded px-3 py-2 text-sm" />
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
