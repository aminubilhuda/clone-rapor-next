'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-provider';
import {
  saveProyekKokurikuler,
  saveTujuan,
  updateTujuanInline,
  deleteTujuan,
} from '@/lib/actions/kokurikuler-actions';
import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal';

interface KokurikulerEditClientProps {
  proyek: any;
  tujuanList: any[];
  refDimensi: any[];
  refUser: any[];
  refKelas: any[];
}

export default function KokurikulerEditClient({
  proyek,
  tujuanList: initialTujuanList,
  refDimensi,
  refUser,
  refKelas,
}: KokurikulerEditClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Header form states
  const [savingProyek, setSavingProyek] = useState(false);

  // Local state for Tujuan List for fluid inline editing
  const [tujuanRows, setTujuanRows] = useState<any[]>(initialTujuanList);
  const [savingRowId, setSavingRowId] = useState<number | null>(null);
  const [savedRowId, setSavedRowId] = useState<number | null>(null);

  useEffect(() => {
    setTujuanRows(initialTujuanList);
  }, [initialTujuanList]);

  // Modal Buat Tujuan Baru
  const [modalTambahTujuan, setModalTambahTujuan] = useState(false);
  const [formDimensiId, setFormDimensiId] = useState<string>('');
  const [formDeskripsi, setFormDeskripsi] = useState<string>('');
  const [savingTujuanBaru, setSavingTujuanBaru] = useState(false);

  // Modal Contoh Deskripsi Rapor
  const [modalContoh, setModalContoh] = useState<any | null>(null);

  // Modal Hapus Tujuan
  const [tujuanToDelete, setTujuanToDelete] = useState<any | null>(null);

  // Copy text helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Teks berhasil disalin!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  /* ---------- SUBMIT HEADER PROYEK ---------- */
  const handleUpdateProyek = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProyek(true);
    const fd = new FormData(e.currentTarget);
    fd.set('id_proyek_kelas', String(proyek.id_proyek_kelas));
    fd.set('id_kelas', String(proyek.id_kelas));
    fd.set('id_tema', String(proyek.id_tema || '1'));

    const result = await saveProyekKokurikuler(fd);
    if (result.success) {
      showToast('Perubahan kegiatan berhasil disimpan!', 'success');
      router.refresh();
    } else {
      showToast(result.error || 'Gagal menyimpan perubahan kegiatan!', 'error');
    }
    setSavingProyek(false);
  };

  /* ---------- INLINE EDIT DIMENSI & DESKRIPSI ---------- */
  const handleInlineDimensiChange = async (idTujuan: number, newDimensiId: number) => {
    const row = tujuanRows.find((r) => r.id_proyek_tujuan === idTujuan);
    if (!row) return;

    const dimensiObj = refDimensi.find((d) => d.id_dimensi === newDimensiId);
    const namaDimensi = dimensiObj ? dimensiObj.dimensi : row.nama_dimensi;

    // Update state locally immediately
    setTujuanRows((prev) =>
      prev.map((r) =>
        r.id_proyek_tujuan === idTujuan
          ? { ...r, id_dimensi: newDimensiId, nama_dimensi: namaDimensi }
          : r
      )
    );

    // Save to server
    setSavingRowId(idTujuan);
    const res = await updateTujuanInline(idTujuan, newDimensiId, row.deskripsi, proyek.id_proyek_kelas);
    setSavingRowId(null);

    if (res.success) {
      setSavedRowId(idTujuan);
      setTimeout(() => setSavedRowId(null), 2500);
    } else {
      showToast(res.error || 'Gagal menyimpan perubahan dimensi', 'error');
    }
  };

  const handleInlineDeskripsiChange = (idTujuan: number, text: string) => {
    setTujuanRows((prev) =>
      prev.map((r) =>
        r.id_proyek_tujuan === idTujuan ? { ...r, deskripsi: text } : r
      )
    );
  };

  const handleInlineDeskripsiBlur = async (idTujuan: number) => {
    const row = tujuanRows.find((r) => r.id_proyek_tujuan === idTujuan);
    if (!row) return;

    setSavingRowId(idTujuan);
    const res = await updateTujuanInline(
      idTujuan,
      Number(row.id_dimensi),
      row.deskripsi,
      proyek.id_proyek_kelas
    );
    setSavingRowId(null);

    if (res.success) {
      setSavedRowId(idTujuan);
      setTimeout(() => setSavedRowId(null), 2500);
    } else {
      showToast(res.error || 'Gagal menyimpan deskripsi', 'error');
    }
  };

  /* ---------- TAMBAH TUJUAN BARU ---------- */
  const openModalTambah = () => {
    setFormDimensiId(refDimensi[0]?.id_dimensi?.toString() || '');
    setFormDeskripsi('');
    setModalTambahTujuan(true);
  };

  const handleSaveTujuanBaru = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingTujuanBaru(true);
    const fd = new FormData(e.currentTarget);
    fd.set('id_proyek_kelas', String(proyek.id_proyek_kelas));

    const result = await saveTujuan(fd);
    if (result.success) {
      showToast('Tujuan pembelajaran berhasil ditambahkan!', 'success');
      setModalTambahTujuan(false);
      setFormDeskripsi('');
      router.refresh();
    } else {
      showToast(result.error || 'Gagal menyimpan tujuan!', 'error');
    }
    setSavingTujuanBaru(false);
  };

  /* ---------- HAPUS TUJUAN ---------- */
  const handleConfirmHapusTujuan = async () => {
    if (!tujuanToDelete) return;
    const result = await deleteTujuan(
      tujuanToDelete.id_proyek_tujuan,
      proyek.id_proyek_kelas
    );
    if (result.success) {
      showToast('Tujuan pembelajaran berhasil dihapus!', 'success');
      setTujuanToDelete(null);
      setTujuanRows((prev) =>
        prev.filter((r) => r.id_proyek_tujuan !== tujuanToDelete.id_proyek_tujuan)
      );
      router.refresh();
    } else {
      showToast(result.error || 'Gagal menghapus tujuan!', 'error');
    }
  };

  // Selected Dimensi Text for Live Preview in modal
  const selectedDimensiObj = refDimensi.find(
    (d) => String(d.id_dimensi) === formDimensiId
  );
  const selectedDimensiNama =
    selectedDimensiObj?.dimensi ||
    'Keimanan dan Ketakwaan terhadap Tuhan Yang Maha Esa';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/tu/kokurikuler"
            className="text-gray-500 hover:text-[#DC2626] font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kokurikuler
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-800">
            Edit Kegiatan: {proyek.judul_proyek}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200/60">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Kelas {proyek.nama_kelas}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {tujuanRows.length} Tujuan Pembelajaran
          </span>
        </div>
      </div>

      {/* Card 1: Form Edit Informasi Kegiatan */}
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.04)] bg-gradient-to-r from-[#F8F9FB] to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-[#DC2626] flex items-center justify-center font-bold text-sm shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A2E] tracking-tight">
                Pengaturan Kegiatan Kokurikuler
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Ubah pembina dan nama kegiatan untuk kelas {proyek.nama_kelas}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProyek} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Pembina Kegiatan */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-red-100 text-[#DC2626] text-[10px] inline-flex items-center justify-center font-bold">1</span>
                Pembina Kegiatan
              </label>
              <select
                name="id_user"
                defaultValue={proyek.id_user ?? ''}
                className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all font-medium text-gray-800"
              >
                <option value="">-- Pilih Pembina Kegiatan (Dropdown) --</option>
                {refUser.map((u: any) => (
                  <option key={u.id_user} value={u.id_user}>
                    {u.nama} ({u.username})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Nama Kegiatan */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-red-100 text-[#DC2626] text-[10px] inline-flex items-center justify-center font-bold">2</span>
                Nama Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                name="judul_proyek"
                defaultValue={proyek.judul_proyek ?? ''}
                required
                placeholder="Contoh: Pemilihan OSIS"
                className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all font-medium text-gray-800"
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[rgba(0,0,0,0.04)] flex justify-end">
            <button
              type="submit"
              disabled={savingProyek}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-red-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {savingProyek ? 'Menyimpan...' : 'Simpan Perubahan Kegiatan'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Tabel Tujuan Pembelajaran Kokurikuler (INLINE OPTION & INLINE EDIT) */}
      <div className="bg-white rounded-2xl premium-shadow border border-[rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.04)] bg-gradient-to-r from-[#F8F9FB] to-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1A1A2E] tracking-tight">
                  Tujuan Pembelajaran Kokurikuler (Inline Edit)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {tujuanRows.length} Tujuan
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Ubah Dimensi (dropdown) & Deskripsi (textarea) langsung pada baris tabel di bawah ini.
              </p>
            </div>
          </div>

          <button
            onClick={openModalTambah}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm shadow-emerald-600/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Tujuan Pembelajaran
          </button>
        </div>

        {/* Tabel Tujuan dengan INLINE EDIT */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-[rgba(0,0,0,0.04)]">
                <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold w-12">
                  No
                </th>
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold w-72">
                  Dimensi (Inline Option)
                </th>
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold">
                  Deskripsi (Inline Edit)
                </th>
                <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold w-44">
                  Contoh Deskripsi Rapor
                </th>
                <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-semibold w-24">
                  Hapus
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,0,0,0.03)]">
              {tujuanRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-[#6B7280]">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-bold text-gray-800 text-sm">Belum Ada Tujuan Pembelajaran</span>
                      <p className="text-xs text-gray-500 text-center">
                        Tambahkan dimensi Profil Pelajar Pancasila dan deskripsi capaian untuk kegiatan kokurikuler ini.
                      </p>
                      <button
                        onClick={openModalTambah}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Buat Tujuan Pembelajaran
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                tujuanRows.map((t, idx) => {
                  const isSaving = savingRowId === t.id_proyek_tujuan;
                  const isSaved = savedRowId === t.id_proyek_tujuan;

                  return (
                    <tr key={t.id_proyek_tujuan} className="hover:bg-[#F8F9FB] transition-colors group">
                      <td className="text-center px-4 py-3.5 text-[#6B7280] text-xs font-medium align-top pt-5">
                        <div className="flex flex-col items-center gap-1">
                          <span>{idx + 1}</span>
                          {isSaving && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" title="Menyimpan..." />
                          )}
                          {isSaved && (
                            <span className="text-[10px] text-emerald-600 font-bold" title="Tersimpan!">✓</span>
                          )}
                        </div>
                      </td>

                      {/* 1. DIMENSI INLINE OPTION */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="relative">
                          <select
                            value={String(t.id_dimensi)}
                            onChange={(e) =>
                              handleInlineDimensiChange(
                                t.id_proyek_tujuan,
                                Number(e.target.value)
                              )
                            }
                            className="w-full bg-[#F8F9FB] hover:bg-white border border-[rgba(0,0,0,0.08)] focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer shadow-2xs"
                          >
                            {refDimensi.map((d: any) => (
                              <option key={d.id_dimensi} value={d.id_dimensi}>
                                {d.dimensi}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* 2. DESKRIPSI INLINE EDIT (TEXTAREA SUPPORTING QUOTES, 1, SYMBOLS) */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="relative">
                          <textarea
                            value={t.deskripsi || ''}
                            onChange={(e) =>
                              handleInlineDeskripsiChange(
                                t.id_proyek_tujuan,
                                e.target.value
                              )
                            }
                            onBlur={() => handleInlineDeskripsiBlur(t.id_proyek_tujuan)}
                            rows={2}
                            placeholder="Ketik deskripsi capaian (boleh simbol ' atau angka)..."
                            className="w-full bg-[#F8F9FB] hover:bg-white border border-[rgba(0,0,0,0.08)] focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all leading-relaxed resize-y min-h-[56px] shadow-2xs"
                          />
                        </div>
                      </td>

                      {/* 3. CONTOH DESKRIPSI RAPOR BUTTON */}
                      <td className="px-4 py-3.5 text-center align-top pt-4">
                        <button
                          onClick={() => setModalContoh(t)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors shadow-2xs"
                          title="Lihat Contoh Format Rapor Semester"
                        >
                          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Lihat Contoh
                        </button>
                      </td>

                      {/* 4. HAPUS BUTTON */}
                      <td className="px-4 py-3.5 text-center align-top pt-4">
                        <button
                          onClick={() => setTujuanToDelete(t)}
                          className="inline-flex items-center justify-center p-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200/60 transition shadow-2xs"
                          title="Hapus Tujuan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======== MODAL BUAT TUJUAN PEMBELAJARAN BARU ======== */}
      {modalTambahTujuan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalTambahTujuan(false);
          }}
        >
          <div className="bg-white rounded-3xl premium-shadow-lg w-full max-w-2xl animate-modal-in border border-[rgba(0,0,0,0.04)] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)] bg-gradient-to-r from-emerald-50/70 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A2E] tracking-tight">
                    Buat Tujuan Pembelajaran Baru
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Form input dimensi dan deskripsi capaian pembelajaran
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalTambahTujuan(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveTujuanBaru}>
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* 1. Form Dimensi */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] inline-flex items-center justify-center font-bold">1</span>
                    Dimensi Profil Pelajar <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_dimensi"
                    value={formDimensiId}
                    onChange={(e) => setFormDimensiId(e.target.value)}
                    required
                    className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all font-semibold text-gray-800"
                  >
                    {refDimensi.map((d: any) => (
                      <option key={d.id_dimensi} value={d.id_dimensi}>
                        {d.dimensi}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Deskripsi */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] inline-flex items-center justify-center font-bold">2</span>
                    Deskripsi Capaian <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formDeskripsi}
                    onChange={(e) => setFormDeskripsi(e.target.value)}
                    required
                    rows={3}
                    placeholder="Contoh: pengalaman langsung praktik demokrasi di lingkungan sekolah"
                    className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all text-gray-800 leading-relaxed"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Boleh menggunakan tanda petik (&apos;), angka (1), atau simbol lain.
                  </p>
                </div>

                {/* 3. Contoh Deskripsi Rapor (Real-time Live Preview) */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] inline-flex items-center justify-center font-bold">3</span>
                    Contoh Deskripsi Rapor (Live Preview)
                  </label>
                  
                  <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-blue-50/50 border border-emerald-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Preview Kalimat Rapor Semester:
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-emerald-200/60 text-emerald-900 rounded-md">
                        Sangat Baik (SAB)
                      </span>
                    </div>

                    <div className="text-xs text-gray-900 bg-white p-3.5 rounded-xl border border-emerald-200/50 shadow-xs leading-relaxed font-serif">
                      &ldquo;
                      <span className="font-bold text-emerald-800">
                        Sangat baik dalam {selectedDimensiNama}
                      </span>{' '}
                      yang terlihat dari{' '}
                      <span className="font-semibold text-gray-900 underline decoration-emerald-300">
                        {formDeskripsi.trim() || '... (ketik deskripsi di atas)'}
                      </span>
                      .&rdquo;
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[rgba(0,0,0,0.04)] bg-[#F8F9FB]">
                <button
                  type="button"
                  onClick={() => setModalTambahTujuan(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#1A1A2E]/70 bg-white rounded-xl hover:bg-gray-50 border border-gray-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingTujuanBaru}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-emerald-600/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {savingTujuanBaru ? 'Menyimpan...' : 'Simpan Tujuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======== MODAL PREVIEW CONTOH DESKRIPSI RAPOR ======== */}
      {modalContoh && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalContoh(null);
          }}
        >
          <div className="bg-white rounded-3xl premium-shadow-lg w-full max-w-2xl animate-modal-in border border-[rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)] bg-gradient-to-r from-blue-50/70 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-600/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A2E] tracking-tight">
                    Contoh Deskripsi Rapor Semester
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Format deskripsi otomatis berdasarkan predikat nilai siswa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalContoh(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Header Info */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dimensi:</span>
                  <span className="text-xs font-bold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {modalContoh.nama_dimensi}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-700 pt-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Deskripsi:</span>
                  <span className="font-medium text-gray-900 leading-relaxed">{modalContoh.deskripsi}</span>
                </div>
              </div>

              {/* 4 Predikat deskripsi Cards */}
              <div className="space-y-3">
                {/* SAB */}
                {(() => {
                  const text = `Sangat baik dalam ${modalContoh.nama_dimensi} yang terlihat dari ${modalContoh.deskripsi}.`;
                  return (
                    <div className="p-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/70 to-white hover:border-emerald-300 transition shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
                          <span className="text-xs font-bold text-emerald-900">
                            Sangat Berkembang (SAB / Nilai 4)
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(text, 'sab')}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                          {copiedKey === 'sab' ? 'Tersalin!' : 'Salin'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed font-serif pl-4 border-l-2 border-emerald-400">
                        &ldquo;{text}&rdquo;
                      </p>
                    </div>
                  );
                })()}

                {/* BSH */}
                {(() => {
                  const text = `Baik dalam ${modalContoh.nama_dimensi} yang terlihat dari ${modalContoh.deskripsi}.`;
                  return (
                    <div className="p-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 to-white hover:border-blue-300 transition shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs"></span>
                          <span className="text-xs font-bold text-blue-900">
                            Berkembang Sesuai Harapan (BSH / Nilai 3)
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(text, 'bsh')}
                          className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                          {copiedKey === 'bsh' ? 'Tersalin!' : 'Salin'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed font-serif pl-4 border-l-2 border-blue-400">
                        &ldquo;{text}&rdquo;
                      </p>
                    </div>
                  );
                })()}

                {/* SB */}
                {(() => {
                  const text = `Cukup dalam ${modalContoh.nama_dimensi} yang terlihat dari ${modalContoh.deskripsi}.`;
                  return (
                    <div className="p-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/70 to-white hover:border-amber-300 transition shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span>
                          <span className="text-xs font-bold text-amber-900">
                            Sedang Berkembang (SB / Nilai 2)
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(text, 'sb')}
                          className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                          {copiedKey === 'sb' ? 'Tersalin!' : 'Salin'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed font-serif pl-4 border-l-2 border-amber-400">
                        &ldquo;{text}&rdquo;
                      </p>
                    </div>
                  );
                })()}

                {/* MB */}
                {(() => {
                  const text = `Kurang dalam ${modalContoh.nama_dimensi} yang terlihat dari ${modalContoh.deskripsi}.`;
                  return (
                    <div className="p-4 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50/70 to-white hover:border-rose-300 transition shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs"></span>
                          <span className="text-xs font-bold text-rose-900">
                            Mulai Berkembang (MB / Nilai 1)
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(text, 'mb')}
                          className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1 hover:underline"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                          {copiedKey === 'mb' ? 'Tersalin!' : 'Salin'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed font-serif pl-4 border-l-2 border-rose-400">
                        &ldquo;{text}&rdquo;
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-[rgba(0,0,0,0.04)] bg-[#F8F9FB]">
              <button
                type="button"
                onClick={() => setModalContoh(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-gray-800 rounded-xl hover:bg-gray-900 active:scale-[0.98] transition shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======== MODAL CONFIRM DELETE TUJUAN ======== */}
      <ConfirmDeleteModal
        open={!!tujuanToDelete}
        onClose={() => setTujuanToDelete(null)}
        onConfirm={handleConfirmHapusTujuan}
        entityName={
          tujuanToDelete
            ? `tujuan pembelajaran "${tujuanToDelete.nama_dimensi}: ${tujuanToDelete.deskripsi}"`
            : null
        }
      />
    </div>
  );
}
