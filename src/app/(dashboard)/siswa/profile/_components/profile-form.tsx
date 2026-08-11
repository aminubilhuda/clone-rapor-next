'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-provider';
import { updateSiswaProfile } from '@/lib/actions/siswa-profile-actions';
import { confirmAlert } from '@/lib/swal';

type Section = 'data-pribadi' | 'data-ayah' | 'data-ibu' | 'data-wali' | 'data-pendaftaran';

function SectionHeader({ label, isOpen, onToggle }: { label: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F8F9FB] rounded-xl border border-[rgba(0,0,0,0.04)] hover:bg-gray-100 transition-colors">
      <span className="text-sm font-semibold text-[#1A1A2E]">{label}</span>
      <svg className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all";
const selectCls = "w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all";

function Select({ name, defaultValue, options, labelKey, valueKey }: { name: string; defaultValue?: string; options: any[]; labelKey: string; valueKey: string }) {
  return (
    <select name={name} defaultValue={defaultValue ?? ''} className={selectCls}>
      <option value="">Pilih...</option>
      {options.map((o: any) => (
        <option key={o[valueKey]} value={o[valueKey]}>{o[labelKey]}</option>
      ))}
    </select>
  );
}

export default function ProfileForm({
  siswa, refKelamin, refAgama, refJurusan, refTingkat,
  refHubKeluarga, refJenisSiswa, refPendidikan,
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
  const nisnRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [sections, setSections] = useState<Record<Section, boolean>>({
    'data-pribadi': true,
    'data-ayah': false,
    'data-ibu': false,
    'data-wali': false,
    'data-pendaftaran': false,
  });

  const toggleSection = (s: Section) => setSections((prev) => ({ ...prev, [s]: !prev[s] }));

  const generateFromNISN = () => {
    const nisn = nisnRef.current?.value?.trim();
    if (!nisn) { nisnRef.current?.focus(); return; }
    if (usernameRef.current) usernameRef.current.value = nisn;
    if (passwordRef.current) passwordRef.current.value = nisn;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const confirmed = await confirmAlert(
      'Simpan Perubahan?',
      'Pastikan data yang Anda masukkan sudah benar.'
    );
    if (!confirmed) { setSaving(false); return; }

    const fd = new FormData(e.currentTarget);
    const result = await updateSiswaProfile(fd);
    if (result.success) {
      showToast('Data berhasil disimpan!', 'success');
      router.refresh();
    } else {
      showToast(result.error || 'Gagal menyimpan data!', 'error');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 bg-white rounded-2xl px-8 py-6 premium-shadow-lg">
            <div className="w-8 h-8 border-3 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-[#1A1A2E]">Menyimpan...</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] p-6 space-y-4">
        {/* DATA PRIBADI */}
        <SectionHeader label="Data Pribadi" isOpen={sections['data-pribadi']} onToggle={() => toggleSection('data-pribadi')} />
        {sections['data-pribadi'] && (
          <div className="space-y-4">
            <FormGrid>
              <FormField label="Nama Siswa" required>
                <input name="nama_siswa" defaultValue={siswa?.nama_siswa ?? ''} required className={inputCls} />
              </FormField>
              <FormField label="Username" required>
                <input ref={usernameRef} name="username" defaultValue={siswa?.username ?? ''} required className={inputCls} />
              </FormField>
              <FormField label="Password (kosongi jika tidak diubah)">
                <input ref={passwordRef} name="password" type="password" className={inputCls} placeholder="Kosongkan jika tidak diubah" />
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
                <input name="tanggal_lahir" type="date" defaultValue={(() => {
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
                })()} className={inputCls} />
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
                  {refJurusan.map((j: any) => (
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
        )}

        {/* DATA AYAH */}
        <SectionHeader label="Data Ayah" isOpen={sections['data-ayah']} onToggle={() => toggleSection('data-ayah')} />
        {sections['data-ayah'] && (
          <FormGrid>
            <FormField label="Nama Ayah">
              <input name="nama_ayah" defaultValue={siswa?.nama_ayah ?? ''} className={inputCls} />
            </FormField>
            <FormField label="NIK Ayah">
              <input name="nik_ayah" defaultValue={siswa?.nik_ayah ?? ''} className={inputCls} />
            </FormField>
            <FormField label="Tahun Lahir Ayah">
              <input name="tahun_ayah" type="number" min="0" defaultValue={siswa?.tahun_ayah ?? 0} className={inputCls} />
            </FormField>
            <FormField label="Pendidikan Ayah">
              <Select name="pendidikan_ayah" defaultValue={siswa?.pendidikan_ayah ?? ''} options={refPendidikan} labelKey="pendidikan" valueKey="id_pendidikan" />
            </FormField>
            <FormField label="Pekerjaan Ayah">
              <input name="pekerjaan_ayah" defaultValue={siswa?.pekerjaan_ayah ?? ''} className={inputCls} />
            </FormField>
            <FormField label="Kontak Ayah">
              <input name="kontak_ayah" defaultValue={siswa?.kontak_ayah ?? ''} className={inputCls} />
            </FormField>
          </FormGrid>
        )}

        {/* DATA IBU */}
        <SectionHeader label="Data Ibu" isOpen={sections['data-ibu']} onToggle={() => toggleSection('data-ibu')} />
        {sections['data-ibu'] && (
          <FormGrid>
            <FormField label="Nama Ibu">
              <input name="nama_ibu" defaultValue={siswa?.nama_ibu ?? ''} className={inputCls} />
            </FormField>
            <FormField label="NIK Ibu">
              <input name="nik_ibu" defaultValue={siswa?.nik_ibu ?? ''} className={inputCls} />
            </FormField>
            <FormField label="Tahun Lahir Ibu">
              <input name="tahun_ibu" type="number" min="0" defaultValue={siswa?.tahun_ibu ?? 0} className={inputCls} />
            </FormField>
            <FormField label="Pendidikan Ibu">
              <Select name="pendidikan_ibu" defaultValue={siswa?.pendidikan_ibu ?? ''} options={refPendidikan} labelKey="pendidikan" valueKey="id_pendidikan" />
            </FormField>
            <FormField label="Pekerjaan Ibu">
              <input name="pekerjaan_ibu" defaultValue={siswa?.pekerjaan_ibu ?? ''} className={inputCls} />
            </FormField>
            <FormField label="Kontak Ibu">
              <input name="kontak_ibu" defaultValue={siswa?.kontak_ibu ?? ''} className={inputCls} />
            </FormField>
          </FormGrid>
        )}

        {/* DATA WALI */}
        <SectionHeader label="Data Wali" isOpen={sections['data-wali']} onToggle={() => toggleSection('data-wali')} />
        {sections['data-wali'] && (
          <FormGrid>
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
          </FormGrid>
        )}

        {/* DATA PENDAFTARAN */}
        <SectionHeader label="Data Pendaftaran" isOpen={sections['data-pendaftaran']} onToggle={() => toggleSection('data-pendaftaran')} />
        {sections['data-pendaftaran'] && (
          <FormGrid>
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
              <input name="terima_tanggal" type="date" defaultValue={(() => {
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
              })()} className={inputCls} />
            </FormField>
            <FormField label="Sekolah Asal">
              <input name="sekolah_asal" defaultValue={siswa?.sekolah_asal ?? ''} className={inputCls} />
            </FormField>
            <FormField label="Jenis Siswa">
              <Select name="jenis_siswa" defaultValue={siswa?.jenis_siswa ?? '1'} options={refJenisSiswa} labelKey="jenis_siswa" valueKey="id_jenis_siswa" />
            </FormField>
          </FormGrid>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] disabled:opacity-50 transition-all">
          Batal
        </button>
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all">
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}