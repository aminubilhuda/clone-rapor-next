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
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">NPSN</label>
          <input name="npsn" defaultValue={sekolah.npsn} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Nama Sekolah</label>
          <input name="nama_sekolah" defaultValue={sekolah.nama_sekolah} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Alamat</label>
          <input name="alamat" defaultValue={sekolah.alamat} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Desa</label>
          <input name="desa" defaultValue={sekolah.desa} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Kecamatan</label>
          <input name="kecamatan" defaultValue={sekolah.kecamatan} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Kabupaten</label>
          <input name="kabupaten" defaultValue={sekolah.kabupaten} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Provinsi</label>
          <input name="provinsi" defaultValue={sekolah.provinsi} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Email</label>
          <input name="email" defaultValue={sekolah.email} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Kontak</label>
          <input name="kontak" defaultValue={sekolah.kontak} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Website</label>
          <input name="website" defaultValue={sekolah.website} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Yayasan</label>
          <input name="yayasan" defaultValue={sekolah.yayasan} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Visi</label>
        <textarea name="visi" rows={3} defaultValue={sekolah.visi} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
      </div>
      <div className="mt-2">
        <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Misi</label>
        <textarea name="misi" rows={3} defaultValue={sekolah.misi} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
      </div>
      <div className="mt-6 text-right">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#DC2626] text-white px-6 py-2.5 rounded-xl hover:bg-[#B91C1C] disabled:opacity-50 active:scale-[0.98] transition-all text-sm font-medium"
        >
          {saving ? 'Menyimpan...' : 'Simpan Data'}
        </button>
      </div>
    </form>
  );
}
