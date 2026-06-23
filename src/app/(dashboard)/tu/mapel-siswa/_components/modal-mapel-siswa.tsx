'use client';

import { useState } from 'react';

interface ModalMapelSiswaProps {
  open: boolean;
  onClose: () => void;
  mapelSiswa: any | null;
  refKelas: any[];
  refMapel: any[];
  refSiswa: any[];
  onSave: (formData: FormData) => Promise<void>;
}

export default function ModalMapelSiswa({ open, onClose, mapelSiswa, refKelas, refMapel, refSiswa, onSave }: ModalMapelSiswaProps) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!mapelSiswa;

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
            {isEdit ? 'Edit Mapel Pilihan Siswa' : 'Tambah Mapel Pilihan Siswa'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id_mapel_siswa" value={mapelSiswa?.id_mapel_siswa ?? ''} />

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <select name="id_kelas" defaultValue={mapelSiswa?.id_kelas ?? ''} required className="w-full border rounded px-3 py-2 text-sm bg-white">
                <option value="">Pilih Kelas</option>
                {refKelas.map((k: any) => (
                  <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
              <select name="id_mapel" defaultValue={mapelSiswa?.id_mapel ?? ''} required className="w-full border rounded px-3 py-2 text-sm bg-white">
                <option value="">Pilih Mapel</option>
                {refMapel.map((m: any) => (
                  <option key={m.id_mapel} value={m.id_mapel}>{m.nama_mapel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
              <select name="id_siswa" defaultValue={mapelSiswa?.id_siswa ?? ''} required className="w-full border rounded px-3 py-2 text-sm bg-white">
                <option value="">Pilih Siswa</option>
                {refSiswa.map((s: any) => (
                  <option key={s.id_siswa} value={s.id_siswa}>{s.nama_siswa} ({s.nisn})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aktif</label>
              <select name="aktif" defaultValue={mapelSiswa?.aktif ?? 1} className="w-full border rounded px-3 py-2 text-sm bg-white">
                <option value={1}>Aktif</option>
                <option value={0}>Nonaktif</option>
              </select>
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
