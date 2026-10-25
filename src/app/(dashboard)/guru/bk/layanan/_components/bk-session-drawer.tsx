'use client';

import { useEffect, useState } from 'react';
import {
  formatTanggal,
  getJenisConfig,
  bidangToArray,
  type BKSession,
  type JenisLayananBK,
} from '@/lib/bk';
import {
  deleteBKSesi,
  getBKSesi,
  saveBKSesi,
  type BKSesiInput,
} from '@/lib/actions/bk-actions';
import { useToast } from '@/components/ui/toast-provider';
import { BidangPicker, HeaderFields, PesertaFields, inputClass } from './bk-fields';

interface Props {
  idLayanan: number;
  idSiswa: number;
  studentName: string;
  jenis: JenisLayananBK;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  tanggal: string;
  jam: string;
  bidang: string[];
  header: Record<string, string>;
  peserta: Record<string, string>;
}

const emptyForm = (): FormState => ({
  tanggal: new Date().toISOString().slice(0, 10),
  jam: '',
  bidang: [],
  header: {},
  peserta: {},
});

function fromRow(row: BKSession): FormState {
  return {
    tanggal: row.tanggal ?? '',
    jam: row.jam ? String(row.jam).slice(0, 5) : '',
    bidang: bidangToArray(row.bidang_bimbingan),
    header: {
      agenda: row.agenda ?? '',
      pelaksana: row.pelaksana ?? '',
      tempat: row.tempat ?? '',
      pihak_terlibat: row.pihak_terlibat ?? '',
      tujuan: row.tujuan ?? '',
      petugas: row.petugas ?? '',
    },
    peserta: {
      permasalahan: row.permasalahan ?? '',
      arahan: row.arahan ?? '',
      tindak_lanjut: row.tindak_lanjut ?? '',
      topik: row.topik ?? '',
      pelaksana_dituju: row.pelaksana_dituju ?? '',
      hasil: row.hasil ?? '',
      peristiwa: row.peristiwa ?? '',
      informan: row.informan ?? '',
      pembinaan: row.pembinaan ?? '',
      referal: row.referal ?? '',
      dirujuk_ke: row.dirujuk_ke ?? '',
    },
  };
}

export default function BKSessionDrawer({
  idLayanan,
  idSiswa,
  studentName,
  jenis,
  onClose,
  onSaved,
}: Props) {
  const { showToast } = useToast();
  const config = getJenisConfig(jenis);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBKSesi(idLayanan, idSiswa)
      .then((row) => {
        if (!active) return;
        if (row) setForm(fromRow(row as BKSession));
        else setError('Sesi tidak ditemukan');
      })
      .catch(() => active && setError('Gagal memuat sesi'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [idLayanan, idSiswa]);

  const setHeader = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, header: { ...prev.header, [field]: value } }));

  const setPeserta = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, peserta: { ...prev.peserta, [field]: value } }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const input: BKSesiInput = {
      tanggal: form.tanggal,
      jam: form.jam || null,
      bidang: form.bidang,
      ...form.header,
      ...form.peserta,
    };
    const result = await saveBKSesi(idLayanan, idSiswa, input);
    setSaving(false);

    if (result.success) {
      showToast('Catatan sesi tersimpan', 'success');
      onSaved();
      onClose();
    } else {
      setError(result.error || 'Gagal menyimpan sesi');
      showToast(result.error || 'Gagal menyimpan sesi', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Hapus sesi ini? Catatan yang sudah diisi akan hilang.')) return;
    setSaving(true);
    const result = await deleteBKSesi(idLayanan, idSiswa);
    setSaving(false);
    if (result.success) {
      showToast('Sesi dihapus', 'success');
      onSaved();
      onClose();
    } else {
      showToast(result.error || 'Gagal menghapus sesi', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[rgba(0,0,0,0.06)] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              {config.label}
            </p>
            <h3 className="truncate text-base font-semibold text-[#1A1A2E]">{studentName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
            aria-label="Tutup"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#DC2626]/20 border-t-[#DC2626]" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">Tanggal</label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => setForm((prev) => ({ ...prev, tanggal: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">Jam</label>
                  <input
                    type="time"
                    value={form.jam}
                    onChange={(e) => setForm((prev) => ({ ...prev, jam: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <HeaderFields jenis={jenis} value={form.header} onChange={setHeader} />
              <PesertaFields jenis={jenis} value={form.peserta} onChange={setPeserta} />
              <BidangPicker
                value={form.bidang}
                onChange={(bidang) => setForm((prev) => ({ ...prev, bidang }))}
              />

              {error && (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>
              )}

              <p className="text-[11px] text-[#9CA3AF]">
                Sesi dibuat {formatTanggal(form.tanggal)}. Perubahan langsung tersimpan ke rekap.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[rgba(0,0,0,0.06)] px-5 py-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || loading}
            className="rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-40"
          >
            Hapus sesi
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[rgba(0,0,0,0.1)] px-3 py-2 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#F8F9FB]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="rounded-lg bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
            >
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
