'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { updateProfil } from '@/lib/actions/profil-actions';

interface ProfilFormProps {
  sekolah: any;
  kepala: any;
}

export default function ProfilForm({ sekolah, kepala }: ProfilFormProps) {
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfil(formData);

    if (result.success) {
      showToast('Data berhasil disimpan!', 'success');
    } else {
      showToast(result.error || 'Gagal menyimpan data!', 'error');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NPSN</label>
          <input name="npsn" defaultValue={sekolah.npsn} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah</label>
          <input name="nama_sekolah" defaultValue={sekolah.nama_sekolah} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
          <input name="alamat" defaultValue={sekolah.alamat} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
          <input name="desa" defaultValue={sekolah.desa} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
          <input name="kecamatan" defaultValue={sekolah.kecamatan} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten</label>
          <input name="kabupaten" defaultValue={sekolah.kabupaten} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
          <input name="provinsi" defaultValue={sekolah.provinsi} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" defaultValue={sekolah.email} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kontak</label>
          <input name="kontak" defaultValue={sekolah.kontak} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input name="website" defaultValue={sekolah.website} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yayasan</label>
          <input name="yayasan" defaultValue={sekolah.yayasan} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Visi</label>
        <textarea name="visi" rows={3} defaultValue={sekolah.visi} className="w-full border rounded px-3 py-2 text-sm" />
      </div>
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Misi</label>
        <textarea name="misi" rows={3} defaultValue={sekolah.misi} className="w-full border rounded px-3 py-2 text-sm" />
      </div>
      <div className="mt-6 text-right">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition text-sm font-medium"
        >
          {saving ? 'Menyimpan...' : 'Simpan Data'}
        </button>
      </div>
    </form>
  );
}
