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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input name="nama" defaultValue={pegawai?.nama ?? ''} required className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input name="username" defaultValue={pegawai?.username ?? ''} required className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password {isEdit ? <span className="text-gray-400 font-normal">(kosongi jika tidak diubah)</span> : ''}</label>
                <input name="password" type="password" required={!isEdit} className="w-full border rounded px-3 py-2 text-sm" placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Password wajib diisi'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                <select name="jabatan" defaultValue={pegawai?.jabatan ?? ''} className="w-full border rounded px-3 py-2 text-sm bg-white">
                  {refJabatan.map((j: any) => (
                    <option key={j.id_jabatan} value={j.id_jabatan}>{j.jabatan}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                <select name="kelamin" defaultValue={pegawai?.kelamin ?? ''} className="w-full border rounded px-3 py-2 text-sm bg-white">
                  {refKelamin.map((k: any) => (
                    <option key={k.id_jenis_kelamin} value={k.id_jenis_kelamin}>{k.jenis_kelamin}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
                <select name="agama" defaultValue={pegawai?.agama ?? ''} className="w-full border rounded px-3 py-2 text-sm bg-white">
                  {refAgama.map((a: any) => (
                    <option key={a.id_agama} value={a.id_agama}>{a.agama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                <input name="nip" defaultValue={pegawai?.nip ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NUPTK</label>
                <input name="nuptk" defaultValue={pegawai?.nuptk ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak</label>
                <input name="kontak" defaultValue={pegawai?.kontak ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Kepegawaian</label>
                <select name="id_kepegawaian" defaultValue={pegawai?.id_kepegawaian ?? ''} className="w-full border rounded px-3 py-2 text-sm bg-white">
                  {refKepegawaian.map((k: any) => (
                    <option key={k.id_kepegawaian} value={k.id_kepegawaian}>{k.kepegawaian}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tugas Tambahan</label>
                <select name="id_tugas_tambahan" defaultValue={pegawai?.id_tugas_tambahan ?? ''} className="w-full border rounded px-3 py-2 text-sm bg-white">
                  {refTugasTambahan.map((t: any) => (
                    <option key={t.id_tugas_tambahan} value={t.id_tugas_tambahan}>{t.tugas_tambahan}</option>
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
