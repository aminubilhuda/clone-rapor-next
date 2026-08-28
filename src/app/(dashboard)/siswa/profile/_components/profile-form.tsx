'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-provider';
import { updateSiswaProfile } from '@/lib/actions/siswa-profile-actions';
import { confirmAlert } from '@/lib/swal';

type Section = 'data-pribadi' | 'data-ayah' | 'data-ibu' | 'data-wali' | 'data-pendaftaran';

function SectionHeader({ label, isOpen, onToggle }: { label: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FB] rounded-xl border border-[rgba(0,0,0,0.05)] hover:bg-gray-100/80 transition-colors"
    >
      <span className="text-sm font-semibold text-[#1A1A2E]">{label}</span>
      <svg
        className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#1A1A2E]/80 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all';
const selectCls =
  'w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all';
const disabledInputCls =
  'w-full bg-gray-100/80 border border-[rgba(0,0,0,0.06)] rounded-xl px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed';

function Select({
  name,
  defaultValue,
  options,
  labelKey,
  valueKey,
}: {
  name: string;
  defaultValue?: string;
  options: any[];
  labelKey: string;
  valueKey: string;
}) {
  return (
    <select name={name} defaultValue={defaultValue ?? ''} className={selectCls}>
      <option value="">Pilih...</option>
      {options.map((o: any) => (
        <option key={o[valueKey]} value={o[valueKey]}>
          {o[labelKey]}
        </option>
      ))}
    </select>
  );
}

export default function ProfileForm({
  siswa,
  refKelamin,
  refAgama,
  refJurusan,
  refTingkat,
  refHubKeluarga,
  refJenisSiswa,
  refPendidikan,
}: {
  siswa: any;
  refKelamin: any[];
  refAgama: any[];
  refJurusan: any[];
  refTingkat: any[];
  refHubKeluarga: any[];
  refJenisSiswa: any[];
  refPendidikan: any[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [sections, setSections] = useState<Record<Section, boolean>>({
    'data-pribadi': true,
    'data-ayah': false,
    'data-ibu': false,
    'data-wali': false,
    'data-pendaftaran': false,
  });

  const toggleSection = (s: Section) => setSections((prev) => ({ ...prev, [s]: !prev[s] }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const username = (form.elements.namedItem('username') as HTMLInputElement)?.value?.trim();
    if (!username) {
      showToast('Username wajib diisi!', 'error');
      return;
    }

    const tanggalLahir = (form.elements.namedItem('tanggal_lahir') as HTMLInputElement)?.value?.trim();
    if (!tanggalLahir) {
      showToast('Tanggal lahir tidak boleh kosong!', 'error');
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
      'Simpan Perubahan Profil?',
      'Pastikan data yang Anda masukkan sudah benar.'
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const fd = new FormData(form);
      const result = await updateSiswaProfile(fd);
      if (result.success) {
        showToast('Profil berhasil disimpan!', 'success');
        // Reset password fields if any
        const newPwInput = form.elements.namedItem('new_password') as HTMLInputElement;
        const confirmPwInput = form.elements.namedItem('confirm_password') as HTMLInputElement;
        if (newPwInput) newPwInput.value = '';
        if (confirmPwInput) confirmPwInput.value = '';
        router.refresh();
      } else {
        showToast(result.error || 'Gagal menyimpan data profil!', 'error');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      showToast('Terjadi kesalahan saat menyimpan data.', 'error');
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
            <span className="text-sm font-medium text-[#1A1A2E]">Menyimpan profil...</span>
          </div>
        </div>
      )}

      {/* Top Header & Actions Bar (Static at the top of the form, not floating) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:px-6 sm:py-4 premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Profil Saya</h1>
          <p className="text-xs text-[#6B7280]">
            Kelola biodata, kontak, dan kata sandi akun Anda
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-medium text-[#1A1A2E]/70 bg-[#F8F9FB] hover:bg-gray-100 border border-[rgba(0,0,0,0.06)] rounded-xl active:scale-[0.98] transition disabled:opacity-50"
          >
            Batal
          </button>
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
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Academic Master Data Card (Official - Read-Only) */}
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center font-bold text-lg border border-red-100">
              {siswa?.nama_siswa?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A2E]">{siswa?.nama_siswa || '-'}</h2>
              <p className="text-xs text-[#6B7280]">
                NISN: <span className="font-semibold text-gray-700">{siswa?.nisn || '-'}</span> | NIS: <span className="font-semibold text-gray-700">{siswa?.nis || '-'}</span>
              </p>
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-3 py-1 rounded-full border border-emerald-100">
            Siswa Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#F8F9FB] rounded-xl p-3 border border-[rgba(0,0,0,0.04)]">
            <span className="text-gray-500 block mb-1">Kelas Aktif</span>
            <span className="font-semibold text-sm text-[#1A1A2E]">{siswa?.kelas_aktif || 'Belum Bergabung'}</span>
          </div>
          <div className="bg-[#F8F9FB] rounded-xl p-3 border border-[rgba(0,0,0,0.04)]">
            <span className="text-gray-500 block mb-1">Kompetensi Keahlian / Jurusan</span>
            <span className="font-semibold text-sm text-[#1A1A2E]">{siswa?.kompetensi_keahlian || '-'}</span>
          </div>
          <div className="bg-[#F8F9FB] rounded-xl p-3 border border-[rgba(0,0,0,0.04)]">
            <span className="text-gray-500 block mb-1">NIK Siswa</span>
            <span className="font-semibold text-sm text-[#1A1A2E]">{siswa?.nik_pd || '-'}</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-gray-400 italic">
          * Data akademik (Nama, NIS, NISN, NIK, Jurusan, dan Kelas) dikelola secara resmi oleh Tata Usaha.
        </p>
      </div>

      {/* 2. Account & Security Card */}
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Pengaturan Akun & Kata Sandi
        </h3>

        <FormGrid>
          <FormField label="Username Login" required>
            <input
              name="username"
              defaultValue={siswa?.username ?? ''}
              required
              className={inputCls}
              placeholder="Username untuk login"
            />
          </FormField>

          <FormField label="No. Telepon / WhatsApp Siswa" required>
            <input
              name="kontak_siswa"
              defaultValue={siswa?.kontak_siswa ?? ''}
              required
              className={inputCls}
              placeholder="Contoh: 08123456789"
            />
          </FormField>

          <FormField label="Password Baru (Kosongkan jika tidak diubah)">
            <div className="relative">
              <input
                name="new_password"
                type={showNewPw ? 'text' : 'password'}
                className={`${inputCls} pr-10`}
                placeholder="Masukkan password baru"
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
          </FormField>

          <FormField label="Konfirmasi Password Baru">
            <div className="relative">
              <input
                name="confirm_password"
                type={showConfirmPw ? 'text' : 'password'}
                className={`${inputCls} pr-10`}
                placeholder="Ulangi password baru"
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
          </FormField>
        </FormGrid>
      </div>

      {/* 3. Detailed Biodata Accordions */}
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] p-6 space-y-4">
        {/* DATA PRIBADI */}
        <div>
          <SectionHeader
            label="Data Pribadi"
            isOpen={sections['data-pribadi']}
            onToggle={() => toggleSection('data-pribadi')}
          />
          <div className={sections['data-pribadi'] ? 'space-y-4 pt-3' : 'hidden'}>
            <FormGrid>
              <FormField label="Tempat Lahir" required>
                <input
                  name="tempat_lahir"
                  defaultValue={siswa?.tempat_lahir ?? ''}
                  required
                  className={inputCls}
                  placeholder="Kota / Kabupaten lahir"
                />
              </FormField>

              <FormField label="Tanggal Lahir" required>
                <input
                  name="tanggal_lahir"
                  type="date"
                  required
                  defaultValue={(() => {
                    if (!siswa?.tanggal_lahir) return '';
                    const raw = siswa.tanggal_lahir;
                    if (typeof raw === 'string') {
                      const m = raw.match(/^\d{4}-\d{2}-\d{2}/);
                      if (m) return m[0];
                    }
                    try {
                      const d = new Date(raw);
                      if (!isNaN(d.getTime())) {
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      }
                    } catch {}
                    return '';
                  })()}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Jenis Kelamin">
                <select name="kelamin" defaultValue={siswa?.kelamin ?? ''} className={selectCls}>
                  <option value="">Pilih...</option>
                  {refKelamin.map((k: any) => (
                    <option key={k.id_jenis_kelamin} value={k.id_jenis_kelamin}>
                      {k.jenis_kelamin}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Agama">
                <select name="agama" defaultValue={siswa?.agama ?? ''} className={selectCls}>
                  <option value="">Pilih...</option>
                  {refAgama.map((a: any) => (
                    <option key={a.id_agama} value={a.id_agama}>
                      {a.agama}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Hubungan Keluarga">
                <Select
                  name="hub_keluarga"
                  defaultValue={siswa?.hub_keluarga ?? ''}
                  options={refHubKeluarga}
                  labelKey="hubunga_keluarga"
                  valueKey="id_hubungan_keluarga"
                />
              </FormField>

              <FormField label="Anak Ke-" required>
                <input
                  name="anak_ke"
                  type="number"
                  min="0"
                  required
                  defaultValue={siswa?.anak_ke ?? 0}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Jumlah Saudara" required>
                <input
                  name="jumlah_saudara"
                  type="number"
                  min="0"
                  required
                  defaultValue={siswa?.jumlah_saudara ?? 0}
                  className={inputCls}
                />
              </FormField>

              <FormField label="No. Kartu Keluarga (KK)">
                <input
                  name="nkk"
                  defaultValue={siswa?.nkk ?? ''}
                  className={inputCls}
                  placeholder="Nomor KK 16 digit"
                />
              </FormField>
            </FormGrid>

            <FormField label="Alamat Tempat Tinggal Siswa" required>
              <textarea
                name="alamat"
                rows={2}
                required
                defaultValue={siswa?.alamat ?? ''}
                className={inputCls}
                placeholder="Alamat lengkap siswa saat ini"
              />
            </FormField>

            <FormField label="Alamat Orang Tua" required>
              <textarea
                name="alamat_orang_tua"
                rows={2}
                required
                defaultValue={siswa?.alamat_orang_tua ?? ''}
                className={inputCls}
                placeholder="Alamat lengkap orang tua"
              />
            </FormField>
          </div>
        </div>

        {/* DATA AYAH */}
        <div>
          <SectionHeader
            label="Data Ayah"
            isOpen={sections['data-ayah']}
            onToggle={() => toggleSection('data-ayah')}
          />
          <div className={sections['data-ayah'] ? 'space-y-4 pt-3' : 'hidden'}>
            <FormGrid>
              <FormField label="Nama Ayah" required>
                <input name="nama_ayah" defaultValue={siswa?.nama_ayah ?? ''} required className={inputCls} />
              </FormField>
              <FormField label="NIK Ayah">
                <input name="nik_ayah" defaultValue={siswa?.nik_ayah ?? ''} className={inputCls} />
              </FormField>
              <FormField label="Tahun Lahir Ayah" required>
                <input
                  name="tahun_ayah"
                  type="number"
                  min="0"
                  required
                  defaultValue={siswa?.tahun_ayah ?? 0}
                  className={inputCls}
                />
              </FormField>
              <FormField label="Pendidikan Ayah" required>
                <Select
                  name="pendidikan_ayah"
                  defaultValue={siswa?.pendidikan_ayah ?? ''}
                  options={refPendidikan}
                  labelKey="pendidikan"
                  valueKey="id_pendidikan"
                />
              </FormField>
              <FormField label="Pekerjaan Ayah" required>
                <input name="pekerjaan_ayah" defaultValue={siswa?.pekerjaan_ayah ?? ''} required className={inputCls} />
              </FormField>
              <FormField label="No. Telepon / HP Ayah" required>
                <input name="kontak_ayah" defaultValue={siswa?.kontak_ayah ?? ''} required className={inputCls} />
              </FormField>
            </FormGrid>
          </div>
        </div>

        {/* DATA IBU */}
        <div>
          <SectionHeader
            label="Data Ibu"
            isOpen={sections['data-ibu']}
            onToggle={() => toggleSection('data-ibu')}
          />
          <div className={sections['data-ibu'] ? 'space-y-4 pt-3' : 'hidden'}>
            <FormGrid>
              <FormField label="Nama Ibu" required>
                <input name="nama_ibu" defaultValue={siswa?.nama_ibu ?? ''} required className={inputCls} />
              </FormField>
              <FormField label="NIK Ibu">
                <input name="nik_ibu" defaultValue={siswa?.nik_ibu ?? ''} className={inputCls} />
              </FormField>
              <FormField label="Tahun Lahir Ibu" required>
                <input
                  name="tahun_ibu"
                  type="number"
                  min="0"
                  required
                  defaultValue={siswa?.tahun_ibu ?? 0}
                  className={inputCls}
                />
              </FormField>
              <FormField label="Pendidikan Ibu" required>
                <Select
                  name="pendidikan_ibu"
                  defaultValue={siswa?.pendidikan_ibu ?? ''}
                  options={refPendidikan}
                  labelKey="pendidikan"
                  valueKey="id_pendidikan"
                />
              </FormField>
              <FormField label="Pekerjaan Ibu" required>
                <input name="pekerjaan_ibu" defaultValue={siswa?.pekerjaan_ibu ?? ''} required className={inputCls} />
              </FormField>
              <FormField label="No. Telepon / HP Ibu" required>
                <input name="kontak_ibu" defaultValue={siswa?.kontak_ibu ?? ''} required className={inputCls} />
              </FormField>
            </FormGrid>
          </div>
        </div>

        {/* DATA WALI */}
        <div>
          <SectionHeader
            label="Data Wali (Opsional)"
            isOpen={sections['data-wali']}
            onToggle={() => toggleSection('data-wali')}
          />
          <div className={sections['data-wali'] ? 'space-y-4 pt-3' : 'hidden'}>
            <FormGrid>
              <FormField label="Nama Wali">
                <input name="nama_wali" defaultValue={siswa?.nama_wali ?? ''} className={inputCls} />
              </FormField>
              <FormField label="Pekerjaan Wali">
                <input name="pekerjaan_wali" defaultValue={siswa?.pekerjaan_wali ?? ''} className={inputCls} />
              </FormField>
              <FormField label="No. Telepon / HP Wali">
                <input name="kontak_wali" defaultValue={siswa?.kontak_wali ?? ''} className={inputCls} />
              </FormField>
            </FormGrid>
            <FormField label="Alamat Wali">
              <textarea
                name="alamat_wali"
                rows={2}
                defaultValue={siswa?.alamat_wali ?? ''}
                className={inputCls}
              />
            </FormField>
          </div>
        </div>

        {/* DATA PENDAFTARAN (Informasi - Read Only) */}
        <div>
          <SectionHeader
            label="Informasi Pendaftaran Masuk (Read-Only)"
            isOpen={sections['data-pendaftaran']}
            onToggle={() => toggleSection('data-pendaftaran')}
          />
          <div className={sections['data-pendaftaran'] ? 'space-y-4 pt-3' : 'hidden'}>
            <FormGrid>
              <FormField label="Diterima di Kelas">
                <input defaultValue={siswa?.terima_kelas ?? '-'} disabled className={disabledInputCls} />
              </FormField>
              <FormField label="Diterima di Tingkat">
                <input
                  defaultValue={
                    refTingkat.find((t: any) => t.id_tingkat === siswa?.terima_tingkat)?.tabjad ||
                    siswa?.terima_tingkat ||
                    '-'
                  }
                  disabled
                  className={disabledInputCls}
                />
              </FormField>
              <FormField label="Tanggal Terima">
                <input
                  defaultValue={
                    siswa?.terima_tanggal
                      ? new Date(siswa.terima_tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'
                  }
                  disabled
                  className={disabledInputCls}
                />
              </FormField>
              <FormField label="Sekolah Asal">
                <input defaultValue={siswa?.sekolah_asal ?? '-'} disabled className={disabledInputCls} />
              </FormField>
            </FormGrid>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons (Dual action for convenience) */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-gray-100 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          Kembali
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}