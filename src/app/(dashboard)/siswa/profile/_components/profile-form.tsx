'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-provider';
import { updateSiswaProfile } from '@/lib/actions/siswa-profile-actions';
import { confirmAlert } from '@/lib/swal';

function SectionCard({ label, icon, color, children }: { label: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[rgba(0,0,0,0.06)] overflow-hidden">
      <div className={`flex items-center gap-2.5 px-4 py-3 ${color} border-b border-[rgba(0,0,0,0.04)]`}>
        <div className="w-6 h-6 flex items-center justify-center text-[#1A1A2E]/60 shrink-0">
          {icon}
        </div>
        <span className="text-sm font-semibold text-[#1A1A2E]">{label}</span>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-[#1A1A2E]/80">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all';
const selectCls =
  'w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all';
const disabledInputCls =
  'w-full bg-gray-100/90 border border-[rgba(0,0,0,0.06)] rounded-xl px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed select-none';

function Select({
  name,
  defaultValue,
  options,
  labelKey,
  valueKey,
}: {
  name: string;
  defaultValue?: string | number | null;
  options: any[];
  labelKey: string;
  valueKey: string;
}) {
  return (
    <select name={name} defaultValue={defaultValue ?? ''} className={selectCls}>
      <option value="">Pilih...</option>
      {options?.map((o: any) => (
        <option key={o[valueKey]} value={o[valueKey]}>
          {o[labelKey]}
        </option>
      ))}
    </select>
  );
}

const IconUser = (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconFather = (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconMother = (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const IconWali = (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IconSchool = (
  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
  </svg>
);

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
  const [selectedJurusan, setSelectedJurusan] = useState<string | number>(siswa?.jurusan ?? '');

  const activeJurusanName =
    refJurusan?.find((j: any) => String(j.id_kompetensi_keahlian) === String(selectedJurusan))?.kompetensi_keahlian ||
    siswa?.kompetensi_keahlian ||
    '-';

  const formatDate = (raw: any) => {
    if (!raw) return '';
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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const namaSiswa = (form.elements.namedItem('nama_siswa') as HTMLInputElement)?.value?.trim();
    if (!namaSiswa) {
      showToast('Nama siswa wajib diisi!', 'error');
      document.getElementById('field-nama_siswa')?.focus();
      return;
    }

    const tanggalLahir = (form.elements.namedItem('tanggal_lahir') as HTMLInputElement)?.value?.trim();
    if (!tanggalLahir) {
      showToast('Tanggal lahir tidak boleh kosong!', 'error');
      document.getElementById('field-tanggal_lahir')?.focus();
      return;
    }

    if (!selectedJurusan) {
      showToast('Jurusan / Kompetensi Keahlian wajib diisi!', 'error');
      document.getElementById('field-jurusan')?.focus();
      return;
    }

    const confirmed = await confirmAlert(
      'Simpan Perubahan Biodata?',
      'Pastikan seluruh data profil dan biodata yang dimasukkan sudah benar.'
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const fd = new FormData(form);
      const result = await updateSiswaProfile(fd);
      if (result.success) {
        showToast('Biodata profil berhasil disimpan!', 'success');
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

      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:px-6 sm:py-4 premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Profil & Biodata Siswa</h1>
          <p className="text-xs text-[#6B7280]">
            Kelola identitas, biodata pribadi, data orang tua/wali, dan riwayat pendaftaran
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/siswa/akun"
            className="px-4 py-2.5 text-xs font-semibold text-[#DC2626] bg-red-50 hover:bg-red-100/80 border border-red-200/60 rounded-xl transition flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Pengaturan Akun & Kata Sandi &rarr;</span>
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
                <span>Simpan Biodata</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Switcher Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl w-fit border border-gray-200/50">
        <button
          type="button"
          className="px-4 py-2 text-xs font-bold rounded-xl bg-white text-[#1A1A2E] shadow-sm flex items-center gap-2 transition"
        >
          <svg className="w-4 h-4 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Biodata Siswa
        </button>
        <Link
          href="/siswa/akun"
          className="px-4 py-2 text-xs font-semibold rounded-xl text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white/60 flex items-center gap-2 transition"
        >
          <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Akun & Kata Sandi
        </Link>
      </div>

      {/* Academic Master Summary Card */}
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center font-bold text-lg border border-red-100">
              {siswa?.nama_siswa?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A2E]">{siswa?.nama_siswa || '-'}</h2>
              <p className="text-xs text-[#6B7280]">
                NIS: <span className="font-semibold text-gray-700">{siswa?.nis || '-'}</span> | NISN:{' '}
                <span className="font-semibold text-gray-700">{siswa?.nisn || '-'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-3 py-1 rounded-full border border-emerald-100">
              Siswa Aktif
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#F8F9FB] rounded-xl p-3 border border-[rgba(0,0,0,0.04)]">
            <span className="text-gray-500 block mb-1">Kelas Aktif Saat Ini</span>
            <span className="font-semibold text-sm text-[#1A1A2E]">{siswa?.kelas_aktif || 'Belum Bergabung'}</span>
          </div>
          <div className="bg-[#F8F9FB] rounded-xl p-3 border border-[rgba(0,0,0,0.04)]">
            <span className="text-gray-500 block mb-1">Jurusan Terdaftar</span>
            <span className="font-semibold text-sm text-[#1A1A2E]">{activeJurusanName}</span>
          </div>
          <div className="bg-[#F8F9FB] rounded-xl p-3 border border-[rgba(0,0,0,0.04)]">
            <span className="text-gray-500 block mb-1">NISN (Permanen)</span>
            <span className="font-semibold text-sm text-[#1A1A2E]">{siswa?.nisn || '-'}</span>
          </div>
        </div>
      </div>

      {/* Form Sections - All Always Open */}
      <div className="space-y-5">

        {/* ============ DATA IDENTITAS & PRIBADI SISWA ============ */}
        <SectionCard label="Data Identitas & Pribadi Siswa" icon={IconUser} color="bg-[#F0F4FF]">
          <div className="space-y-4">
            <FormGrid>
              <FormField label="Nama Lengkap Siswa" required>
                <input
                  id="field-nama_siswa"
                  name="nama_siswa"
                  defaultValue={siswa?.nama_siswa ?? ''}
                  required
                  className={inputCls}
                  placeholder="Nama lengkap sesuai akta / ijazah"
                />
              </FormField>

              <FormField label="Nomor Induk Siswa (NIS)">
                <input
                  name="nis"
                  defaultValue={siswa?.nis ?? ''}
                  className={inputCls}
                  placeholder="Nomor Induk Siswa"
                />
              </FormField>

              <FormField label="NISN" hint="Read-Only (Terkunci)">
                <div className="relative">
                  <input
                    value={siswa?.nisn ?? ''}
                    disabled
                    readOnly
                    className={disabledInputCls}
                    title="NISN merupakan nomor identitas nasional permanen dan tidak dapat diubah secara mandiri"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                    Permanen
                  </span>
                </div>
              </FormField>

              <FormField label="NIK Siswa (No. KTP / KIA)">
                <input
                  name="nik_pd"
                  defaultValue={siswa?.nik_pd ?? ''}
                  className={inputCls}
                  placeholder="Nomor Induk Kependudukan 16 digit"
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

              <FormField label="No. Telepon / WhatsApp Siswa">
                <input
                  name="kontak_siswa"
                  defaultValue={siswa?.kontak_siswa ?? ''}
                  className={inputCls}
                  placeholder="Contoh: 08123456789"
                />
              </FormField>

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
                  id="field-tanggal_lahir"
                  name="tanggal_lahir"
                  type="date"
                  required
                  defaultValue={formatDate(siswa?.tanggal_lahir)}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Jenis Kelamin">
                <select name="kelamin" defaultValue={siswa?.kelamin ?? ''} className={selectCls}>
                  <option value="">Pilih...</option>
                  {refKelamin?.map((k: any) => (
                    <option key={k.id_jenis_kelamin} value={k.id_jenis_kelamin}>
                      {k.jenis_kelamin}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Agama">
                <select name="agama" defaultValue={siswa?.agama ?? ''} className={selectCls}>
                  <option value="">Pilih...</option>
                  {refAgama?.map((a: any) => (
                    <option key={a.id_agama} value={a.id_agama}>
                      {a.agama}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Kompetensi Keahlian / Jurusan" required>
                <select
                  id="field-jurusan"
                  name="jurusan"
                  value={selectedJurusan}
                  onChange={(e) => setSelectedJurusan(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Pilih Jurusan...</option>
                  {refJurusan?.map((j: any) => (
                    <option key={j.id_kompetensi_keahlian} value={j.id_kompetensi_keahlian}>
                      {j.kompetensi_keahlian}
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

              <FormField label="Anak Ke-">
                <input
                  name="anak_ke"
                  type="number"
                  min="0"
                  defaultValue={siswa?.anak_ke ?? 0}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Jumlah Saudara">
                <input
                  name="jumlah_saudara"
                  type="number"
                  min="0"
                  defaultValue={siswa?.jumlah_saudara ?? 0}
                  className={inputCls}
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
                placeholder="Alamat lengkap tempat tinggal siswa saat ini"
              />
            </FormField>

            <FormField label="Alamat Orang Tua">
              <textarea
                name="alamat_orang_tua"
                rows={2}
                defaultValue={siswa?.alamat_orang_tua ?? ''}
                className={inputCls}
                placeholder="Alamat lengkap orang tua"
              />
            </FormField>
          </div>
        </SectionCard>

        {/* ============ DATA AYAH & IBU (side by side on desktop) ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* DATA AYAH */}
          <SectionCard label="Data Ayah Kandung" icon={IconFather} color="bg-[#F0FDF4]">
            <div className="space-y-4">
              <FormField label="Nama Ayah" required>
                <input
                  name="nama_ayah"
                  defaultValue={siswa?.nama_ayah ?? ''}
                  required
                  className={inputCls}
                  placeholder="Nama lengkap ayah"
                />
              </FormField>
              <FormField label="NIK Ayah">
                <input
                  name="nik_ayah"
                  defaultValue={siswa?.nik_ayah ?? ''}
                  className={inputCls}
                  placeholder="NIK Ayah 16 digit"
                />
              </FormField>
              <FormField label="Tahun Lahir Ayah">
                <input
                  name="tahun_ayah"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  defaultValue={siswa?.tahun_ayah && siswa.tahun_ayah !== 0 ? String(siswa.tahun_ayah) : ''}
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 4); }}
                  className={inputCls}
                  placeholder="Contoh: 1975"
                />
              </FormField>
              <FormField label="Pendidikan Ayah">
                <Select
                  name="pendidikan_ayah"
                  defaultValue={siswa?.pendidikan_ayah ?? ''}
                  options={refPendidikan}
                  labelKey="pendidikan"
                  valueKey="id_pendidikan"
                />
              </FormField>
              <FormField label="Pekerjaan Ayah">
                <input
                  name="pekerjaan_ayah"
                  defaultValue={siswa?.pekerjaan_ayah ?? ''}
                  className={inputCls}
                  placeholder="Pekerjaan ayah"
                />
              </FormField>
              <FormField label="No. Telepon / HP Ayah">
                <input
                  name="kontak_ayah"
                  defaultValue={siswa?.kontak_ayah ?? ''}
                  className={inputCls}
                  placeholder="Contoh: 085707357080"
                />
              </FormField>
            </div>
          </SectionCard>

          {/* DATA IBU */}
          <SectionCard label="Data Ibu Kandung" icon={IconMother} color="bg-[#FFF7ED]">
            <div className="space-y-4">
              <FormField label="Nama Ibu" required>
                <input
                  name="nama_ibu"
                  defaultValue={siswa?.nama_ibu ?? ''}
                  required
                  className={inputCls}
                  placeholder="Nama lengkap ibu"
                />
              </FormField>
              <FormField label="NIK Ibu">
                <input
                  name="nik_ibu"
                  defaultValue={siswa?.nik_ibu ?? ''}
                  className={inputCls}
                  placeholder="NIK Ibu 16 digit"
                />
              </FormField>
              <FormField label="Tahun Lahir Ibu">
                <input
                  name="tahun_ibu"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  defaultValue={siswa?.tahun_ibu && siswa.tahun_ibu !== 0 ? String(siswa.tahun_ibu) : ''}
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 4); }}
                  className={inputCls}
                  placeholder="Contoh: 1980"
                />
              </FormField>
              <FormField label="Pendidikan Ibu">
                <Select
                  name="pendidikan_ibu"
                  defaultValue={siswa?.pendidikan_ibu ?? ''}
                  options={refPendidikan}
                  labelKey="pendidikan"
                  valueKey="id_pendidikan"
                />
              </FormField>
              <FormField label="Pekerjaan Ibu">
                <input
                  name="pekerjaan_ibu"
                  defaultValue={siswa?.pekerjaan_ibu ?? ''}
                  className={inputCls}
                  placeholder="Pekerjaan ibu"
                />
              </FormField>
              <FormField label="No. Telepon / HP Ibu">
                <input
                  name="kontak_ibu"
                  defaultValue={siswa?.kontak_ibu ?? ''}
                  className={inputCls}
                  placeholder="No. HP / WhatsApp ibu"
                />
              </FormField>
            </div>
          </SectionCard>
        </div>

        {/* ============ DATA WALI & PENDAFTARAN (side by side on desktop) ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* DATA WALI */}
          <SectionCard label="Data Wali (Opsional)" icon={IconWali} color="bg-[#FDF4FF]">
            <div className="space-y-4">
              <FormField label="Nama Wali">
                <input
                  name="nama_wali"
                  defaultValue={siswa?.nama_wali ?? ''}
                  className={inputCls}
                  placeholder="Nama lengkap wali (jika ada)"
                />
              </FormField>
              <FormField label="Pekerjaan Wali">
                <input
                  name="pekerjaan_wali"
                  defaultValue={siswa?.pekerjaan_wali ?? ''}
                  className={inputCls}
                  placeholder="Pekerjaan wali"
                />
              </FormField>
              <FormField label="No. Telepon / HP Wali">
                <input
                  name="kontak_wali"
                  defaultValue={siswa?.kontak_wali ?? ''}
                  className={inputCls}
                  placeholder="No. HP / WhatsApp wali"
                />
              </FormField>
              <FormField label="Alamat Wali">
                <textarea
                  name="alamat_wali"
                  rows={2}
                  defaultValue={siswa?.alamat_wali ?? ''}
                  className={inputCls}
                  placeholder="Alamat lengkap tempat tinggal wali"
                />
              </FormField>
            </div>
          </SectionCard>

          {/* DATA PENDAFTARAN */}
          <SectionCard label="Informasi Pendaftaran & Penerimaan" icon={IconSchool} color="bg-[#FFFBEB]">
            <div className="space-y-4">
              <FormField label="Diterima di Kelas">
                <input
                  name="terima_kelas"
                  defaultValue={siswa?.terima_kelas ?? ''}
                  className={inputCls}
                  placeholder="Contoh: X RPL 1"
                />
              </FormField>
              <FormField label="Diterima di Tingkat">
                <select
                  name="terima_tingkat"
                  defaultValue={siswa?.terima_tingkat ?? ''}
                  className={selectCls}
                >
                  <option value="">Pilih...</option>
                  {refTingkat?.map((t: any) => (
                    <option key={t.id_tingkat} value={t.id_tingkat}>
                      {t.tingkat} ({t.tabjad})
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Tanggal Terima">
                <input
                  name="terima_tanggal"
                  type="date"
                  defaultValue={formatDate(siswa?.terima_tanggal)}
                  className={inputCls}
                />
              </FormField>
              <FormField label="Sekolah Asal">
                <input
                  name="sekolah_asal"
                  defaultValue={siswa?.sekolah_asal ?? ''}
                  className={inputCls}
                  placeholder="Contoh: SMP Negeri 1 ..."
                />
              </FormField>
              <FormField label="Jenis Siswa">
                <Select
                  name="jenis_siswa"
                  defaultValue={siswa?.jenis_siswa ?? '1'}
                  options={refJenisSiswa}
                  labelKey="jenis_siswa"
                  valueKey="id_jenis_siswa"
                />
              </FormField>
            </div>
          </SectionCard>
        </div>

      </div>

      {/* Bottom Action Buttons */}
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
          {saving ? 'Menyimpan...' : 'Simpan Biodata'}
        </button>
      </div>
    </form>
  );
}