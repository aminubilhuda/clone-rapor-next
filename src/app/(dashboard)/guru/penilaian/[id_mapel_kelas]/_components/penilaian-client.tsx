'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-provider';

const TAB_INFO: Record<string, { label: string; gradient: string; activeBg: string; theadBg: string; theadBorder: string; theadText: string; subHeaderBg: string; hoverBg: string; altBg: string; focusRing: string; focusBorder: string; inputBg: string; }> = {
  formatif: {
    label: 'Formatif',
    gradient: 'from-blue-600 to-blue-700',
    activeBg: 'bg-blue-600 text-white shadow-sm',
    theadBg: 'bg-blue-50',
    theadBorder: 'border-blue-200',
    theadText: 'text-blue-700',
    subHeaderBg: 'bg-blue-50/50',
    hoverBg: 'hover:bg-blue-50/40',
    altBg: 'bg-blue-50/20',
    focusRing: 'focus:ring-blue-400',
    focusBorder: 'focus:border-blue-500',
    inputBg: 'bg-blue-50/30',
  },
  'sumatif-harian': {
    label: 'Sumatif Harian (PH)',
    gradient: 'from-emerald-600 to-emerald-700',
    activeBg: 'bg-emerald-600 text-white shadow-sm',
    theadBg: 'bg-emerald-50',
    theadBorder: 'border-emerald-200',
    theadText: 'text-emerald-700',
    subHeaderBg: 'bg-emerald-50/50',
    hoverBg: 'hover:bg-emerald-50/40',
    altBg: 'bg-emerald-50/20',
    focusRing: 'focus:ring-emerald-400',
    focusBorder: 'focus:border-emerald-500',
    inputBg: 'bg-emerald-50/30',
  },
  'sumatif-ts': {
    label: 'Sumatif Tengah Semester (TS)',
    gradient: 'from-amber-500 to-amber-600',
    activeBg: 'bg-amber-500 text-white shadow-sm',
    theadBg: 'bg-amber-50',
    theadBorder: 'border-amber-200',
    theadText: 'text-amber-700',
    subHeaderBg: 'bg-amber-50/50',
    hoverBg: 'hover:bg-amber-50/40',
    altBg: 'bg-amber-50/20',
    focusRing: 'focus:ring-amber-400',
    focusBorder: 'focus:border-amber-500',
    inputBg: 'bg-amber-50/30',
  },
  'sumatif-as': {
    label: 'Sumatif Akhir Semester (AS)',
    gradient: 'from-red-500 to-red-600',
    activeBg: 'bg-red-500 text-white shadow-sm',
    theadBg: 'bg-red-50',
    theadBorder: 'border-red-200',
    theadText: 'text-red-700',
    subHeaderBg: 'bg-red-50/50',
    hoverBg: 'hover:bg-red-50/40',
    altBg: 'bg-red-50/20',
    focusRing: 'focus:ring-red-400',
    focusBorder: 'focus:border-red-500',
    inputBg: 'bg-red-50/30',
  },
};

function buildMap(rows: any[], keyFn: (r: any) => string) {
  const m: Record<string, any> = {};
  for (const r of rows) { m[keyFn(r)] = r; }
  return m;
}

export default function PenilaianClient({ data, idMapelKelas }: { data: any; idMapelKelas: string }) {
  const { mapelKelas, siswa } = data;
  const activeDetail = data.activeDetail || 'formatif';
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  // Modal distribute per kolom: { open, idTujuan, label }
  const [distModal, setDistModal] = useState<{ open: boolean; idTujuan: number | null; label: string }>({ open: false, idTujuan: null, label: '' });
  const [distText, setDistText] = useState('');
  const [distSaving, setDistSaving] = useState(false);

  // Confirm dialog clear per kolom: { open, idTujuan, label }
  const [clearConfirm, setClearConfirm] = useState<{ open: boolean; idTujuan: number | null; label: string }>({ open: false, idTujuan: null, label: '' });
  const [clearSaving, setClearSaving] = useState(false);

  const tujuanRows: any[] = data.tujuanPembelajaran || [];
  const nilai: any[] = data.nilai || [];
  const nilaiFormatif: any[] = data.nilaiFormatif || [];
  const nilaiPH: any[] = data.nilaiPH || [];
  const nilaiAS: any[] = data.nilaiAS || [];

  const isAS = activeDetail === 'sumatif-as';
  const isTS = activeDetail === 'sumatif-ts';
  const theme = TAB_INFO[activeDetail] || TAB_INFO.formatif;

  const nilaiMap = buildMap(nilai, (r) =>
    isTS ? String(r.id_siswa) : `${r.id_siswa}_${r.id_tujuan}`
  );
  const formatifMap = buildMap(nilaiFormatif, (r) => `${r.id_siswa}_${r.id_tujuan}`);
  const phMap = buildMap(nilaiPH, (r) => `${r.id_siswa}_${r.id_tujuan}`);
  const asMap = buildMap(nilaiAS, (r) => String(r.id_siswa));

  /** Helper: bulatkan ke 2 desimal, return number — di JSX angka tidak tampilkan .00 */
  const r2 = (n: number) => Math.round(n * 100) / 100;

  /** Format nilai untuk display: "55.00" → "55", "55.50" → "55.5", "55.25" → "55.25" */
  const fmtVal = (v: any): string => {
    if (v === '' || v === null || v === undefined) return '';
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (isNaN(n)) return '';
    // Hapus trailing zero: 55.00 → "55", 55.50 → "55.5", 55.25 → "55.25"
    return String(Math.round(n * 100) / 100);
  };

  function renderNilaiInput(name: string, defaultValue: string | number, widthClass = 'w-16') {
    const isInvalid = invalidFields.has(name);
    return (
      <input
        type="text"
        inputMode="decimal"
        name={name}
        defaultValue={fmtVal(defaultValue)}
        className={`${widthClass} border-2 rounded-md px-1.5 py-1.5 text-center text-xs outline-none transition-all duration-150 ${
          isInvalid
            ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400 focus:border-red-500'
            : `border-gray-300 ${theme.inputBg} hover:border-gray-400 focus:ring-2 ${theme.focusRing} ${theme.focusBorder} focus:bg-white`
        }`}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '' || /^\d{0,3}(\.\d{0,2})?$/.test(v)) {
            if (isInvalid) {
              setInvalidFields(prev => {
                const next = new Set(prev);
                next.delete(name);
                return next;
              });
            }
            return;
          }
          e.target.value = v.slice(0, -1);
        }}
        onBlur={(e) => {
          const num = parseFloat(e.target.value);
          if (e.target.value !== '' && (isNaN(num) || num < 0 || num > 100)) {
            setInvalidFields(prev => new Set(prev).add(name));
            e.target.value = '';
          } else if (isInvalid) {
            setInvalidFields(prev => {
              const next = new Set(prev);
              next.delete(name);
              return next;
            });
          }
        }}
      />
    );
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const inputs = e.currentTarget.querySelectorAll('input[name^="nilai_"]');
    const newInvalid = new Set<string>();
    for (const input of inputs) {
      const v = (input as HTMLInputElement).value;
      if (v === '') continue;
      const num = parseFloat(v);
      if (isNaN(num) || num < 0 || num > 100) {
        newInvalid.add((input as HTMLInputElement).name);
      }
    }
    if (newInvalid.size > 0) {
      setInvalidFields(newInvalid);
      showToast('Nilai tidak valid. Perbaiki input yang ditandai merah (0-100).', 'error');
      setSaving(false);
      return;
    }
    setInvalidFields(new Set());

    const fd = new FormData(e.currentTarget);
    const entries: any[] = [];
    const fmtEntries: any[] = [];
    const phEntries: any[] = [];
    const asEntries: any[] = [];
    for (const [k, v] of fd.entries()) {
      const key = k as string;
      if (!key.startsWith('nilai_')) continue;
      const parts = key.split('_');
      const idSiswa = Number(parts[1]);
      if (isNaN(idSiswa)) continue;
      if (isAS) {
        if (key.endsWith('_fmt')) {
          const idTujuan = Number(parts[2]);
          if (!isNaN(idTujuan)) fmtEntries.push({ id_siswa: idSiswa, id_tujuan: idTujuan, nilai: v });
        } else if (key.endsWith('_ph')) {
          const idTujuan = Number(parts[2]);
          if (!isNaN(idTujuan)) phEntries.push({ id_siswa: idSiswa, id_tujuan: idTujuan, nilai: v });
        } else {
          asEntries.push({ id_siswa: idSiswa, nilai: v });
        }
      } else if (isTS) {
        entries.push({ id_siswa: idSiswa, nilai: v });
      } else {
        const idTujuan = Number(parts[2]);
        if (!isNaN(idTujuan)) entries.push({ id_siswa: idSiswa, id_tujuan: idTujuan, nilai: v });
      }
    }
    try {
      if (isAS) {
        const batches = [
          { detail: 'formatif', entries: fmtEntries },
          { detail: 'sumatif-harian', entries: phEntries },
          { detail: 'sumatif-as', entries: asEntries },
        ];
        for (const batch of batches) {
          if (batch.entries.length === 0) continue;
          const res = await fetch(`/api/guru/penilaian/${idMapelKelas}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detail: batch.detail, entries: batch.entries }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Gagal menyimpan');
          }
        }
      } else {
        const res = await fetch(`/api/guru/penilaian/${idMapelKelas}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ detail: activeDetail, entries }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Gagal menyimpan');
        }
      }
      showToast('Nilai berhasil disimpan', 'success');
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan nilai', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getN = (map: Record<string, any>, idSiswa: any, idTujuan?: number) => {
    if (idTujuan !== undefined) return map[`${idSiswa}_${idTujuan}`]?.nilai ?? '';
    return map[String(idSiswa)]?.nilai ?? '';
  };

  /** Distribute per kolom: textarea satu nilai per baris → distribusi ke tiap siswa */
  const handleDistribute = async () => {
    const { idTujuan } = distModal;
    const lines = distText.split('\n').map(l => l.trim()).filter(l => l !== '');
    if (lines.length === 0) {
      showToast('Masukkan minimal satu nilai.', 'error');
      return;
    }
    for (const line of lines) {
      const num = parseFloat(line);
      if (isNaN(num) || num < 0 || num > 100) {
        showToast(`Nilai tidak valid: "${line}" (harus 0-100).`, 'error');
        return;
      }
    }
    setDistSaving(true);
    try {
      const entries = lines.map((line, i) => {
        const base: any = { id_siswa: siswa[i]?.id_siswa, nilai: String(Math.round(parseFloat(line) * 100) / 100) };
        if (!isTS && idTujuan !== null) base.id_tujuan = idTujuan;
        return base;
      }).filter(e => e.id_siswa !== undefined);
      if (entries.length === 0) {
        showToast('Tidak ada siswa yang cocok.', 'error');
        setDistSaving(false);
        return;
      }
      const res = await fetch(`/api/guru/penilaian/${idMapelKelas}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detail: activeDetail, entries }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan');
      }
      showToast(`${entries.length} nilai berhasil didistribusikan ke ${distModal.label}`, 'success');
      setDistModal({ open: false, idTujuan: null, label: '' });
      setDistText('');
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan', 'error');
    } finally {
      setDistSaving(false);
    }
  };

  /** Clear per kolom: hapus semua nilai di kolom tertentu */
  const handleClear = async () => {
    const { idTujuan } = clearConfirm;
    setClearSaving(true);
    try {
      const entries = siswa.map((s: any) => {
        const base: any = { id_siswa: s.id_siswa, nilai: '' };
        if (!isTS && idTujuan !== null) base.id_tujuan = idTujuan;
        return base;
      });
      const res = await fetch(`/api/guru/penilaian/${idMapelKelas}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detail: activeDetail, entries }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menghapus');
      }
      showToast(`Semua nilai ${clearConfirm.label} berhasil dihapus`, 'success');
      setClearConfirm({ open: false, idTujuan: null, label: '' });
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    } finally {
      setClearSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      <div className={`bg-gradient-to-r ${theme.gradient} text-white px-6 py-4 rounded-t-xl font-semibold flex items-center gap-2.5`}>
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Tujuan Pembelajaran {mapelKelas.nama_mapel} - {mapelKelas.nama_kelas}
      </div>

      <div className={`flex flex-wrap gap-1.5 px-6 py-3.5 border-b ${theme.subHeaderBg}`}>
        {Object.entries(TAB_INFO).map(([key, info]) => (
          <a
            key={key}
            href={`/guru/penilaian/${idMapelKelas}?detail=${key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeDetail === key
                ? info.activeBg
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            {info.label}
          </a>
        ))}
      </div>

      <form onSubmit={handleSave}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-semibold text-gray-700">
              Penilaian {theme.label} {mapelKelas.nama_mapel} - {mapelKelas.nama_kelas}
            </h5>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Simpan Nilai
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                {isAS ? (
                  <>
                    <tr className={theme.theadBg}>
                      <th rowSpan={2} className={`border-b ${theme.theadBorder} px-3 py-2.5 text-center text-xs font-semibold ${theme.theadText} w-10`}>No</th>
                      <th rowSpan={2} className={`border-b ${theme.theadBorder} px-3 py-2.5 text-left text-xs font-semibold ${theme.theadText} min-w-[200px]`}>Nama Peserta Didik</th>
                      <th colSpan={tujuanRows.length} className={`border-b border-r ${theme.theadBorder} px-2 py-2 text-center text-xs font-semibold text-blue-700 bg-blue-50/60`}>Formatif</th>
                      <th colSpan={tujuanRows.length} className={`border-b border-r ${theme.theadBorder} px-2 py-2 text-center text-xs font-semibold text-emerald-700 bg-emerald-50/60`}>Sumatif (PH)</th>
                      <th rowSpan={2} className={`border-b ${theme.theadBorder} px-2 py-2 text-center text-xs font-semibold ${theme.theadText}`}>Sumatif AS</th>
                      <th rowSpan={2} className={`border-b ${theme.theadBorder} px-2 py-2 text-center text-xs font-semibold ${theme.theadText}`}>Total</th>
                      <th rowSpan={2} className={`border-b ${theme.theadBorder} px-2 py-2 text-center text-xs font-bold ${theme.theadText} ${theme.theadBg}`}>Nilai Akhir</th>
                    </tr>
                    <tr className="bg-gray-50">
                      {tujuanRows.map((tp: any, i: number) => (
                        <th key={`f_${tp.id_tujuan}`} className="border-b border-r border-gray-200 px-1 py-1.5 text-center text-xs text-gray-500 min-w-[60px]" title={tp.tujuan}>
                          F{i+1}
                        </th>
                      ))}
                      {tujuanRows.map((tp: any, i: number) => (
                        <th key={`s_${tp.id_tujuan}`} className="border-b border-r border-gray-200 px-1 py-1.5 text-center text-xs text-gray-500 min-w-[60px]" title={tp.tujuan}>
                          S{i+1}
                        </th>
                      ))}
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className={theme.theadBg}>
                      <th rowSpan={2} className={`border-b ${theme.theadBorder} px-3 py-2.5 text-center text-xs font-semibold ${theme.theadText} w-10`}>No</th>
                      <th rowSpan={2} className={`border-b ${theme.theadBorder} px-3 py-2.5 text-left text-xs font-semibold ${theme.theadText} min-w-[200px]`}>Nama Peserta Didik</th>
                      {!isTS && tujuanRows.map((tp: any, i: number) => (
                        <th key={tp.id_tujuan} className={`border-b border-r ${theme.theadBorder} px-2 py-2.5 text-center text-xs font-semibold ${theme.theadText} min-w-[70px]`} title={tp.tujuan}>
                          {activeDetail === 'formatif' ? 'F' : 'PH'} {i+1}
                        </th>
                      ))}
                      {isTS && (
                        <th className={`border-b ${theme.theadBorder} px-3 py-2.5 text-center text-xs font-semibold ${theme.theadText} min-w-[100px]`}>Nilai</th>
                      )}
                      {!isAS && !isTS && (
                        <>
                          <th rowSpan={2} className={`border-b ${theme.theadBorder} px-3 py-2.5 text-center text-xs font-semibold ${theme.theadText}`}>Jumlah</th>
                          <th rowSpan={2} className={`border-b border-r ${theme.theadBorder} px-3 py-2.5 text-center text-xs font-semibold ${theme.theadText}`}>Rata-rata</th>
                        </>
                      )}
                    </tr>
                    {!isAS && (
                      <tr className={activeDetail === 'formatif' ? 'bg-blue-50/30' : activeDetail === 'sumatif-harian' ? 'bg-emerald-50/30' : 'bg-amber-50/30'}>
                        {isTS ? (
                          <th className="border-b border-r border-gray-200 px-1 py-1">
                            <div className="flex items-center justify-center gap-0.5">
                              <button
                                type="button"
                                title="Isi semua nilai Nilai"
                                onClick={() => setDistModal({ open: true, idTujuan: null, label: 'Nilai' })}
                                className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                title="Kosongkan semua nilai Nilai"
                                onClick={() => setClearConfirm({ open: true, idTujuan: null, label: 'Nilai' })}
                                className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </th>
                        ) : tujuanRows.map((tp: any, i: number) => {
                          const prefix = activeDetail === 'formatif' ? 'F' : 'PH';
                          return (
                            <th key={`act_${tp.id_tujuan}`} className="border-b border-r border-gray-200 px-1 py-1">
                              <div className="flex items-center justify-center gap-0.5">
                                <button
                                  type="button"
                                  title={`Isi semua nilai ${prefix}${i+1}`}
                                  onClick={() => setDistModal({ open: true, idTujuan: tp.id_tujuan, label: `${prefix}${i+1}` })}
                                  className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  title={`Kosongkan semua nilai ${prefix}${i+1}`}
                                  onClick={() => setClearConfirm({ open: true, idTujuan: tp.id_tujuan, label: `${prefix}${i+1}` })}
                                  className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    )}
                  </>
                )}
              </thead>
              <tbody>
                {siswa.length === 0 ? (
                  <tr><td colSpan={99} className="text-center py-10 text-gray-400 text-sm">Tidak ada siswa</td></tr>
                ) : (
                  siswa.map((sis: any, idx: number) => {
                    const avgF = (() => {
                      let t = 0, c = 0;
                      for (const tp of tujuanRows) {
                        const v = parseFloat(getN(formatifMap, sis.id_siswa, tp.id_tujuan));
                        if (!isNaN(v)) { t += v; c++; }
                      }
                      return c > 0 ? r2(t / c) : 0;
                    })();
                    const avgPH = (() => {
                      let t = 0, c = 0;
                      for (const tp of tujuanRows) {
                        const v = parseFloat(getN(phMap, sis.id_siswa, tp.id_tujuan));
                        if (!isNaN(v)) { t += v; c++; }
                      }
                      return c > 0 ? r2(t / c) : 0;
                    })();
                    const vAS = parseFloat(getN(asMap, sis.id_siswa));
                    const totalRata = (() => {
                      const f = avgF;
                      const p = avgPH;
                      const a = isNaN(vAS) ? 0 : vAS;
                      return r2(f + p + a);
                    })();
                    const nilaiAkhir = !isNaN(vAS)
                      ? r2((avgF + avgPH + vAS) / 3)
                      : '---';

                    if (isAS) {
                      return (
                        <tr key={sis.id_siswa_kelas} className={`${idx % 2 === 0 ? 'bg-white' : theme.altBg} ${theme.hoverBg} transition-colors`}>
                          <td className="border-b border-r border-gray-200 px-3 py-2 text-center text-xs text-gray-500">{idx + 1}</td>
                          <td className="border-b border-r border-gray-200 px-3 py-2 text-xs font-medium text-gray-700">{sis.nama_siswa}</td>
                          {tujuanRows.map((tp: any) => (
                            <td key={`fmt_${tp.id_tujuan}`} className="border-b border-r border-gray-200 px-1 py-1.5 text-center">
                              {renderNilaiInput(`nilai_${sis.id_siswa}_${tp.id_tujuan}_fmt`, getN(formatifMap, sis.id_siswa, tp.id_tujuan))}
                            </td>
                          ))}
                          {tujuanRows.map((tp: any) => (
                            <td key={`ph_${tp.id_tujuan}`} className="border-b border-r border-gray-200 px-1 py-1.5 text-center">
                              {renderNilaiInput(`nilai_${sis.id_siswa}_${tp.id_tujuan}_ph`, getN(phMap, sis.id_siswa, tp.id_tujuan))}
                            </td>
                          ))}
                          <td className="border-b border-r border-gray-200 px-2 py-1.5 text-center">
                            {renderNilaiInput(`nilai_${sis.id_siswa}_as`, isNaN(vAS) ? '' : vAS)}
                          </td>
                          <td className="border-b border-r border-gray-200 px-2 py-2 text-center text-xs font-medium text-gray-600">{totalRata}</td>
                          <td className={`border-b border-gray-200 px-2 py-2 text-center text-xs font-bold ${theme.theadText} ${theme.altBg}`}>{nilaiAkhir}</td>
                        </tr>
                      );
                    }

                    if (isTS) {
                      return (
                        <tr key={sis.id_siswa_kelas} className={`${idx % 2 === 0 ? 'bg-white' : theme.altBg} ${theme.hoverBg} transition-colors`}>
                          <td className="border-b border-gray-200 px-3 py-2 text-center text-xs text-gray-500">{idx + 1}</td>
                          <td className="border-b border-gray-200 px-3 py-2 text-xs font-medium text-gray-700">{sis.nama_siswa}</td>
                          <td className="border-b border-gray-200 px-3 py-1.5 text-center">
                            {renderNilaiInput(`nilai_${sis.id_siswa}`, getN(nilaiMap, sis.id_siswa), 'w-24')}
                          </td>
                        </tr>
                      );
                    }

                    let sumT = 0, cntT = 0;
                    for (const tp of tujuanRows) {
                      const v = parseFloat(getN(nilaiMap, sis.id_siswa, tp.id_tujuan));
                      if (!isNaN(v)) { sumT += v; cntT++; }
                    }

                    return (
                      <tr key={sis.id_siswa_kelas} className={`${idx % 2 === 0 ? 'bg-white' : theme.altBg} ${theme.hoverBg} transition-colors`}>
                        <td className="border-b border-r border-gray-200 px-3 py-2 text-center text-xs text-gray-500">{idx + 1}</td>
                        <td className="border-b border-r border-gray-200 px-3 py-2 text-xs font-medium text-gray-700">{sis.nama_siswa}</td>
                        {tujuanRows.map((tp: any) => (
                          <td key={tp.id_tujuan} className="border-b border-r border-gray-200 px-1 py-1.5 text-center">
                            {renderNilaiInput(`nilai_${sis.id_siswa}_${tp.id_tujuan}`, getN(nilaiMap, sis.id_siswa, tp.id_tujuan))}
                          </td>
                        ))}
                        <td className="border-b border-r border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">
                          {cntT > 0 ? r2(sumT) : '---'}
                        </td>
                        <td className="border-b border-r border-gray-200 px-3 py-2 text-center text-xs text-gray-500">
                          {cntT > 0 ? r2(sumT / cntT) : '---'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </form>

      {/* Modal Distribute Nilai per Kolom */}
      {distModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { if (!distSaving) { setDistModal({ open: false, idTujuan: null, label: '' }); setDistText(''); } }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Isi Nilai {distModal.label}</h3>
              <p className="text-xs text-gray-500 mt-1">Masukkan satu nilai per baris. Baris ke-1 = siswa ke-1, baris ke-2 = siswa ke-2, dst.</p>
            </div>
            <div className="px-6 py-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nilai (satu per baris, 0–100)</label>
              <textarea
                autoFocus
                rows={6}
                value={distText}
                onChange={(e) => setDistText(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none font-mono"
                placeholder={"80\n80\n75\n90\n..."}
              />
              <p className="text-[11px] text-gray-400 mt-1">{distText.split('\n').filter(l => l.trim() !== '').length} nilai terisi dari {siswa.length} siswa</p>
            </div>
            <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                disabled={distSaving}
                onClick={() => { setDistModal({ open: false, idTujuan: null, label: '' }); setDistText(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={distSaving || distText.trim() === ''}
                onClick={handleDistribute}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {distSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Clear Nilai per Kolom */}
      {clearConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { if (!clearSaving) setClearConfirm({ open: false, idTujuan: null, label: '' }); }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Kosongkan Nilai {clearConfirm.label}</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                Yakin ingin menghapus <strong>semua nilai {clearConfirm.label}</strong> untuk semua siswa?
              </p>
              <p className="text-xs text-gray-400 mt-2">{siswa.length} siswa akan terpengaruh.</p>
            </div>
            <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                disabled={clearSaving}
                onClick={() => setClearConfirm({ open: false, idTujuan: null, label: '' })}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={clearSaving}
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {clearSaving ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
