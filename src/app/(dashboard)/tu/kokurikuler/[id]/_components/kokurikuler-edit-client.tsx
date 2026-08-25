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
}: KokurikulerEditClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Header form state
  const [savingProyek, setSavingProyek] = useState(false);

  // Local state for Tujuan List for fluid inline editing
  const [tujuanRows, setTujuanRows] = useState<any[]>(initialTujuanList);
  const [savingRowId, setSavingRowId] = useState<number | null>(null);

  useEffect(() => {
    setTujuanRows(initialTujuanList);
  }, [initialTujuanList]);

  // Modal Tambah Tujuan
  const [modalTambah, setModalTambah] = useState(false);
  const [formDimensiId, setFormDimensiId] = useState<string>('');
  const [formDeskripsi, setFormDeskripsi] = useState<string>('');
  const [savingTujuanBaru, setSavingTujuanBaru] = useState(false);

  // Modal Contoh Deskripsi Rapor
  const [modalContoh, setModalContoh] = useState<any | null>(null);

  // Modal Hapus Tujuan
  const [tujuanToDelete, setTujuanToDelete] = useState<any | null>(null);

  /* ---------- SUBMIT INFORMASI KEGIATAN ---------- */
  const handleUpdateProyek = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProyek(true);
    const fd = new FormData(e.currentTarget);
    fd.set('id_proyek_kelas', String(proyek.id_proyek_kelas));
    fd.set('id_kelas', String(proyek.id_kelas));
    fd.set('id_tema', String(proyek.id_tema || '1'));

    const result = await saveProyekKokurikuler(fd);
    if (result.success) {
      showToast('Informasi kegiatan berhasil disimpan!', 'success');
      router.refresh();
    } else {
      showToast(result.error || 'Gagal menyimpan kegiatan!', 'error');
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
      showToast('Dimensi berhasil diperbarui', 'success');
    } else {
      showToast(res.error || 'Gagal menyimpan dimensi', 'error');
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
      showToast('Deskripsi berhasil disimpan', 'success');
    } else {
      showToast(res.error || 'Gagal menyimpan deskripsi', 'error');
    }
  };

  /* ---------- TAMBAH TUJUAN BARU ---------- */
  const openModalTambah = () => {
    setFormDimensiId(refDimensi[0]?.id_dimensi?.toString() || '');
    setFormDeskripsi('');
    setModalTambah(true);
  };

  const handleSaveTujuanBaru = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingTujuanBaru(true);
    const fd = new FormData(e.currentTarget);
    fd.set('id_proyek_kelas', String(proyek.id_proyek_kelas));

    const result = await saveTujuan(fd);
    if (result.success) {
      showToast('Tujuan pembelajaran berhasil ditambahkan!', 'success');
      setModalTambah(false);
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
    <>
      {/* Top Title & Navigation */}
      <div className="mb-4">
        <Link
          href="/tu/kokurikuler"
          className="inline-flex items-center gap-1.5 text-xs text-[#DC2626] font-medium hover:underline mb-2 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Daftar Kokurikuler
        </Link>
        <h4 className="text-xl font-semibold text-[#1A1A2E]">
          Edit Kokurikuler — {proyek.judul_proyek}
        </h4>
      </div>

      {/* Card 1: Informasi Kegiatan */}
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] mb-6">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between">
          <h5 className="font-semibold text-[#1A1A2E]">
            Informasi Kegiatan ({proyek.nama_kelas})
          </h5>
        </div>
        <form onSubmit={handleUpdateProyek} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
                Pembina Kegiatan
              </label>
              <select
                name="id_user"
                defaultValue={proyek.id_user ?? ''}
                className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
              >
                <option value="">-- Pilih Pembina Kegiatan --</option>
                {refUser.map((u: any) => (
                  <option key={u.id_user} value={u.id_user}>
                    {u.nama} ({u.username})
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
                defaultValue={proyek.judul_proyek ?? ''}
                required
                placeholder="Contoh: Pemilihan OSIS"
                className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingProyek}
              className="bg-[#DC2626] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {savingProyek ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Daftar Tujuan Pembelajaran */}
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between flex-wrap gap-2">
          <h5 className="font-semibold text-[#1A1A2E]">
            Daftar Tujuan Pembelajaran
          </h5>
          <button
            type="button"
            onClick={openModalTambah}
            className="bg-[#DC2626] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] transition-all"
          >
            + Buat Tujuan Pembelajaran
          </button>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.04)]">
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-12">
                    No
                  </th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-72">
                    Dimensi
                  </th>
                  <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">
                    Deskripsi
                  </th>
                  <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-44">
                    Contoh Deskripsi Rapor
                  </th>
                  <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-20">
                    Hapus
                  </th>
                </tr>
              </thead>
              <tbody>
                {tujuanRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-[#6B7280]">
                      Belum ada tujuan pembelajaran. Klik tombol &ldquo;+ Buat Tujuan Pembelajaran&rdquo; di atas.
                    </td>
                  </tr>
                ) : (
                  tujuanRows.map((t, idx) => {
                    const isSaving = savingRowId === t.id_proyek_tujuan;

                    return (
                      <tr
                        key={t.id_proyek_tujuan}
                        className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors"
                      >
                        {/* NO */}
                        <td className="px-4 py-3 align-top pt-4 text-[#1A1A2E]/80">
                          <div className="flex items-center gap-1">
                            <span>{idx + 1}</span>
                            {isSaving && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" title="Menyimpan..." />
                            )}
                          </div>
                        </td>

                        {/* DIMENSI INLINE OPTION */}
                        <td className="px-4 py-3 align-top">
                          <select
                            value={String(t.id_dimensi)}
                            onChange={(e) =>
                              handleInlineDimensiChange(
                                t.id_proyek_tujuan,
                                Number(e.target.value)
                              )
                            }
                            className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
                          >
                            {refDimensi.map((d: any) => (
                              <option key={d.id_dimensi} value={d.id_dimensi}>
                                {d.dimensi}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* DESKRIPSI INLINE EDIT */}
                        <td className="px-4 py-3 align-top">
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
                            placeholder="Deskripsi capaian..."
                            className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all leading-relaxed resize-y"
                          />
                        </td>

                        {/* CONTOH DESKRIPSI RAPOR BUTTON */}
                        <td className="px-4 py-3 text-center align-top pt-4">
                          <button
                            type="button"
                            onClick={() => setModalContoh(t)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Contoh
                          </button>
                        </td>

                        {/* HAPUS BUTTON */}
                        <td className="px-4 py-3 text-center align-top pt-4">
                          <button
                            type="button"
                            onClick={() => setTujuanToDelete(t)}
                            className="text-[#DC2626]/70 hover:text-[#DC2626] transition-colors p-1"
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

          <div className="mt-4 px-2 py-2 text-xs text-gray-500 bg-[#F8F9FB] rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Perubahan pada pilihan <b>Dimensi</b> dan <b>Deskripsi</b> akan otomatis tersimpan saat Anda memilih atau berpindah kursor (onBlur).
            </span>
          </div>
        </div>
      </div>

      {/* ======== MODAL BUAT TUJUAN PEMBELAJARAN BARU ======== */}
      {modalTambah && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalTambah(false);
          }}
        >
          <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-lg mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-semibold text-[#1A1A2E]">
                Buat Tujuan Pembelajaran
              </h3>
              <button
                onClick={() => setModalTambah(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveTujuanBaru}>
              <div className="px-6 py-4 space-y-4">
                {/* 1. Form Dimensi */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
                    1. Dimensi Profil Pelajar <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_dimensi"
                    value={formDimensiId}
                    onChange={(e) => setFormDimensiId(e.target.value)}
                    required
                    className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
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
                  <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
                    2. Deskripsi Capaian <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formDeskripsi}
                    onChange={(e) => setFormDeskripsi(e.target.value)}
                    required
                    rows={3}
                    placeholder="Contoh: pengalaman langsung praktik demokrasi di lingkungan sekolah"
                    className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Boleh menggunakan tanda petik (&apos;), angka (1), atau simbol lainnya.
                  </p>
                </div>

                {/* 3. Contoh Deskripsi Rapor */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
                    3. Contoh Deskripsi Rapor
                  </label>
                  <div className="p-3.5 bg-[#F8F9FB] border border-[rgba(0,0,0,0.06)] rounded-xl text-xs text-gray-700 leading-relaxed">
                    &ldquo;
                    <span className="font-semibold text-gray-900">
                      Sangat baik dalam {selectedDimensiNama}
                    </span>{' '}
                    yang terlihat dari{' '}
                    <span className="text-gray-800">
                      {formDeskripsi.trim() || '...'}
                    </span>
                    .&rdquo;
                  </div>
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
                  disabled={savingTujuanBaru}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  {savingTujuanBaru ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======== MODAL CONTOH DESKRIPSI RAPOR ======== */}
      {modalContoh && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalContoh(null);
          }}
        >
          <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-lg mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-semibold text-[#1A1A2E]">
                Contoh Deskripsi Rapor
              </h3>
              <button
                onClick={() => setModalContoh(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
              <div className="p-3 bg-[#F8F9FB] rounded-xl border border-[rgba(0,0,0,0.06)] space-y-1">
                <div><span className="font-semibold text-gray-800">Dimensi:</span> {modalContoh.nama_dimensi}</div>
                <div><span className="font-semibold text-gray-800">Deskripsi:</span> {modalContoh.deskripsi}</div>
              </div>

              {/* SAB */}
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="font-semibold text-emerald-800 mb-1">
                  Sangat Berkembang (SAB / Nilai 4)
                </div>
                <p className="text-gray-800 leading-relaxed">
                  &ldquo;Sangat baik dalam {modalContoh.nama_dimensi} yang terlihat dari {modalContoh.deskripsi}.&rdquo;
                </p>
              </div>

              {/* BSH */}
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40">
                <div className="font-semibold text-blue-800 mb-1">
                  Berkembang Sesuai Harapan (BSH / Nilai 3)
                </div>
                <p className="text-gray-800 leading-relaxed">
                  &ldquo;Baik dalam {modalContoh.nama_dimensi} yang terlihat dari {modalContoh.deskripsi}.&rdquo;
                </p>
              </div>

              {/* SB */}
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40">
                <div className="font-semibold text-amber-800 mb-1">
                  Sedang Berkembang (SB / Nilai 2)
                </div>
                <p className="text-gray-800 leading-relaxed">
                  &ldquo;Cukup dalam {modalContoh.nama_dimensi} yang terlihat dari {modalContoh.deskripsi}.&rdquo;
                </p>
              </div>

              {/* MB */}
              <div className="p-3 rounded-xl border border-red-200 bg-red-50/40">
                <div className="font-semibold text-red-800 mb-1">
                  Mulai Berkembang (MB / Nilai 1)
                </div>
                <p className="text-gray-800 leading-relaxed">
                  &ldquo;Kurang dalam {modalContoh.nama_dimensi} yang terlihat dari {modalContoh.deskripsi}.&rdquo;
                </p>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
              <button
                type="button"
                onClick={() => setModalContoh(null)}
                className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all"
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
            ? `tujuan pembelajaran "${tujuanToDelete.nama_dimensi}"`
            : null
        }
      />
    </>
  );
}
