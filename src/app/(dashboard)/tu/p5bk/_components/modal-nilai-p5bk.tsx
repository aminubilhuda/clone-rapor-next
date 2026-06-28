'use client';

import { useState } from 'react';

interface SubElemenItem {
  id_proyek_subelemen: number;
  id_dimensi: number;
  id_elemen: number;
  id_sub_elemen: number;
  nama_dimensi: string;
  nama_elemen: string;
  nama_sub_elemen: string;
}

interface SiswaNilai {
  id_siswa: number;
  nama_siswa: string;
}

interface ProyekNilai {
  id_kelas: number;
  tahun: number;
  semester: number;
}

interface NilaiData {
  siswa: SiswaNilai[];
  subElemenList: SubElemenItem[];
  existingNilai: Record<string, number>;
  proyek: ProyekNilai;
  _debug?: {
    id_kelas: number;
    siswaCount: number;
    subElemenCount: number;
  };
}

interface ModalNilaiP5BKProps {
  open: boolean;
  onClose: () => void;
  p5bk: any | null;
  loadingData: boolean;
  nilaiData: NilaiData | null;
  onSave: (formData: FormData) => Promise<void>;
}

const OPSI_NILAI = [
  { label: 'MB (Mulai Berkembang)', value: '1' },
  { label: 'SB (Sedang Berkembang)', value: '2' },
  { label: 'BSH (Berkembang Sesuai Harapan)', value: '3' },
  { label: 'SAB (Sangat Berkembang)', value: '4' },
];

export default function ModalNilaiP5BK({
  open, onClose, p5bk, loadingData, nilaiData, onSave,
}: ModalNilaiP5BKProps) {
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await onSave(fd);
    setSaving(false);
  };

  // Group sub_elemen by dimensi for header rendering
  const dimGroups: { id_dimensi: number; nama_dimensi: string; colSpan: number }[] = [];
  if (nilaiData?.subElemenList) {
    let currentDimId = -1;
    let currentGroup: { id_dimensi: number; nama_dimensi: string; colSpan: number } | null = null;
    for (const se of nilaiData.subElemenList) {
      if (se.id_dimensi !== currentDimId) {
        currentGroup = { id_dimensi: se.id_dimensi, nama_dimensi: se.nama_dimensi, colSpan: 0 };
        dimGroups.push(currentGroup);
        currentDimId = se.id_dimensi;
      }
      if (currentGroup) currentGroup.colSpan++;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-6xl mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">
            Nilai P5BK — {p5bk?.judul_proyek ?? ''}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loadingData ? (
          <div className="text-center py-16 text-[#6B7280] text-sm">Memuat data...</div>
        ) : !nilaiData || nilaiData.siswa.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-[#6B7280] text-sm mb-2">Tidak ada siswa di kelas ini</div>
            <div className="text-[#9CA3AF] text-xs space-y-1">
              <div>Proyek ID: {p5bk?.id_proyek_kelas ?? '-'}</div>
              <div>id_kelas: {nilaiData?._debug?.id_kelas ?? nilaiData?.proyek?.id_kelas ?? '-'}</div>
              <div>Siswa count: {nilaiData?._debug?.siswaCount ?? '?'}</div>
              <div>Sub Elemen count: {nilaiData?._debug?.subElemenCount ?? '?'}</div>
              <div>Proyek data: {JSON.stringify(nilaiData?.proyek ?? {})}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="id_proyek_kelas" value={p5bk?.id_proyek_kelas ?? ''} />
            <input type="hidden" name="sub_elemen_ids" value={JSON.stringify(nilaiData.subElemenList.map((se) => se.id_sub_elemen))} />
            <input type="hidden" name="siswa_ids" value={JSON.stringify(nilaiData.siswa.map((s) => s.id_siswa))} />

            <div className="px-6 py-4 max-h-[70vh] overflow-x-auto overflow-y-auto">
              <table className="w-full text-sm border border-[rgba(0,0,0,0.06)] rounded-xl">
                <thead>
                  {/* Row 1: Dimensi name with colspan */}
                  <tr className="bg-[#F8F9FB] border-b border-[rgba(0,0,0,0.04)]">
                    <th rowSpan={2} className="text-left px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium whitespace-nowrap border-r border-[rgba(0,0,0,0.04)]">
                      Nama Siswa
                    </th>
                    {dimGroups.map((g) => (
                      <th
                        key={g.id_dimensi}
                        colSpan={g.colSpan}
                        className="text-center px-3 py-2 text-[#6B7280] text-xs uppercase tracking-wider font-medium whitespace-nowrap border-r border-[rgba(0,0,0,0.04)] last:border-r-0"
                      >
                        {g.nama_dimensi}
                      </th>
                    ))}
                    <th rowSpan={2} className="text-center px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium whitespace-nowrap min-w-[100px]">
                      Cetak Rapor
                    </th>
                  </tr>
                  {/* Row 2: Sub_elemen names */}
                  <tr className="bg-[#F8F9FB] border-b border-[rgba(0,0,0,0.04)]">
                    {nilaiData.subElemenList.map((se) => (
                      <th
                        key={se.id_sub_elemen}
                        className="text-center px-2 py-1.5 text-[#6B7280] text-[11px] font-medium border-r border-[rgba(0,0,0,0.04)] last:border-r-0 leading-tight"
                        title={`${se.nama_elemen}: ${se.nama_sub_elemen}`}
                      >
                        <div className="text-[10px] text-[#9CA3AF]">{se.nama_elemen}</div>
                        <div className="truncate max-w-[140px]">{se.nama_sub_elemen}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nilaiData.siswa.map((siswa) => (
                    <tr key={siswa.id_siswa} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      <td className="px-3 py-2 text-[#1A1A2E] font-medium whitespace-nowrap border-r border-[rgba(0,0,0,0.03)]">
                        {siswa.nama_siswa}
                      </td>
                      {nilaiData.subElemenList.map((se) => {
                        const key = `${siswa.id_siswa}_${se.id_sub_elemen}`;
                        const currentVal = nilaiData.existingNilai[key]?.toString() || '';
                        return (
                          <td key={key} className="px-2 py-2 text-center border-r border-[rgba(0,0,0,0.03)] last:border-r-0">
                            <select
                              name={`nilai_${siswa.id_siswa}_${se.id_sub_elemen}`}
                              defaultValue={currentVal}
                              className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-lg px-1.5 py-1.5 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
                            >
                              <option value="">—</option>
                              {OPSI_NILAI.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          className="px-2 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
                          title="Cetak Rapor (coming soon)"
                        >
                          Cetak
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all">
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                {saving ? 'Menyimpan...' : 'Simpan Nilai'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
