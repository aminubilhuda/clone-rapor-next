'use client';

import { useState, useRef } from 'react';

interface ModalSiswaProps {
  open: boolean;
  onClose: () => void;
  siswa: any | null;
  refKelamin: any[];
  refAgama: any[];
  refJurusan: any[];
  refTingkat: any[];
  refHubKeluarga: any[];
  refJenisSiswa: any[];
  refPendidikan: any[];
  onSave: (formData: FormData) => Promise<void>;
}

function SectionCard({ label, icon, color, children }: { label: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border border-[rgba(0,0,0,0.06)] overflow-hidden`}>
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

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({ name, defaultValue, options, labelKey, valueKey }: { name: string; defaultValue?: string; options: any[]; labelKey: string; valueKey: string }) {
  return (
    <select name={name} defaultValue={defaultValue ?? ''}
      className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
    >
      <option value="">Pilih...</option>
      {options.map((o: any) => (
        <option key={o[valueKey]} value={o[valueKey]}>{o[labelKey]}</option>
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

export default function ModalSiswa({
  open, onClose, siswa, refKelamin, refAgama, refJurusan,
  refTingkat, refHubKeluarga, refJenisSiswa, refPendidikan, onSave,
}: ModalSiswaProps) {
  const [saving, setSaving] = useState(false);
  const nisnRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const isEdit = !!siswa;

  const generateFromNISN = () => {
    const nisn = nisnRef.current?.value?.trim();
    if (!nisn) {
      nisnRef.current?.focus();
      return;
    }
    if (usernameRef.current) usernameRef.current.value = nisn;
    if (passwordRef.current) passwordRef.current.value = nisn;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await onSave(fd);
    setSaving(false);
  };

  const inputCls = "w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all";
  const selectCls = "w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all";

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto animate-modal-in border border-[rgba(0,0,0,0.04)] relative">
        {saving && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-[#1A1A2E]">Menyimpan...</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">
            {isEdit ? 'Edit Siswa' : 'Tambah Siswa'}
          </h3>
          <button onClick={onClose} disabled={saving} className="text-gray-400 hover:text-gray-600 transition disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id_siswa" value={siswa?.id_siswa ?? ''} />

          <div className="px-6 py-4 space-y-5">

            {/* ============ DATA PRIBADI ============ */}
            <SectionCard label="Data Pribadi" icon={IconUser} color="bg-[#F0F4FF]">
              <div className="space-y-4">
                <FormGrid>
                  <FormField label="Nama Siswa" required>
                    <input name="nama_siswa" defaultValue={siswa?.nama_siswa ?? ''} required className={inputCls} />
                  </FormField>
                  <FormField label="Username" required>
                    <input ref={usernameRef} name="username" defaultValue={siswa?.username ?? ''} required className={inputCls} />
                  </FormField>
                  <FormField label={`Password${isEdit ? ' (kosongi jika tidak diubah)' : ''}`} required={!isEdit}>
                    <input ref={passwordRef} name="password" type="password" required={!isEdit} className={inputCls}
                      placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Password wajib diisi'} />
                  </FormField>
                  <FormField label="NIS">
                    <input name="nis" defaultValue={siswa?.nis ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="NISN">
                    <div className="flex gap-2">
                      <input ref={nisnRef} name="nisn" defaultValue={siswa?.nisn ?? ''} className={`${inputCls} flex-1`} />
                      <button type="button" onClick={generateFromNISN} title="Generate Username & Password dari NISN"
                        className="px-3 py-2.5 bg-[#DC2626] text-white rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] transition-all shrink-0">
                        Generate
                      </button>
                    </div>
                  </FormField>
                  <FormField label="NIK">
                    <input name="nik_pd" defaultValue={siswa?.nik_pd ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="No. KK">
                    <input name="nkk" defaultValue={siswa?.nkk ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="Jenis Kelamin">
                    <select name="kelamin" defaultValue={siswa?.kelamin ?? ''} className={selectCls}>
                      {refKelamin.map((k: any) => (
                        <option key={k.id_jenis_kelamin} value={k.id_jenis_kelamin}>{k.jenis_kelamin}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Agama">
                    <select name="agama" defaultValue={siswa?.agama ?? ''} className={selectCls}>
                      {refAgama.map((a: any) => (
                        <option key={a.id_agama} value={a.id_agama}>{a.agama}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Hubungan Keluarga">
                    <Select name="hub_keluarga" defaultValue={siswa?.hub_keluarga ?? ''} options={refHubKeluarga} labelKey="hubunga_keluarga" valueKey="id_hubungan_keluarga" />
                  </FormField>
                  <FormField label="Tempat Lahir">
                    <input name="tempat_lahir" defaultValue={siswa?.tempat_lahir ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="Tanggal Lahir">
                    <input name="tanggal_lahir" type="date" defaultValue={formatDate(siswa?.tanggal_lahir)} className={inputCls} />
                  </FormField>
                  <FormField label="Jumlah Saudara">
                    <input name="jumlah_saudara" type="number" min="0" defaultValue={siswa?.jumlah_saudara ?? 0} className={inputCls} />
                  </FormField>
                  <FormField label="Anak Ke-">
                    <input name="anak_ke" type="number" min="0" defaultValue={siswa?.anak_ke ?? 0} className={inputCls} />
                  </FormField>
                  <FormField label="Kontak Siswa">
                    <input name="kontak_siswa" defaultValue={siswa?.kontak_siswa ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="Jurusan">
                    <select name="jurusan" defaultValue={siswa?.jurusan ?? ''} className={selectCls}>
                      <option value="">Pilih Jurusan...</option>
                      {refJurusan?.map((j: any) => (
                        <option key={j.id_kompetensi_keahlian} value={j.id_kompetensi_keahlian}>{j.kompetensi_keahlian}</option>
                      ))}
                    </select>
                  </FormField>
                </FormGrid>
                <FormField label="Alamat">
                  <textarea name="alamat" rows={2} defaultValue={siswa?.alamat ?? ''} className={inputCls} />
                </FormField>
                <FormField label="Alamat Orang Tua">
                  <textarea name="alamat_orang_tua" rows={2} defaultValue={siswa?.alamat_orang_tua ?? ''} className={inputCls} />
                </FormField>
              </div>
            </SectionCard>

            {/* ============ DATA AYAH & IBU (side by side on desktop) ============ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* DATA AYAH */}
              <SectionCard label="Data Ayah" icon={IconFather} color="bg-[#F0FDF4]">
                <div className="space-y-4">
                  <FormField label="Nama Ayah">
                    <input name="nama_ayah" defaultValue={siswa?.nama_ayah ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="NIK Ayah">
                    <input name="nik_ayah" defaultValue={siswa?.nik_ayah ?? ''} className={inputCls} />
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
                      placeholder="Contoh: 1975"
                      className={inputCls}
                    />
                  </FormField>
                  <FormField label="Pendidikan Ayah">
                    <Select name="pendidikan_ayah" defaultValue={siswa?.pendidikan_ayah ?? ''} options={refPendidikan} labelKey="pendidikan" valueKey="id_pendidikan" />
                  </FormField>
                  <FormField label="Pekerjaan Ayah">
                    <input name="pekerjaan_ayah" defaultValue={siswa?.pekerjaan_ayah ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="Kontak Ayah">
                    <input name="kontak_ayah" defaultValue={siswa?.kontak_ayah ?? ''} placeholder="Contoh: 085707357080" className={inputCls} />
                  </FormField>
                </div>
              </SectionCard>

              {/* DATA IBU */}
              <SectionCard label="Data Ibu" icon={IconMother} color="bg-[#FFF7ED]">
                <div className="space-y-4">
                  <FormField label="Nama Ibu">
                    <input name="nama_ibu" defaultValue={siswa?.nama_ibu ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="NIK Ibu">
                    <input name="nik_ibu" defaultValue={siswa?.nik_ibu ?? ''} className={inputCls} />
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
                      placeholder="Contoh: 1980"
                      className={inputCls}
                    />
                  </FormField>
                  <FormField label="Pendidikan Ibu">
                    <Select name="pendidikan_ibu" defaultValue={siswa?.pendidikan_ibu ?? ''} options={refPendidikan} labelKey="pendidikan" valueKey="id_pendidikan" />
                  </FormField>
                  <FormField label="Pekerjaan Ibu">
                    <input name="pekerjaan_ibu" defaultValue={siswa?.pekerjaan_ibu ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="Kontak Ibu">
                    <input name="kontak_ibu" defaultValue={siswa?.kontak_ibu ?? ''} placeholder="Contoh: 085707357080" className={inputCls} />
                  </FormField>
                </div>
              </SectionCard>
            </div>

            {/* ============ DATA WALI & PENDAFTARAN (side by side on desktop) ============ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* DATA WALI */}
              <SectionCard label="Data Wali" icon={IconWali} color="bg-[#FDF4FF]">
                <div className="space-y-4">
                  <FormField label="Nama Wali">
                    <input name="nama_wali" defaultValue={siswa?.nama_wali ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="Pekerjaan Wali">
                    <input name="pekerjaan_wali" defaultValue={siswa?.pekerjaan_wali ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="Kontak Wali">
                    <input name="kontak_wali" defaultValue={siswa?.kontak_wali ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="Alamat Wali">
                    <textarea name="alamat_wali" rows={2} defaultValue={siswa?.alamat_wali ?? ''} className={inputCls} />
                  </FormField>
                </div>
              </SectionCard>

              {/* DATA PENDAFTARAN */}
              <SectionCard label="Data Pendaftaran" icon={IconSchool} color="bg-[#FFFBEB]">
                <div className="space-y-4">
                  <FormField label="Terima Kelas">
                    <input name="terima_kelas" defaultValue={siswa?.terima_kelas ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="Terima Tingkat">
                    <select name="terima_tingkat" defaultValue={siswa?.terima_tingkat ?? ''} className={selectCls}>
                      <option value="">Pilih...</option>
                      {refTingkat.map((t: any) => (
                        <option key={t.id_tingkat} value={t.id_tingkat}>{t.tingkat} ({t.tabjad})</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Tanggal Terima">
                    <input name="terima_tanggal" type="date" defaultValue={formatDate(siswa?.terima_tanggal)} className={inputCls} />
                  </FormField>
                  <FormField label="Sekolah Asal">
                    <input name="sekolah_asal" defaultValue={siswa?.sekolah_asal ?? ''} className={inputCls} />
                  </FormField>
                  <FormField label="Jenis Siswa">
                    <Select name="jenis_siswa" defaultValue={siswa?.jenis_siswa ?? '1'} options={refJenisSiswa} labelKey="jenis_siswa" valueKey="id_jenis_siswa" />
                  </FormField>
                </div>
              </SectionCard>
            </div>

          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.04)] sticky bottom-0 bg-white/95 backdrop-blur-sm">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] disabled:opacity-50 transition-all">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}