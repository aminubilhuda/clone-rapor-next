'use client';

import { useState } from 'react';

interface ModalP5BKProps {
  open: boolean;
  onClose: () => void;
  p5bk: any | null;
  refKelas: any[];
  refTema: any[];
  refUser: any[];
  dimensiTree: any[];
  selectedSubElemen: number[];
  setSelectedSubElemen: (ids: number[]) => void;
  loadingSubElemen: boolean;
  onSave: (formData: FormData) => Promise<void>;
}

export default function ModalP5BK({
  open, onClose, p5bk, refKelas, refTema, refUser,
  dimensiTree, selectedSubElemen, setSelectedSubElemen, loadingSubElemen, onSave,
}: ModalP5BKProps) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!p5bk;

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await onSave(fd);
    setSaving(false);
  };

  const toggleSubElemen = (id: number) => {
    setSelectedSubElemen(
      selectedSubElemen.includes(id)
        ? selectedSubElemen.filter((v) => v !== id)
        : [...selectedSubElemen, id]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-4xl mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">
            {isEdit ? 'Edit P5BK' : 'Tambah P5BK'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id_proyek_kelas" value={p5bk?.id_proyek_kelas ?? ''} />

          <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Tambah mode: Kelas & Tema */}
            {isEdit ? (
              <>
                <input type="hidden" name="id_kelas" value={p5bk?.id_kelas ?? ''} />
                <input type="hidden" name="id_tema" value={p5bk?.id_tema ?? ''} />
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Kelas</label>
                  <select name="id_kelas" defaultValue={p5bk?.id_kelas ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                    <option value="">Pilih Kelas</option>
                    {refKelas.map((k: any) => (
                      <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Tema</label>
                  <select name="id_tema" defaultValue={p5bk?.id_tema ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                    <option value="">Pilih Tema</option>
                    {refTema.map((t: any) => (
                      <option key={t.id_tema} value={t.id_tema}>{t.tema}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Common fields */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Pengguna / Pembina</label>
              <select name="id_user" defaultValue={p5bk?.id_user ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                <option value="">Pilih Pengguna</option>
                {refUser.map((u: any) => (
                  <option key={u.id_user} value={u.id_user}>{u.nama} ({u.username})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Judul Proyek</label>
              <input name="judul_proyek" defaultValue={p5bk?.judul_proyek ?? ''} required className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Deskripsi Proyek</label>
              <textarea name="deskripsi_singkat" defaultValue={p5bk?.deskripsi_singkat ?? ''} rows={3} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
            </div>

            {/* Sub Elemen Table — Edit mode */}
            {isEdit && dimensiTree.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-2">Dimensi, Elemen & Sub Elemen</label>
                {loadingSubElemen ? (
                  <div className="text-center py-8 text-[#6B7280] text-sm">Memuat data...</div>
                ) : (
                  <div className="overflow-x-auto border border-[rgba(0,0,0,0.06)] rounded-xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#F8F9FB] border-b border-[rgba(0,0,0,0.04)]">
                          <th className="text-center px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-12">Ceklis</th>
                          <th className="text-left px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Dimensi</th>
                          <th className="text-left px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Elemen</th>
                          <th className="text-left px-3 py-2.5 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Sub Elemen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dimensiTree.map((d: any) =>
                          d.elemen.map((e: any, ei: number) =>
                            e.sub_elemen.map((s: any, si: number) => (
                              <tr
                                key={s.id_sub_elemen}
                                className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors"
                              >
                                <td className="text-center px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedSubElemen.includes(s.id_sub_elemen)}
                                    onChange={() => toggleSubElemen(s.id_sub_elemen)}
                                    className="accent-[#DC2626] w-4 h-4 cursor-pointer"
                                  />
                                </td>
                                <td className="px-3 py-2 text-[#1A1A2E]/80">
                                  {ei === 0 && si === 0 ? d.dimensi : ''}
                                </td>
                                <td className="px-3 py-2 text-[#1A1A2E]/80">
                                  {si === 0 ? `${e.kode_elemen} ${e.elemen}` : ''}
                                </td>
                                <td className="px-3 py-2 text-[#1A1A2E]/70">
                                  <span className="text-[#6B7280] text-xs mr-1">{s.kode}</span>
                                  {s.sub_elemen}
                                </td>
                              </tr>
                            ))
                          )
                        )}
                        {dimensiTree.every((d: any) =>
                          d.elemen.every((e: any) => e.sub_elemen.length === 0)
                        ) && (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-[#6B7280]">Tidak ada data sub elemen</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
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
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
