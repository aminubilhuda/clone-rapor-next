'use client';

import { useState } from 'react';

interface ModalPegawaiProps {
  open: boolean;
  onClose: () => void;
  pegawai: any | null;
  refJabatan: any[];
  refKelamin: any[];
  refAgama: any[];
  refKepegawaian: any[];
  refTugasTambahan: any[];
  onSave: (formData: FormData) => Promise<void>;
}

export default function ModalPegawai({
  open, onClose, pegawai, refJabatan, refKelamin, refAgama,
  refKepegawaian, refTugasTambahan, onSave,
}: ModalPegawaiProps) {
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const isEdit = !!pegawai;

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
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-modal-in border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">
            {isEdit ? 'Edit Pegawai' : 'Tambah Pegawai'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id_user" value={pegawai?.id_user ?? ''} />

          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Nama</label>
                <input name="nama" defaultValue={pegawai?.nama ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Username</label>
                <input name="username" defaultValue={pegawai?.username ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Password {isEdit ? <span className="text-gray-400 font-normal">(kosongi jika tidak diubah)</span> : ''}</label>
                <input name="password" type="password" required={!isEdit} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Password wajib diisi'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Jabatan</label>
                <select name="jabatan" defaultValue={pegawai?.jabatan ?? ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                  {refJabatan.map((j: any) => (
                    <option key={j.id_jabatan} value={j.id_jabatan}>{j.jabatan}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Jenis Kelamin</label>
                <select name="kelamin" defaultValue={pegawai?.kelamin ?? ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                  {refKelamin.map((k: any) => (
                    <option key={k.id_jenis_kelamin} value={k.id_jenis_kelamin}>{k.jenis_kelamin}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Agama</label>
                <select name="agama" defaultValue={pegawai?.agama ?? ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                  {refAgama.map((a: any) => (
                    <option key={a.id_agama} value={a.id_agama}>{a.agama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">NIP</label>
                <input name="nip" defaultValue={pegawai?.nip ?? ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">NUPTK</label>
                <input name="nuptk" defaultValue={pegawai?.nuptk ?? ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Kontak</label>
                <input name="kontak" defaultValue={pegawai?.kontak ?? ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Status Kepegawaian</label>
                <select name="id_kepegawaian" defaultValue={pegawai?.id_kepegawaian ?? ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                  {refKepegawaian.map((k: any) => (
                    <option key={k.id_kepegawaian} value={k.id_kepegawaian}>{k.kepegawaian}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Tugas Tambahan</label>
                <select name="id_tugas_tambahan" defaultValue={pegawai?.id_tugas_tambahan ?? ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                  {refTugasTambahan.map((t: any) => (
                    <option key={t.id_tugas_tambahan} value={t.id_tugas_tambahan}>{t.tugas_tambahan}</option>
                  ))}
                </select>
              </div>
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
