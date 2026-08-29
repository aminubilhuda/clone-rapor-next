'use client';

import { useState } from 'react';
import Link from 'next/link';
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

  const [sections, setSections] = useState<Record<Section, boolean>>({
    'data-pribadi': true,
    'data-ayah': false,
    'data-ibu': false,
    'data-wali': false,
    'data-pendaftaran': false,
  });

  const toggleSection = (s: Section) => setSections((prev) => ({ ...prev, [s]: !prev[s] }));

  const scrollToField = (fieldId: string) => {
    const el = document.getElementById(fieldId);
    if (el) {
      // Open the parent accordion section if collapsed
      const sectionContainer = el.closest('[data-section]');
      if (sectionContainer) {
        const sectionKey = sectionContainer.getAttribute('data-section') as Section;
        if (sectionKey && !sections[sectionKey]) {
          setSections((prev) => ({ ...prev, [sectionKey]: true }));
          // Wait for DOM to update after accordion opens
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }, 150);
          return;
        }
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const namaSiswa = (form.elements.namedItem('nama_siswa') as HTMLInputElement)?.value?.trim();
    if (!namaSiswa) {
      showToast('Nama siswa wajib diisi!', 'error');
      scrollToField('field-nama_siswa');
      return;
    }

    const tanggalLahir = (form.elements.namedItem('tanggal_lahir') as HTMLInputElement)?.value?.trim();
    if (!tanggalLahir) {
      showToast('Tanggal lahir tidak boleh kosong!', 'error');
      scrollToField('field-tanggal_lahir');
      return;
    }

    if (!selectedJurusan) {
      showToast('Jurusan / Kompetensi Keahlian wajib diisi!', 'error');
      scrollToField('field-jurusan');
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

      {/* Navigation Tabs Header */}
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

      {/* 1. Academic Master Summary Card */}
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

      {/* 2. Accordions for Biodata */}
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] p-6 space-y-4">
        {/* ============ DATA IDENTITAS & PRIBADI SISWA ============ */}
        <div data-section="data-pribadi">
          <SectionHeader
            label="Data Identitas & Pribadi Siswa"
            isOpen={sections['data-pribadi']}
            onToggle={() => toggleSection('data-pribadi')}
          />
          <div className={sections['data-pribadi'] ? 'space-y-4 pt-3' : 'hidden'}>
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
        </div>

        {/* ============ DATA AYAH ============ */}
        <div>
          <SectionHeader
            label="Data Ayah Kandung"
            isOpen={sections['data-ayah']}
            onToggle={() => toggleSection('data-ayah')}
          />
          <div className={sections['data-ayah'] ? 'space-y-4 pt-3' : 'hidden'}>
            <FormGrid>
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
                  type="number"
                  min="1900"
                  max="2099"
                  defaultValue={siswa?.tahun_ayah ?? 0}
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
                  placeholder="No. HP / WhatsApp ayah"
                />
              </FormField>
            </FormGrid>
          </div>
        </div>

        {/* ============ DATA IBU ============ */}
        <div>
          <SectionHeader
            label="Data Ibu Kandung"
            isOpen={sections['data-ibu']}
            onToggle={() => toggleSection('data-ibu')}
          />
          <div className={sections['data-ibu'] ? 'space-y-4 pt-3' : 'hidden'}>
            <FormGrid>
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
                  type="number"
                  min="1900"
                  max="2099"
                  defaultValue={siswa?.tahun_ibu ?? 0}
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
            </FormGrid>
          </div>
        </div>

        {/* ============ DATA WALI ============ */}
        <div>
          <SectionHeader
            label="Data Wali (Opsional)"
            isOpen={sections['data-wali']}
            onToggle={() => toggleSection('data-wali')}
          />
          <div className={sections['data-wali'] ? 'space-y-4 pt-3' : 'hidden'}>
            <FormGrid>
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
            </FormGrid>
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
        </div>

        {/* ============ DATA PENDAFTARAN MASUK ============ */}
        <div>
          <SectionHeader
            label="Informasi Pendaftaran & Penerimaan Masuk"
            isOpen={sections['data-pendaftaran']}
            onToggle={() => toggleSection('data-pendaftaran')}
          />
          <div className={sections['data-pendaftaran'] ? 'space-y-4 pt-3' : 'hidden'}>
            <FormGrid>
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
                  defaultValue={(() => {
                    if (!siswa?.terima_tanggal) return '';
                    const raw = siswa.terima_tanggal;
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
            </FormGrid>
          </div>
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