'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { updateProfil } from '@/lib/actions/profil-actions';

interface ProfilFormProps {
  sekolah: any;
  kepala: any;
}

export default function ProfilForm({ sekolah, kepala }: ProfilFormProps) {
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(
    sekolah.logo ? `/api/uploads/sekolah/${sekolah.logo}` : null
  );
  const [logoProvPreview, setLogoProvPreview] = useState<string | null>(
    sekolah.logo_prov ? `/api/uploads/sekolah/${sekolah.logo_prov}` : null
  );
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoProvInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'logo_prov') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoPreview(reader.result as string);
        } else {
          setLogoProvPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
      {/* Logo Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Logo Sekolah */}
        <div className="bg-[#F8F9FB] rounded-xl p-4 border border-[rgba(0,0,0,0.08)]">
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-3">Logo Sekolah</label>
          <div className="flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-xl bg-white border-2 border-dashed border-[rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                  onError={() => setLogoPreview(null)}
                />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={logoInputRef}
                type="file"
                name="logo_file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogoChange(e, 'logo')}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium"
              >
                Pilih Logo
              </button>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, max 2MB</p>
            </div>
          </div>
        </div>

        {/* Logo Provinsi */}
        <div className="bg-[#F8F9FB] rounded-xl p-4 border border-[rgba(0,0,0,0.08)]">
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-3">Logo Provinsi</label>
          <div className="flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-xl bg-white border-2 border-dashed border-[rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={() => logoProvInputRef.current?.click()}
            >
              {logoProvPreview ? (
                <img
                  src={logoProvPreview}
                  alt="Logo Provinsi"
                  className="w-full h-full object-contain"
                  onError={() => setLogoProvPreview(null)}
                />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={logoProvInputRef}
                type="file"
                name="logo_prov_file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogoChange(e, 'logo_prov')}
              />
              <button
                type="button"
                onClick={() => logoProvInputRef.current?.click()}
                className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium"
              >
                Pilih Logo
              </button>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, max 2MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
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
