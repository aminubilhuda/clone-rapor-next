'use client';

import { useEffect, useMemo, useState } from 'react';
import { JENIS_FIELDS, getJenisConfig, type BKStudent, type JenisLayananBK } from '@/lib/bk';
import {
  getBKSiswaKelas,
  saveBKLayanan,
  type BKGroupInput,
} from '@/lib/actions/bk-actions';
import { useToast } from '@/components/ui/toast-provider';
import { BidangPicker, HeaderFields, PesertaFields, inputClass } from './bk-fields';

interface Props {
  jenis: JenisLayananBK;
  idKelas: number;
  onClose: () => void;
  onSaved: () => void;
}

interface PesertaState {
  bidang: string[];
  fields: Record<string, string>;
}

export default function BKGroupForm({ jenis, idKelas, onClose, onSaved }: Props) {
  const { showToast } = useToast();
  const config = getJenisConfig(jenis);
  const fields = JENIS_FIELDS[jenis];
  const [students, setStudents] = useState<BKStudent[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [peserta, setPeserta] = useState<Record<number, PesertaState>>({});
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jam, setJam] = useState('');
  const [header, setHeader] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBKSiswaKelas(idKelas).then(setStudents).catch(() => setStudents([]));
  }, [idKelas]);

  const filtered = useMemo(
    () => students.filter((s) => s.nama_siswa.toLowerCase().includes(search.toLowerCase().trim())),
    [students, search],
  );

  const toggle = (idSiswa: number) => {
    const active = selected.includes(idSiswa);
    setSelected((prev) =>
      active ? prev.filter((id) => id !== idSiswa) : [...prev, idSiswa],
    );
    setPeserta((prev) => {
      if (active) {
        const next = { ...prev };
        delete next[idSiswa];
        return next;
      }
      return { ...prev, [idSiswa]: prev[idSiswa] ?? { bidang: [], fields: {} } };
    });
  };

  const setPesertaField = (idSiswa: number, field: string, value: string) => {
    setPeserta((prev) => ({
      ...prev,
      [idSiswa]: {
        ...prev[idSiswa],
        fields: { ...prev[idSiswa].fields, [field]: value },
      },
    }));
  };

  const setBidang = (idSiswa: number, bidang: string[]) => {
    setPeserta((prev) => ({
      ...prev,
      [idSiswa]: { ...prev[idSiswa], bidang },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const input: BKGroupInput = {
      jenis,
      idKelas,
      tanggal,
      jam: jam || null,
      ...header,
      peserta: selected.map((idSiswa) => ({
        idSiswa,
        bidang: peserta[idSiswa]?.bidang ?? [],
        ...peserta[idSiswa]?.fields,
      })),
    };
    const result = await saveBKLayanan(input);
    setSaving(false);

    if (result.success) {
      showToast('Layanan kelompok tersimpan', 'success');
      onSaved();
      onClose();
    } else {
      setError(result.error || 'Gagal menyimpan layanan');
      showToast(result.error || 'Gagal menyimpan layanan', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[rgba(0,0,0,0.06)] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              {config.label}
            </p>
            <h3 className="text-base font-semibold text-[#1A1A2E]">Tambah layanan kelompok</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F8F9FB] hover:text-[#1A1A2E]"
            aria-label="Tutup"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">Tanggal</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">Jam</label>
              <input type="time" value={jam} onChange={(e) => setJam(e.target.value)} className={inputClass} />
            </div>
          </div>

          <HeaderFields
            jenis={jenis}
            value={header}
            onChange={(field, value) => setHeader((prev) => ({ ...prev, [field]: value }))}
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">
              Peserta ({selected.length} dipilih)
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari siswa..."
                className={`${inputClass} pl-9`}
              />
            </div>
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[rgba(0,0,0,0.08)]">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-xs text-[#9CA3AF]">Tidak ada siswa.</p>
              ) : (
                filtered.map((s) => {
                  const active = selected.includes(s.id_siswa);
                  return (
                    <label
                      key={s.id_siswa}
                      className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        active ? 'bg-[#FEF2F2]' : 'hover:bg-[#F8F9FB]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggle(s.id_siswa)}
                        className="h-4 w-4 rounded border-gray-300 accent-[#DC2626]"
                      />
                      <span className="text-[#1A1A2E]">{s.nama_siswa}</span>
                      <span className="ml-auto text-[11px] text-[#9CA3AF]">{s.nis ?? '—'}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {selected.map((idSiswa) => {
            const student = students.find((s) => s.id_siswa === idSiswa);
            const value = peserta[idSiswa] ?? { bidang: [], fields: {} };
            return (
              <div key={idSiswa} className="rounded-xl border border-[rgba(0,0,0,0.08)] p-3">
                <p className="mb-2 text-sm font-medium text-[#1A1A2E]">{student?.nama_siswa ?? `Siswa #${idSiswa}`}</p>
                <div className="space-y-3">
                  <PesertaFields
                    jenis={jenis}
                    value={value.fields}
                    onChange={(field, val) => setPesertaField(idSiswa, field, val)}
                  />
                  <BidangPicker value={value.bidang} onChange={(bidang) => setBidang(idSiswa, bidang)} />
                </div>
              </div>
            );
          })}

          {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[rgba(0,0,0,0.06)] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[rgba(0,0,0,0.1)] px-3 py-2 text-xs font-medium text-[#6B7280] hover:bg-[#F8F9FB]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || selected.length < fields.minPeserta}
            className="rounded-lg bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-50"
          >
            {saving ? 'Menyimpan…' : `Simpan (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
