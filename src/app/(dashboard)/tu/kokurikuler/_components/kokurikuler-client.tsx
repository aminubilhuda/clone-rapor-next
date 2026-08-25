'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast-provider';
import {
  saveProyekKokurikuler,
  deleteKokurikulerProyek,
  copyProyekKokurikuler,
  getDataNilaiKokurikuler,
  saveNilaiKokurikuler,
} from '@/lib/actions/kokurikuler-actions';
import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal';

const COLUMNS = [
  { key: '_no', label: 'No' },
  { key: 'nama_kelas', label: 'Kelas' },
  { key: 'judul_proyek', label: 'Nama Kegiatan' },
  { key: 'total_dimensi', label: 'Dimensi' },
  { key: 'nama_pembina', label: 'Pembina' },
  { key: 'total_siswa', label: 'Siswa' },
  { key: '_aksi', label: 'Aksi' },
];

const OPSI_NILAI = [
  { label: 'MB (Mulai Berkembang)', value: '1' },
  { label: 'SB (Sedang Berkembang)', value: '2' },
  { label: 'BSH (Berkembang Sesuai Harapan)', value: '3' },
  { label: 'SAB (Sangat Berkembang)', value: '4' },
];

interface KokurikulerClientProps {
  data: any[];
  refKelas: any[];
  refUser: any[];
}

export default function KokurikulerClient({ data, refKelas, refUser }: KokurikulerClientProps) {
  const { showToast } = useToast();

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const filtered = data.filter((row) =>
    ['nama_kelas', 'judul_proyek', 'nama_pembina'].some((key) =>
      String(row[key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const actualPerPage = perPage === 0 ? filtered.length : perPage;
  const totalPages = Math.max(1, Math.ceil(filtered.length / actualPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedData = filtered.slice(safePage * actualPerPage, (safePage + 1) * actualPerPage);

  // Modals
  const [modalTambah, setModalTambah] = useState(false);
  const [modalCopy, setModalCopy] = useState(false);
  const [modalNilai, setModalNilai] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  // Loading / Submit states
  const [savingTambah, setSavingTambah] = useState(false);
  const [savingCopy, setSavingCopy] = useState(false);
  const [copyTargetKelas, setCopyTargetKelas] = useState<number[]>([]);
  const [copyTujuan, setCopyTujuan] = useState(true);

  // Nilai Modal state
  const [nilaiData, setNilaiData] = useState<any | null>(null);
  const [loadingNilai, setLoadingNilai] = useState(false);
  const [savingNilai, setSavingNilai] = useState(false);

  /* ---------- TAMBAH KEGIATAN ---------- */
  const handleSaveTambah = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingTambah(true);
    const fd = new FormData(e.currentTarget);
    const result = await saveProyekKokurikuler(fd);
    if (result.success) {
      showToast('Kegiatan kokurikuler berhasil ditambahkan!', 'success');
      setModalTambah(false);
    } else {
      showToast(result.error || 'Gagal menambahkan kegiatan!', 'error');
    }
    setSavingTambah(false);
  };

  /* ---------- COPY KEGIATAN ---------- */
  const openCopy = (row: any) => {
    setSelected(row);
    setCopyTargetKelas([]);
    setCopyTujuan(true);
    setModalCopy(true);
  };

  const toggleTargetKelas = (idKelas: number) => {
    setCopyTargetKelas((prev) =>
      prev.includes(idKelas) ? prev.filter((id) => id !== idKelas) : [...prev, idKelas]
    );
  };

  const toggleSelectAllTarget = () => {
    const available = refKelas.filter((k) => k.id_kelas !== selected?.id_kelas).map((k) => k.id_kelas);
    if (copyTargetKelas.length === available.length) {
      setCopyTargetKelas([]);
    } else {
      setCopyTargetKelas(available);
    }
  };

  const handleExecuteCopy = async () => {
    if (!selected) return;
    if (copyTargetKelas.length === 0) {
      showToast('Pilih minimal satu kelas target!', 'error');
      return;
    }

    setSavingCopy(true);
    const fd = new FormData();
    fd.set('source_id_proyek_kelas', String(selected.id_proyek_kelas));
    fd.set('target_kelas_ids', JSON.stringify(copyTargetKelas));
    fd.set('copy_tujuan', copyTujuan ? '1' : '0');

    const result = await copyProyekKokurikuler(fd);
    if (result.success) {
      showToast(`Berhasil menyalin kegiatan ke ${result.count} kelas!`, 'success');
      setModalCopy(false);
      setSelected(null);
    } else {
      showToast(result.error || 'Gagal menyalin kegiatan!', 'error');
    }
    setSavingCopy(false);
  };

  /* ---------- NILAI MODAL ---------- */
  const openNilai = async (row: any) => {
    setSelected(row);
    setNilaiData(null);
    setLoadingNilai(true);
    setModalNilai(true);
    const result = await getDataNilaiKokurikuler(row.id_proyek_kelas);
    if (result.success) {
      setNilaiData(result.data);
    } else {
      showToast(result.error || 'Gagal mengambil data nilai', 'error');
      setModalNilai(false);
    }
    setLoadingNilai(false);
  };

  const handleSaveNilai = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingNilai(true);
    const fd = new FormData(e.currentTarget);
    const result = await saveNilaiKokurikuler(fd);
    if (result.success) {
      showToast('Nilai kokurikuler berhasil disimpan!', 'success');
      setModalNilai(false);
      setSelected(null);
    } else {
      showToast(result.error || 'Gagal menyimpan nilai!', 'error');
    }
    setSavingNilai(false);
  };

  /* ---------- HAPUS KEGIATAN ---------- */
  const openHapus = (row: any) => {
    setSelected(row);
    setModalHapus(true);
  };

  const handleConfirmHapus = async () => {
    if (!selected) return;
    const result = await deleteKokurikulerProyek(selected.id_proyek_kelas);
    if (result.success) {
      showToast('Kegiatan kokurikuler berhasil dihapus!', 'success');
      setModalHapus(false);
      setSelected(null);
    } else {
      showToast(result.error || 'Gagal menghapus kegiatan!', 'error');
    }
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

  const otherClasses = refKelas.filter((k) => k.id_kelas !== selected?.id_kelas);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-xl font-semibold text-[#1A1A2E]">Kokurikuler</h4>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Kelola kegiatan kokurikuler, tujuan pembelajaran, dan penilaian peserta didik
          </p>
        </div>
        <button
          onClick={() => setModalTambah(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#DC2626] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] transition-all shadow-sm shadow-red-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Kegiatan
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 border-b border-[rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari kegiatan, kelas, atau pembina..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full pl-9 pr-4 py-2 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span>Tampil:</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0); }}
              className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={0}>Semua</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-[rgba(0,0,0,0.04)]">
                <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold w-12">No</th>
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold">Kelas</th>
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold">Nama Kegiatan</th>
                <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold w-24">Dimensi</th>
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold">Pembina</th>
                <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold w-28">Siswa</th>
                <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold w-48">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.03)]">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="text-center py-16 text-[#6B7280]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Belum ada kegiatan kokurikuler.</span>
                      <button
                        onClick={() => setModalTambah(true)}
                        className="text-xs text-[#DC2626] font-medium hover:underline mt-1"
                      >
                        + Tambah kegiatan baru
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr key={row.id_proyek_kelas} className="hover:bg-[#F8F9FB] transition-colors">
                    <td className="text-center px-4 py-3.5 text-[#6B7280] text-xs">
                      {safePage * actualPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-[#1A1A2E]">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800">
                        {row.nama_kelas}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#1A1A2E] font-medium">
                      {row.judul_proyek}
                    </td>
                    <td className="text-center px-4 py-3.5">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          row.total_dimensi > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {row.total_dimensi}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#1A1A2E]/80">
                      {row.nama_pembina || '-'}
                    </td>
                    <td className="text-center px-4 py-3.5">
                      <span className="text-xs font-medium text-[#1A1A2E]/80">
                        {row.total_siswa} siswa
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit -> goes to edit subpage */}
                        <Link
                          href={`/tu/kokurikuler/${row.id_proyek_kelas}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
                          title="Edit Kegiatan & Kelola Tujuan"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>

                        {/* Nilai -> opens input nilai modal */}
                        <button
                          onClick={() => openNilai(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors"
                          title="Input Nilai Siswa"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Nilai
                        </button>

                        {/* Copy -> opens copy modal */}
                        <button
                          onClick={() => openCopy(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
                          title="Salin ke Kelas Lain"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                          Copy
                        </button>

                        {/* Hapus -> opens delete modal */}
                        <button
                          onClick={() => openHapus(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
                          title="Hapus Kegiatan"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-[rgba(0,0,0,0.04)] flex items-center justify-between text-xs text-[#6B7280]">
          <span>Menampilkan {paginatedData.length} dari {filtered.length} kegiatan</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(0)}
                disabled={safePage === 0}
                className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                &laquo;
              </button>
              <button
                onClick={() => setPage(safePage - 1)}
                disabled={safePage === 0}
                className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                &lsaquo;
              </button>
              <span className="px-3 text-[#1A1A2E] font-medium">
                {safePage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages - 1}
                className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                &rsaquo;
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={safePage >= totalPages - 1}
                className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======== MODAL TAMBAH KEGIATAN ======== */}
      {modalTambah && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalTambah(false); }}
        >
          <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-lg animate-modal-in border border-[rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)] bg-[#F8F9FB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-[#DC2626] flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[#1A1A2E]">
                  Tambah Kegiatan Kokurikuler
                </h3>
              </div>
              <button onClick={() => setModalTambah(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveTambah}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] uppercase tracking-wider mb-1.5">
                    Pilihan Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_kelas"
                    required
                    className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {refKelas.map((k: any) => (
                      <option key={k.id_kelas} value={k.id_kelas}>
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] uppercase tracking-wider mb-1.5">
                    Nama Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="judul_proyek"
                    required
                    placeholder="Contoh: Pemilihan OSIS"
                    className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] uppercase tracking-wider mb-1.5">
                    Pembina Kegiatan
                  </label>
                  <select
                    name="id_user"
                    className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
                  >
                    <option value="">-- Pilih Pembina (Opsional) --</option>
                    {refUser.map((u: any) => (
                      <option key={u.id_user} value={u.id_user}>
                        {u.nama} ({u.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[rgba(0,0,0,0.04)] bg-[#F8F9FB]">
                <button
                  type="button"
                  onClick={() => setModalTambah(false)}
                  className="px-4 py-2 text-xs font-medium text-[#1A1A2E]/70 bg-white rounded-xl hover:bg-gray-50 border border-gray-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingTambah}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-red-500/20"
                >
                  {savingTambah ? 'Menyimpan...' : 'Simpan Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======== MODAL COPY KEGIATAN ======== */}
      {modalCopy && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalCopy(false); }}
        >
          <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-lg animate-modal-in border border-[rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)] bg-[#F8F9FB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[#1A1A2E]">
                  Salin Kegiatan Kokurikuler
                </h3>
              </div>
              <button onClick={() => setModalCopy(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Sumber kegiatan info */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 text-xs space-y-1">
                <div className="text-gray-500 font-medium">Kegiatan Sumber:</div>
                <div className="font-semibold text-gray-800 text-sm">{selected.judul_proyek}</div>
                <div className="text-gray-600">Kelas Asal: <span className="font-medium text-gray-800">{selected.nama_kelas}</span> • Pembina: <span className="font-medium text-gray-800">{selected.nama_pembina || '-'}</span></div>
              </div>

              {/* Target classes selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#1A1A2E] uppercase tracking-wider">
                    Pilih Kelas Target
                  </label>
                  <button
                    type="button"
                    onClick={toggleSelectAllTarget}
                    className="text-xs text-[#DC2626] hover:underline font-medium"
                  >
                    {copyTargetKelas.length === otherClasses.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </button>
                </div>

                {otherClasses.length === 0 ? (
                  <div className="text-xs text-gray-500 py-4 text-center">Tidak ada kelas lain yang tersedia.</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 grid grid-cols-2 gap-2 bg-[#F8F9FB]">
                    {otherClasses.map((k: any) => {
                      const checked = copyTargetKelas.includes(k.id_kelas);
                      return (
                        <label
                          key={k.id_kelas}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors border ${
                            checked ? 'bg-white border-red-300 text-gray-900 shadow-sm' : 'border-transparent text-gray-700 hover:bg-white/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTargetKelas(k.id_kelas)}
                            className="accent-[#DC2626] rounded w-3.5 h-3.5"
                          />
                          <span className="font-medium">{k.nama_kelas}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Option to copy tujuan */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={copyTujuan}
                  onChange={(e) => setCopyTujuan(e.target.checked)}
                  className="accent-emerald-600 rounded w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-emerald-900">Salin Tujuan Pembelajaran Juga</span>
                  <p className="text-emerald-700/80 text-[11px] mt-0.5">
                    Semua dimensi & deskripsi tujuan pada kegiatan ini akan ikut diduplikasi ke kelas target
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[rgba(0,0,0,0.04)] bg-[#F8F9FB]">
              <button
                type="button"
                onClick={() => setModalCopy(false)}
                className="px-4 py-2 text-xs font-medium text-[#1A1A2E]/70 bg-white rounded-xl hover:bg-gray-50 border border-gray-200 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteCopy}
                disabled={savingCopy || copyTargetKelas.length === 0}
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-emerald-500/20"
              >
                {savingCopy ? 'Menyalin...' : `Salin ke (${copyTargetKelas.length}) Kelas`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======== MODAL INPUT NILAI KOKURIKULER ======== */}
      {modalNilai && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalNilai(false); }}
        >
          <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-6xl animate-modal-in border border-[rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)] bg-[#F8F9FB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1A1A2E]">
                    Input Nilai Kokurikuler
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selected?.judul_proyek} • Kelas {selected?.nama_kelas}
                  </p>
                </div>
              </div>
              <button onClick={() => setModalNilai(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingNilai ? (
              <div className="text-center py-16 text-[#6B7280] text-sm">Memuat data penilaian...</div>
            ) : !nilaiData || nilaiData.tujuanList.length === 0 ? (
              <div className="text-center py-12 p-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">Belum Ada Tujuan Pembelajaran</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                  Anda perlu menambahkan tujuan pembelajaran terlebih dahulu di halaman edit sebelum dapat menginput nilai siswa.
                </p>
                <Link
                  href={`/tu/kokurikuler/${selected?.id_proyek_kelas}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DC2626] text-white rounded-xl text-xs font-medium hover:bg-[#B91C1C] transition"
                >
                  Buka Halaman Edit & Buat Tujuan
                </Link>
              </div>
            ) : nilaiData.siswa.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                Tidak ada siswa terdaftar di kelas ini pada periode aktif.
              </div>
            ) : (
              <form onSubmit={handleSaveNilai}>
                <input type="hidden" name="id_proyek_kelas" value={selected?.id_proyek_kelas ?? ''} />
                <input type="hidden" name="tujuan_ids" value={JSON.stringify(nilaiData.tujuanList.map((t: any) => t.id_proyek_tujuan))} />
                <input type="hidden" name="siswa_ids" value={JSON.stringify(nilaiData.siswa.map((s: any) => s.id_siswa))} />

                <div className="px-6 py-4 max-h-[60vh] overflow-x-auto overflow-y-auto">
                  <table className="w-full text-sm border border-[rgba(0,0,0,0.06)] rounded-xl overflow-hidden">
                    <thead>
                      {/* Row 1: Dimensi header */}
                      <tr className="bg-[#F8F9FB] border-b border-[rgba(0,0,0,0.06)]">
                        <th rowSpan={2} className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold whitespace-nowrap border-r border-[rgba(0,0,0,0.06)] min-w-[220px]">
                          Nama Siswa
                        </th>
                        {dimGroups.map((g) => (
                          <th
                            key={g.id_dimensi}
                            colSpan={g.colSpan}
                            className="text-center px-3 py-2 text-[#1A1A2E] text-xs font-semibold whitespace-nowrap border-r border-[rgba(0,0,0,0.06)] last:border-r-0 bg-gray-100/70"
                          >
                            {g.nama_dimensi}
                          </th>
                        ))}
                      </tr>
                      {/* Row 2: Tujuan description */}
                      <tr className="bg-[#F8F9FB] border-b border-[rgba(0,0,0,0.06)]">
                        {nilaiData.tujuanList.map((t: any) => (
                          <th
                            key={t.id_proyek_tujuan}
                            className="text-center px-3 py-2 text-[#6B7280] text-[11px] font-medium border-r border-[rgba(0,0,0,0.06)] last:border-r-0 min-w-[150px] max-w-[200px]"
                            title={t.deskripsi}
                          >
                            <div className="line-clamp-2">{t.deskripsi}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(0,0,0,0.04)]">
                      {nilaiData.siswa.map((siswa: any, sIdx: number) => (
                        <tr key={siswa.id_siswa} className="hover:bg-[#F8F9FB] transition-colors">
                          <td className="px-4 py-2.5 font-medium text-[#1A1A2E] whitespace-nowrap border-r border-[rgba(0,0,0,0.04)]">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-4">{sIdx + 1}</span>
                              <span>{siswa.nama_siswa}</span>
                            </div>
                          </td>
                          {nilaiData.tujuanList.map((t: any) => {
                            const key = `${siswa.id_siswa}_${t.id_proyek_tujuan}`;
                            const currentVal = nilaiData.existingNilai[key]?.toString() || '';
                            return (
                              <td key={key} className="px-2 py-2 text-center border-r border-[rgba(0,0,0,0.04)] last:border-r-0">
                                <select
                                  name={`nilai_${siswa.id_siswa}_${t.id_proyek_tujuan}`}
                                  defaultValue={currentVal}
                                  className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all font-medium text-gray-800"
                                >
                                  <option value="">— Pilih —</option>
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

                <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(0,0,0,0.04)] bg-[#F8F9FB]">
                  <div className="text-xs text-gray-500">
                    Nilai: <span className="font-semibold text-gray-700">MB</span> (Mulai), <span className="font-semibold text-gray-700">SB</span> (Sedang), <span className="font-semibold text-gray-700">BSH</span> (Sesuai Harapan), <span className="font-semibold text-gray-700">SAB</span> (Sangat Baik)
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalNilai(false)}
                      className="px-4 py-2 text-xs font-medium text-[#1A1A2E]/70 bg-white rounded-xl hover:bg-gray-50 border border-gray-200 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={savingNilai}
                      className="px-4 py-2 text-xs font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-red-500/20"
                    >
                      {savingNilai ? 'Menyimpan...' : 'Simpan Nilai'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======== MODAL CONFIRM DELETE ======== */}
      <ConfirmDeleteModal
        open={modalHapus}
        onClose={() => { setModalHapus(false); setSelected(null); }}
        onConfirm={handleConfirmHapus}
        entityName={selected ? `kegiatan kokurikuler "${selected.judul_proyek}" (${selected.nama_kelas})` : null}
      />
    </div>
  );
}
