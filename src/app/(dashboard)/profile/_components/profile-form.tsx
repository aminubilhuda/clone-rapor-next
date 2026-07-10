'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { updateUserProfile } from '@/lib/actions/profile-actions';

interface ProfileFormProps {
  user: {
    id_user: number;
    nama: string;
    nip: string;
    nuptk: string;
    kontak: string;
    username: string;
    foto: string;
    jabatan: number;
  };
  namaJabatan: string;
}

export default function ProfileForm({ user, namaJabatan }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const [fotoPreview, setFotoPreview] = useState<string | null>(
    user.foto ? `/api/uploads/profile/${user.foto}` : null
  );
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateUserProfile(formData);

    if (result.success) {
      showToast('Profil berhasil disimpan!', 'success');
    } else {
      showToast(result.error || 'Gagal menyimpan profil!', 'error');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Foto Profile */}
      <div className="flex items-center gap-6 mb-6">
        <div
          className="w-24 h-24 rounded-full bg-[#F8F9FB] border-2 border-dashed border-[rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer overflow-hidden shrink-0"
          onClick={() => fotoInputRef.current?.click()}
        >
          {fotoPreview ? (
            <img src={fotoPreview} alt="Foto Profil" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-[#1A1A2E]/30">
              {user.nama.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <input
            ref={fotoInputRef}
            type="file"
            name="foto_file"
            accept="image/*"
            className="hidden"
            onChange={handleFotoChange}
          />
          <button
            type="button"
            onClick={() => fotoInputRef.current?.click()}
            className="text-sm text-[#DC2626] hover:text-[#B91C1C] font-medium"
          >
            Ubah Foto
          </button>
          <p className="text-xs text-[#6B7280] mt-1">JPG/PNG, max 2MB</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Nama Lengkap</label>
          <input name="nama" defaultValue={user.nama} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Username</label>
          <input name="username" defaultValue={user.username} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">NIP</label>
          <input name="nip" defaultValue={user.nip} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">NUPTK</label>
          <input name="nuptk" defaultValue={user.nuptk} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Kontak</label>
          <input name="kontak" defaultValue={user.kontak} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Jabatan</label>
          <input defaultValue={namaJabatan} disabled className="w-full bg-gray-100 border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-[#6B7280] cursor-not-allowed" />
        </div>
      </div>

      {/* Password Section */}
      <div className="mt-6 pt-6 border-t border-[rgba(0,0,0,0.04)]">
        <h4 className="text-sm font-semibold text-[#1A1A2E] mb-4">Ubah Password</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Password Baru</label>
            <input name="new_password" type="password" placeholder="Kosongkan jika tidak diubah" className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Konfirmasi Password</label>
            <input name="confirm_password" type="password" placeholder="Ulangi password baru" className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
          </div>
        </div>
      </div>

      <div className="mt-6 text-right">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#DC2626] text-white px-6 py-2.5 rounded-xl hover:bg-[#B91C1C] disabled:opacity-50 active:scale-[0.98] transition-all text-sm font-medium"
        >
          {saving ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </div>
    </form>
  );
}
