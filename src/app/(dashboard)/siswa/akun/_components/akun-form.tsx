'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-provider';
import { updateSiswaAccount } from '@/lib/actions/siswa-profile-actions';
import { confirmAlert } from '@/lib/swal';

const inputCls =
  'w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all';

export default function AkunForm({
  siswa,
}: {
  siswa: {
    id_siswa: number;
    nama_siswa: string;
    nis: string;
    nisn: string;
    username: string;
    kelas_aktif: string;
  };
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const username = (form.elements.namedItem('username') as HTMLInputElement)?.value?.trim();
    if (!username) {
      showToast('Username login wajib diisi!', 'error');
      return;
    }

    const newPw = (form.elements.namedItem('new_password') as HTMLInputElement)?.value?.trim();
    const confirmPw = (form.elements.namedItem('confirm_password') as HTMLInputElement)?.value?.trim();

    if (newPw) {
      if (newPw.length < 4) {
        showToast('Password baru minimal 4 karakter!', 'error');
        return;
      }
      if (newPw !== confirmPw) {
        showToast('Konfirmasi password baru tidak cocok!', 'error');
        return;
      }
    }

    const confirmed = await confirmAlert(
      'Simpan Pengaturan Akun?',
      newPw
        ? 'Password Anda akan diubah. Pastikan Anda mengingat password baru Anda untuk login berikutnya.'
        : 'Perubahan username akun Anda akan disimpan.'
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const fd = new FormData(form);
      const result = await updateSiswaAccount(fd);
      if (result.success) {
        showToast('Pengaturan akun berhasil disimpan!', 'success');
        const newPwInput = form.elements.namedItem('new_password') as HTMLInputElement;
        const confirmPwInput = form.elements.namedItem('confirm_password') as HTMLInputElement;
        if (newPwInput) newPwInput.value = '';
        if (confirmPwInput) confirmPwInput.value = '';
        router.refresh();
      } else {
        showToast(result.error || 'Gagal menyimpan data akun!', 'error');
      }
    } catch (err: any) {
      console.error('Account submit error:', err);
      showToast('Terjadi kesalahan saat menyimpan akun.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 bg-white rounded-2xl px-8 py-6 premium-shadow-lg">
            <div className="w-8 h-8 border-3 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-[#1A1A2E]">Menyimpan data akun...</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:px-6 sm:py-4 premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Akun & Kata Sandi</h1>
          <p className="text-xs text-[#6B7280]">
            Kelola username login dan ubah kata sandi akun portal siswa Anda
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/siswa/profile"
            className="px-4 py-2.5 text-xs font-medium text-[#1A1A2E]/70 bg-[#F8F9FB] hover:bg-gray-100 border border-[rgba(0,0,0,0.06)] rounded-xl transition"
          >
            &larr; Lihat Biodata Profil
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.98] rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Simpan Akun</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Switcher Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl w-fit border border-gray-200/50">
        <Link
          href="/siswa/profile"
          className="px-4 py-2 text-xs font-semibold rounded-xl text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white/60 flex items-center gap-2 transition"
        >
          <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Biodata Siswa
        </Link>
        <button
          type="button"
          className="px-4 py-2 text-xs font-bold rounded-xl bg-white text-[#1A1A2E] shadow-sm flex items-center gap-2 transition"
        >
          <svg className="w-4 h-4 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Akun & Kata Sandi
        </button>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] p-6 space-y-6">
        {/* User Identity Banner */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-[rgba(0,0,0,0.05)]">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center font-bold text-lg border border-red-100 shrink-0">
            {siswa?.nama_siswa?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1A1A2E]">{siswa?.nama_siswa || '-'}</h2>
            <p className="text-xs text-[#6B7280]">
              NISN: <span className="font-semibold text-gray-700">{siswa?.nisn || '-'}</span> | Kelas:{' '}
              <span className="font-semibold text-gray-700">{siswa?.kelas_aktif || '-'}</span>
            </p>
          </div>
        </div>

        {/* Section 1: Username */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
              <svg className="w-4 h-4 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Username Login
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Username yang digunakan untuk masuk ke akun portal Anda.
            </p>
          </div>

          <div className="max-w-md">
            <label className="block text-xs font-medium text-[#1A1A2E]/80 mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              name="username"
              defaultValue={siswa?.username ?? ''}
              required
              className={inputCls}
              placeholder="Masukkan username login"
            />
          </div>
        </div>

        <hr className="border-[rgba(0,0,0,0.05)]" />

        {/* Section 2: Change Password */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
              <svg className="w-4 h-4 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Ganti Kata Sandi (Password)
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Biarkan kosong jika Anda tidak bermaksud mengubah kata sandi saat ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1A1A2E]/80 mb-1.5">
                Password Baru
              </label>
              <div className="relative">
                <input
                  name="new_password"
                  type={showNewPw ? 'text' : 'password'}
                  className={`${inputCls} pr-10`}
                  placeholder="Minimal 4 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded"
                  title={showNewPw ? 'Sembunyikan' : 'Lihat password'}
                >
                  {showNewPw ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1A1A2E]/80 mb-1.5">
                Ulangi Password Baru
              </label>
              <div className="relative">
                <input
                  name="confirm_password"
                  type={showConfirmPw ? 'text' : 'password'}
                  className={`${inputCls} pr-10`}
                  placeholder="Ketik ulang password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded"
                  title={showConfirmPw ? 'Sembunyikan' : 'Lihat password'}
                >
                  {showConfirmPw ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold mb-0.5">Petunjuk Keamanan Akun:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700/90 text-[11px]">
                <li>Gunakan kata sandi yang mudah Anda ingat namun sulit ditebak oleh orang lain.</li>
                <li>Jangan membagikan username dan password Anda kepada teman atau pihak lain.</li>
                <li>Jika lupa password, silakan hubungi Guru BK atau staf Tata Usaha (TU) sekolah.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/siswa/profile"
          className="px-6 py-2.5 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-gray-100 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all"
        >
          Kembali ke Biodata
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm"
        >
          {saving ? 'Menyimpan...' : 'Simpan Akun'}
        </button>
      </div>
    </form>
  );
}
