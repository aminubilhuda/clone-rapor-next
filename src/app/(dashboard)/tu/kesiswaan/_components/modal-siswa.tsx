'use client';

import { useState } from 'react';

interface ModalSiswaProps {
  open: boolean;
  onClose: () => void;
  siswa: any | null;
  refKelamin: any[];
  refAgama: any[];
  refJurusan: any[];
  onSave: (formData: FormData) => Promise<void>;
}

export default function ModalSiswa({
  open, onClose, siswa, refKelamin, refAgama, refJurusan, onSave,
}: ModalSiswaProps) {
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const isEdit = !!siswa;

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Siswa' : 'Tambah Siswa'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id_siswa" value={siswa?.id_siswa ?? ''} />

          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label>
                <input name="nama_siswa" defaultValue={siswa?.nama_siswa ?? ''} required className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input name="username" defaultValue={siswa?.username ?? ''} required className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password {isEdit ? <span className="text-gray-400 font-normal">(kosongi jika tidak diubah)</span> : ''}</label>
                <input name="password" type="password" required={!isEdit} className="w-full border rounded px-3 py-2 text-sm" placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Password wajib diisi'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                <input name="nis" defaultValue={siswa?.nis ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                <input name="nisn" defaultValue={siswa?.nisn ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                <select name="kelamin" defaultValue={siswa?.kelamin ?? ''} className="w-full border rounded px-3 py-2 text-sm bg-white">
                  {refKelamin.map((k: any) => (
                    <option key={k.id_jenis_kelamin} value={k.id_jenis_kelamin}>{k.jenis_kelamin}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
                <select name="agama" defaultValue={siswa?.agama ?? ''} className="w-full border rounded px-3 py-2 text-sm bg-white">
                  {refAgama.map((a: any) => (
                    <option key={a.id_agama} value={a.id_agama}>{a.agama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
                <select name="jurusan" defaultValue={siswa?.jurusan ?? ''} className="w-full border rounded px-3 py-2 text-sm bg-white">
                  {refJurusan.map((j: any) => (
                    <option key={j.id_kompetensi_keahlian} value={j.id_kompetensi_keahlian}>{j.kompetensi_keahlian}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                <input name="tempat_lahir" defaultValue={siswa?.tempat_lahir ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                <input name="tanggal_lahir" type="date" defaultValue={(() => {
                  if (!siswa?.tanggal_lahir) return '';
                  try {
                    const d = new Date(siswa.tanggal_lahir + 'T00:00:00');
                    if (isNaN(d.getTime())) return '';
                    return d.toISOString().split('T')[0];
                  } catch { return ''; }
                })()} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terima Kelas</label>
                <input name="terima_kelas" defaultValue={siswa?.terima_kelas ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak</label>
                <input name="kontak_siswa" defaultValue={siswa?.kontak_siswa ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea name="alamat" rows={2} defaultValue={siswa?.alamat ?? ''} className="w-full border rounded px-3 py-2 text-sm" />
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
