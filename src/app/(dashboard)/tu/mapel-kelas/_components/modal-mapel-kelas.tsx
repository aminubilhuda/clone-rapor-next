'use client';

import { useState } from 'react';

interface ModalMapelKelasProps {
  open: boolean;
  onClose: () => void;
  mapelKelas: any | null;
  refKelas: any[];
  refMapel: any[];
  onSave: (formData: FormData) => Promise<void>;
  kelasFilter: string;
  excludedMapelIds: number[];
}

export default function ModalMapelKelas({ open, onClose, mapelKelas, refKelas, refMapel, onSave, kelasFilter, excludedMapelIds }: ModalMapelKelasProps) {
  const [saving, setSaving] = useState(false);
  const [cariMapel, setCariMapel] = useState('');
  const isEdit = !!mapelKelas;
  const autoKelas = kelasFilter && !isEdit;

  const filteredMapel = refMapel.filter((m: any) =>
    m.nama_mapel.toLowerCase().includes(cariMapel.toLowerCase())
  );

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await onSave(fd);
    setSaving(false);
  };

  const kelasNama = refKelas.find((k: any) => k.id_kelas === +kelasFilter)?.nama_kelas;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Mapel Kelas' : 'Tambah Mapel Kelas'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id_mapel_kelas" value={mapelKelas?.id_mapel_kelas ?? ''} />

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              {autoKelas ? (
                <>
                  <input type="hidden" name="id_kelas" value={kelasFilter} />
                  <p className="text-sm text-gray-800 border border-gray-200 rounded px-3 py-2 bg-gray-50">{kelasNama}</p>
                </>
              ) : (
                <select name="id_kelas" defaultValue={mapelKelas?.id_kelas ?? ''} required className="w-full border rounded px-3 py-2 text-sm bg-white">
                  <option value="">Pilih Kelas</option>
                  {refKelas.map((k: any) => (
                    <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran {!isEdit && <span className="text-gray-400 font-normal">(bisa pilih banyak)</span>}</label>
              {isEdit ? (
                <select name="id_mapel" defaultValue={mapelKelas?.id_mapel ?? ''} required className="w-full border rounded px-3 py-2 text-sm bg-white">
                  <option value="">Pilih Mapel</option>
                  {refMapel.map((m: any) => (
                    <option key={m.id_mapel} value={m.id_mapel}>{m.nama_mapel}</option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Cari mapel..."
                    value={cariMapel}
                    onChange={(e) => setCariMapel(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
                    {filteredMapel.map((m: any) => {
                      const disabled = excludedMapelIds.includes(m.id_mapel);
                      return (
                        <label key={m.id_mapel} className={`flex items-center gap-2 text-sm py-1 px-2 rounded ${disabled ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}>
                          <input type="checkbox" name="id_mapel" value={m.id_mapel} disabled={disabled} />
                          {m.nama_mapel}
                          {disabled && <span className="text-xs text-gray-400 ml-auto">(Sudah ada)</span>}
                        </label>
                      );
                    })}
                    {filteredMapel.length === 0 && <p className="text-gray-400 text-center py-2">Mapel tidak ditemukan</p>}
                  </div>
                </>
              )}
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
