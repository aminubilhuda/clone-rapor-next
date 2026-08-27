'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import {
  getDataNilaiKokurikuler,
  saveNilaiKokurikuler,
} from '@/lib/actions/kokurikuler-actions';

const OPSI_NILAI = [
  { label: 'MB (Mulai Berkembang)', value: '1' },
  { label: 'SB (Sedang Berkembang)', value: '2' },
  { label: 'BSH (Berkembang Sesuai Harapan)', value: '3' },
  { label: 'SAB (Sangat Berkembang)', value: '4' },
];

interface GuruKokurikulerClientProps {
  proyekList: any[];
}

export default function GuruKokurikulerClient({ proyekList }: GuruKokurikulerClientProps) {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedProyek, setSelectedProyek] = useState<any | null>(null);

  // Modal Nilai
  const [modalNilai, setModalNilai] = useState(false);
  const [nilaiData, setNilaiData] = useState<any | null>(null);
  const [loadingNilai, setLoadingNilai] = useState(false);
  const [savingNilai, setSavingNilai] = useState(false);

  const filtered = proyekList.filter((p) =>
    ['nama_kelas', 'judul_proyek'].some((key) =>
      String(p[key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  /* ---------- BUKA MODAL PENILAIAN ---------- */
  const openNilai = async (row: any) => {
    setSelectedProyek(row);
    setNilaiData(null);
    setLoadingNilai(true);
    setModalNilai(true);
    const result = await getDataNilaiKokurikuler(row.id_proyek_kelas);
    if (result.success) {
      setNilaiData(result.data);
    } else {
      showToast(result.error || 'Gagal mengambil data penilaian', 'error');
      setModalNilai(false);
    }
    setLoadingNilai(false);
  };

  /* ---------- SIMPAN PENILAIAN ---------- */
  const handleSaveNilai = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingNilai(true);
    const fd = new FormData(e.currentTarget);
    const result = await saveNilaiKokurikuler(fd);
    if (result.success) {
      showToast('Nilai kokurikuler siswa berhasil disimpan!', 'success');
      setModalNilai(false);
      setSelectedProyek(null);
    } else {
      showToast(result.error || 'Gagal menyimpan nilai!', 'error');
    }
    setSavingNilai(false);
  };

  // Dimensi grouping for Nilai modal header
  const dimGroups: { id_dimensi: number; nama_dimensi: string; colSpan: number }[] = [];
  if (nilaiData?.tujuanList) {
    let currentDimId = -1;
    let currentGroup: typeof dimGroups[0] | null = null;
    for (const t of nilaiData.tujuanList) {
      if (t.id_dimensi !== currentDimId) {
        currentGroup = { id_dimensi: t.id_dimensi, nama_dimensi: t.nama_dimensi, colSpan: 0 };
        dimGroups.push(currentGroup);
        currentDimId = t.id_dimensi;
      }
      if (currentGroup) currentGroup.colSpan++;
    }
  }

  return (
    <>
      <h4 className="text-xl font-semibold mb-6 text-[#1A1A2E]">Kokurikuler</h4>

      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between flex-wrap gap-2">
          <h5 className="font-semibold text-[#1A1A2E]">
            Daftar Kegiatan Kokurikuler yang Dibina
          </h5>
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Cari kegiatan atau kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.04)]">
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-12">
                    No
                  </th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">
                    Kelas
                  </th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">
                    Nama Kegiatan
                  </th>
                  <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-24">
                    Dimensi
                  </th>
                  <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-28">
                    Siswa
                  </th>
                  <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-36">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#6B7280]">
                      Anda belum memiliki tugas pembinaan kegiatan kokurikuler pada periode aktif ini.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => (
                    <tr
                      key={row.id_proyek_kelas}
                      className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors"
                    >
                      <td className="px-4 py-3 text-[#1A1A2E]/80">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-[#1A1A2E]">
                        {row.nama_kelas}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#1A1A2E]">
                        {row.judul_proyek}
                      </td>
                      <td className="text-center px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.total_dimensi > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {row.total_dimensi} Dimensi
                        </span>
                      </td>
                      <td className="text-center px-4 py-3 text-xs text-[#1A1A2E]/80">
                        {row.total_siswa} siswa
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openNilai(row)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.98] transition-all shadow-sm shadow-red-500/20"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Penilaian
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ======== MODAL PENILAIAN KOKURIKULER ======== */}
      {modalNilai && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalNilai(false);
          }}
        >
          <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-6xl mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A2E]">
                  Penilaian Kokurikuler — {selectedProyek?.judul_proyek}
                </h3>
                <p className="text-xs text-gray-500">
                  Kelas: {selectedProyek?.nama_kelas}
                </p>
              </div>
              <button
                onClick={() => setModalNilai(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingNilai ? (
              <div className="text-center py-16 text-[#6B7280] text-sm">
                Memuat data penilaian...
              </div>
            ) : !nilaiData || nilaiData.tujuanList.length === 0 ? (
              <div className="text-center py-12 p-6">
                <div className="text-[#6B7280] text-sm mb-2">
                  Belum ada tujuan pembelajaran untuk kegiatan ini.
                </div>
                <div className="text-[#9CA3AF] text-xs">
                  Hubungi Admin Tata Usaha untuk menambahkan tujuan pembelajaran kegiatan ini.
                </div>
              </div>
            ) : nilaiData.siswa.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                Tidak ada siswa di kelas ini pada periode yang dipilih.
              </div>
            ) : (
              <form onSubmit={handleSaveNilai}>
                <input
                  type="hidden"
                  name="id_proyek_kelas"
                  value={selectedProyek?.id_proyek_kelas ?? ''}
                />
                <input
                  type="hidden"
                  name="tujuan_ids"
                  value={JSON.stringify(
                    nilaiData.tujuanList.map((t: any) => t.id_proyek_tujuan)
                  )}
                />
                <input
                  type="hidden"
                  name="siswa_ids"
                  value={JSON.stringify(
                    nilaiData.siswa.map((s: any) => s.id_siswa)
                  )}
                />

                <div className="px-6 py-4 max-h-[60vh] overflow-x-auto overflow-y-auto">
                  <table className="w-full text-sm border border-[rgba(0,0,0,0.06)] rounded-xl">
                    <thead>
                      <tr className="bg-[#F8F9FB] border-b border-[rgba(0,0,0,0.04)]">
                        <th
                          rowSpan={2}
                          className="text-left px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium whitespace-nowrap border-r border-[rgba(0,0,0,0.04)]"
                        >
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
                      </tr>
                      <tr className="bg-[#F8F9FB] border-b border-[rgba(0,0,0,0.04)]">
                        {nilaiData.tujuanList.map((t: any) => (
                          <th
                            key={t.id_proyek_tujuan}
                            className="text-center px-2 py-1.5 text-[#6B7280] text-[11px] font-medium border-r border-[rgba(0,0,0,0.04)] last:border-r-0 leading-tight"
                            title={t.deskripsi}
                          >
                            <div className="truncate max-w-[140px]">{t.deskripsi}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {nilaiData.siswa.map((siswa: any) => (
                        <tr
                          key={siswa.id_siswa}
                          className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors"
                        >
                          <td className="px-3 py-2 text-[#1A1A2E] font-medium whitespace-nowrap border-r border-[rgba(0,0,0,0.03)]">
                            {siswa.nama_siswa}
                          </td>
                          {nilaiData.tujuanList.map((t: any) => {
                            const key = `${siswa.id_siswa}_${t.id_proyek_tujuan}`;
                            const currentVal =
                              nilaiData.existingNilai[key]?.toString() || '';
                            return (
                              <td
                                key={key}
                                className="px-2 py-2 text-center border-r border-[rgba(0,0,0,0.03)] last:border-r-0"
                              >
                                <select
                                  name={`nilai_${siswa.id_siswa}_${t.id_proyek_tujuan}`}
                                  defaultValue={currentVal}
                                  className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-lg px-1.5 py-1.5 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
                                >
                                  <option value="">—</option>
                                  {OPSI_NILAI.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
                  <button
                    type="button"
                    onClick={() => setModalNilai(false)}
                    className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingNilai}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
                  >
                    {savingNilai ? 'Menyimpan...' : 'Simpan Nilai'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
