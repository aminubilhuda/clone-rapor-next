'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast-provider';
import {
  saveProyekKokurikuler,
  updatePembinaKokurikuler,
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
  { key: 'nama_pembina', label: 'Pembina (Inline Option)' },
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

export default function KokurikulerClient({ data: initialData, refKelas, refUser }: KokurikulerClientProps) {
  const { showToast } = useToast();

  // Local state for table rows to allow fluid inline updating
  const [tableData, setTableData] = useState<any[]>(initialData);
  const [updatingPembinaId, setUpdatingPembinaId] = useState<number | null>(null);

  useEffect(() => {
    setTableData(initialData);
  }, [initialData]);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const filtered = tableData.filter((row) =>
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

  /* ---------- INLINE EDIT PEMBINA (SELECT OPTION) ---------- */
  const handleInlinePembinaChange = async (idProyekKelas: number, newUserIdStr: string) => {
    const newUserId = newUserIdStr ? Number(newUserIdStr) : null;
    const userObj = refUser.find((u) => u.id_user === newUserId);
    const newNamaPembina = userObj ? userObj.nama : '-';

    // Update state locally immediately
    setTableData((prev) =>
      prev.map((r) =>
        r.id_proyek_kelas === idProyekKelas
          ? { ...r, id_user: newUserId, nama_pembina: newNamaPembina }
          : r
      )
    );

    setUpdatingPembinaId(idProyekKelas);
    const res = await updatePembinaKokurikuler(idProyekKelas, newUserId);
    setUpdatingPembinaId(null);

    if (res.success) {
      showToast('Pembina kegiatan berhasil diperbarui!', 'success');
    } else {
      showToast(res.error || 'Gagal memperbarui pembina!', 'error');
    }
  };

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
    <>
      <h4 className="text-xl font-semibold mb-6 text-[#1A1A2E]">Kokurikuler</h4>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between flex-wrap gap-2">
          <h5 className="font-semibold text-[#1A1A2E]">Daftar Proyek Kokurikuler</h5>
          <button
            onClick={() => setModalTambah(true)}
            className="bg-[#DC2626] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] transition-all"
          >
            + Tambah Kegiatan
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Cari data..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full md:w-64 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Tampil:</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0); }}
                className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>All</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.04)]">
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-12">No</th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Kelas</th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Nama Kegiatan</th>
                  <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-20">Dimensi</th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-64">Pembina (Inline Option)</th>
                  <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-28">Siswa</th>
                  <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-40">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="text-center py-16 text-[#6B7280]">
                      Tidak ada data kegiatan kokurikuler
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, idx) => {
                    const isUpdating = updatingPembinaId === row.id_proyek_kelas;

                    return (
                      <tr key={row.id_proyek_kelas} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                        <td className="px-4 py-3 align-middle text-[#1A1A2E]/80">
                          {safePage * actualPerPage + idx + 1}
                        </td>
                        <td className="px-4 py-3 align-middle font-medium text-[#1A1A2E]">
                          {row.nama_kelas}
                        </td>
                        <td className="px-4 py-3 align-middle font-medium text-[#1A1A2E]">
                          {row.judul_proyek}
                        </td>
                        <td className="text-center px-4 py-3 align-middle">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              row.total_dimensi > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {row.total_dimensi}
                          </span>
                        </td>

                        {/* PEMBINA INLINE EDIT (SELECT OPTION) */}
                        <td className="px-4 py-3 align-middle">
                          <div className="relative">
                            <select
                              value={row.id_user ? String(row.id_user) : ''}
                              onChange={(e) =>
                                handleInlinePembinaChange(
                                  row.id_proyek_kelas,
                                  e.target.value
                                )
                              }
                              className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all text-gray-800"
                            >
                              <option value="">-- Pilih Pembina --</option>
                              {refUser.map((u: any) => (
                                <option key={u.id_user} value={u.id_user}>
                                  {u.nama} ({u.username})
                                </option>
                              ))}
                            </select>
                            {isUpdating && (
                              <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            )}
                          </div>
                        </td>

                        <td className="text-center px-4 py-3 align-middle text-xs text-[#1A1A2E]/80">
                          {row.total_siswa} siswa
                        </td>

                        {/* AKSI BUTTONS */}
                        <td className="px-4 py-3 align-middle text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Edit -> goes to edit page */}
                            <Link
                              href={`/tu/kokurikuler/${row.id_proyek_kelas}`}
                              className="text-amber-600/80 hover:text-amber-600 transition-colors"
                              title="Edit & Kelola Tujuan"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>

                            {/* Nilai */}
                            <button
                              type="button"
                              onClick={() => openNilai(row)}
                              className="text-blue-600/80 hover:text-blue-600 transition-colors"
                              title="Input Nilai Siswa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </button>

                            {/* Copy */}
                            <button
                              type="button"
                              onClick={() => openCopy(row)}
                              className="text-emerald-600/80 hover:text-emerald-600 transition-colors"
                              title="Salin ke Kelas Lain"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                              </svg>
                            </button>

                            {/* Hapus */}
                            <button
                              type="button"
                              onClick={() => openHapus(row)}
                              className="text-[#DC2626]/70 hover:text-[#DC2626] transition-colors"
                              title="Hapus Kegiatan"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280]">
            <span>Total: {filtered.length} data</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(0)} disabled={safePage === 0} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&laquo;</button>
                <button onClick={() => setPage(safePage - 1)} disabled={safePage === 0} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&lsaquo;</button>
                <span className="px-3 text-[#1A1A2E]/80">{safePage + 1} / {totalPages}</span>
                <button onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages - 1} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&rsaquo;</button>
                <button onClick={() => setPage(totalPages - 1)} disabled={safePage >= totalPages - 1} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&raquo;</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======== MODAL TAMBAH KEGIATAN ======== */}
      {modalTambah && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setModalTambah(false); }}
        >
          <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-lg mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-semibold text-[#1A1A2E]">
                Tambah Kegiatan Kokurikuler
              </h3>
              <button onClick={() => setModalTambah(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveTambah}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
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
                  <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
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
                  <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
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

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
                <button
                  type="button"
                  onClick={() => setModalTambah(false)}
                  className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingTambah}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  {savingTambah ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======== MODAL COPY KEGIATAN ======== */}
      {modalCopy && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setModalCopy(false); }}
        >
          <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-lg mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-semibold text-[#1A1A2E]">
                Salin Kegiatan Kokurikuler
              </h3>
              <button onClick={() => setModalCopy(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="p-3 bg-[#F8F9FB] rounded-xl border border-[rgba(0,0,0,0.06)] text-xs space-y-1">
                <div><span className="font-semibold text-gray-800">Kegiatan:</span> {selected.judul_proyek}</div>
                <div><span className="font-semibold text-gray-800">Kelas Asal:</span> {selected.nama_kelas}</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#1A1A2E]/80">
                    Pilih Kelas Target:
                  </label>
                  <button
                    type="button"
                    onClick={toggleSelectAllTarget}
                    className="text-xs text-[#DC2626] hover:underline font-medium"
                  >
                    {copyTargetKelas.length === otherClasses.length ? 'Batal Semua' : 'Pilih Semua'}
                  </button>
                </div>

                {otherClasses.length === 0 ? (
                  <div className="text-xs text-gray-500 py-4 text-center">Tidak ada kelas lain.</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-[rgba(0,0,0,0.08)] rounded-xl p-3 grid grid-cols-2 gap-2 bg-[#F8F9FB]">
                    {otherClasses.map((k: any) => {
                      const checked = copyTargetKelas.includes(k.id_kelas);
                      return (
                        <label
                          key={k.id_kelas}
                          className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer text-xs transition-colors hover:bg-white"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTargetKelas(k.id_kelas)}
                            className="accent-[#DC2626] rounded w-3.5 h-3.5"
                          />
                          <span>{k.nama_kelas}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F9FB] border border-[rgba(0,0,0,0.06)] cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={copyTujuan}
                  onChange={(e) => setCopyTujuan(e.target.checked)}
                  className="accent-[#DC2626] rounded w-4 h-4"
                />
                <span className="font-medium text-gray-800">Salin Tujuan Pembelajaran Juga</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
              <button
                type="button"
                onClick={() => setModalCopy(false)}
                className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteCopy}
                disabled={savingCopy || copyTargetKelas.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setModalNilai(false); }}
        >
          <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-6xl mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A2E]">
                  Nilai Kokurikuler — {selected?.judul_proyek}
                </h3>
                <p className="text-xs text-gray-500">Kelas {selected?.nama_kelas}</p>
              </div>
              <button onClick={() => setModalNilai(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingNilai ? (
              <div className="text-center py-16 text-[#6B7280] text-sm">Memuat data...</div>
            ) : !nilaiData || nilaiData.tujuanList.length === 0 ? (
              <div className="text-center py-12 p-6">
                <div className="text-[#6B7280] text-sm mb-2">Belum ada tujuan untuk proyek ini</div>
                <div className="text-[#9CA3AF] text-xs mb-4">
                  Tambahkan tujuan terlebih dahulu di halaman Edit Kegiatan.
                </div>
                <Link
                  href={`/tu/kokurikuler/${selected?.id_proyek_kelas}`}
                  className="px-4 py-2 bg-[#DC2626] text-white rounded-xl text-xs font-medium hover:bg-[#B91C1C] transition"
                >
                  Buka Halaman Edit
                </Link>
              </div>
            ) : nilaiData.siswa.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                Tidak ada siswa di kelas ini untuk periode yang dipilih.
              </div>
            ) : (
              <form onSubmit={handleSaveNilai}>
                <input type="hidden" name="id_proyek_kelas" value={selected?.id_proyek_kelas ?? ''} />
                <input type="hidden" name="tujuan_ids" value={JSON.stringify(nilaiData.tujuanList.map((t: any) => t.id_proyek_tujuan))} />
                <input type="hidden" name="siswa_ids" value={JSON.stringify(nilaiData.siswa.map((s: any) => s.id_siswa))} />

                <div className="px-6 py-4 max-h-[60vh] overflow-x-auto overflow-y-auto">
                  <table className="w-full text-sm border border-[rgba(0,0,0,0.06)] rounded-xl">
                    <thead>
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
                        <tr key={siswa.id_siswa} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                          <td className="px-3 py-2 text-[#1A1A2E] font-medium whitespace-nowrap border-r border-[rgba(0,0,0,0.03)]">
                            {siswa.nama_siswa}
                          </td>
                          {nilaiData.tujuanList.map((t: any) => {
                            const key = `${siswa.id_siswa}_${t.id_proyek_tujuan}`;
                            const currentVal = nilaiData.existingNilai[key]?.toString() || '';
                            return (
                              <td key={key} className="px-2 py-2 text-center border-r border-[rgba(0,0,0,0.03)] last:border-r-0">
                                <select
                                  name={`nilai_${siswa.id_siswa}_${t.id_proyek_tujuan}`}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
                  <button type="button" onClick={() => setModalNilai(false)} className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all">
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

      {/* ======== MODAL CONFIRM DELETE ======== */}
      <ConfirmDeleteModal
        open={modalHapus}
        onClose={() => { setModalHapus(false); setSelected(null); }}
        onConfirm={handleConfirmHapus}
        entityName={selected ? `kegiatan kokurikuler "${selected.judul_proyek}"` : null}
      />
    </>
  );
}
