'use client';

import { useState, useMemo, useCallback } from 'react';
import type { SekolahInfo } from '@/lib/actions/rapor-actions';

interface Props {
  refKelas: any[];
  siswaKelas: any[];
  sekolahInfo: SekolahInfo | null;
  tahun: number;
  semester: number;
  tahunPelajaran: string;
  semesterLabel: string;
}

type JenisRapor = 'pelengkap' | 'tengah_semester' | 'semester' | 'p5bk' | 'buku_induk';

const JENIS_CONFIG: { key: JenisRapor; label: string; color: string; hoverColor: string }[] = [
  { key: 'pelengkap', label: 'Pelengkap Rapor', color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
  { key: 'tengah_semester', label: 'Tengah Semester', color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600' },
  { key: 'semester', label: 'Semester', color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
  { key: 'p5bk', label: 'P5BK', color: 'bg-red-500', hoverColor: 'hover:bg-red-600' },
  { key: 'buku_induk', label: 'Buku Induk', color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600' },
];

const CHECKBOX_JENIS: JenisRapor[] = ['tengah_semester', 'semester', 'p5bk'];

export default function DaftarRaporClient({
  refKelas,
  siswaKelas,
  tahun,
  semester,
}: Props) {
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selected, setSelected] = useState<Record<JenisRapor, Set<number>>>({
    pelengkap: new Set(),
    tengah_semester: new Set(),
    semester: new Set(),
    p5bk: new Set(),
    buku_induk: new Set(),
  });
  const [loading, setLoading] = useState<string | null>(null);

  const filteredSiswa = useMemo(() => {
    if (!selectedKelas) return [];
    return siswaKelas.filter((sk) => sk.id_kelas === Number(selectedKelas));
  }, [siswaKelas, selectedKelas]);

  const kelasName = selectedKelas
    ? refKelas.find((k) => k.id_kelas === Number(selectedKelas))?.nama_kelas || ''
    : '';

  const toggleAll = useCallback((jenis: JenisRapor) => {
    setSelected((prev) => {
      const current = prev[jenis];
      const allIds = new Set(filteredSiswa.map((sk) => sk.id_siswa));
      const newSet = current.size === allIds.size ? new Set<number>() : new Set(allIds);
      return { ...prev, [jenis]: newSet };
    });
  }, [filteredSiswa]);

  const toggleOne = useCallback((jenis: JenisRapor, idSiswa: number) => {
    setSelected((prev) => {
      const current = new Set(prev[jenis]);
      if (current.has(idSiswa)) {
        current.delete(idSiswa);
      } else {
        current.add(idSiswa);
      }
      return { ...prev, [jenis]: current };
    });
  }, []);

  const isAllChecked = (jenis: JenisRapor) =>
    filteredSiswa.length > 0 && filteredSiswa.every((sk) => selected[jenis].has(sk.id_siswa));

  const isIndeterminate = (jenis: JenisRapor) => {
    const s = selected[jenis];
    return s.size > 0 && s.size < filteredSiswa.length;
  };

  const getFilename = (jenis: JenisRapor, idSiswa?: number) => {
    const label = JENIS_CONFIG.find((c) => c.key === jenis)?.label.replace(/\s+/g, '_') || jenis;
    if (idSiswa) {
      const siswa = filteredSiswa.find((s) => s.id_siswa === idSiswa);
      const nama = siswa?.nama_siswa?.replace(/\s+/g, '_') || idSiswa;
      return `${nama}_${kelasName}_${label}.pdf`;
    }
    return `Rapor_${kelasName}_${label}.pdf`;
  };

  const downloadPdf = async (jenis: JenisRapor, idSiswa?: number) => {
    const ids = idSiswa ? [idSiswa] : Array.from(selected[jenis]);
    if (ids.length === 0) return;
    const key = idSiswa ? `${jenis}-${idSiswa}` : `batch-${jenis}`;
    setLoading(key);
    try {
      const res = await fetch('/api/tu/cetak-rapor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_siswa_list: ids, jenis, tahun, semester }),
      });
      if (!res.ok) throw new Error('Gagal mencetak');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getFilename(jenis, idSiswa);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Gagal mencetak rapor. Silakan coba lagi.');
    } finally {
      setLoading(null);
    }
  };

  const handleCetakSingle = (jenis: JenisRapor, idSiswa: number) => downloadPdf(jenis, idSiswa);

  const handleCetakBatch = async (jenis: JenisRapor) => {
    await downloadPdf(jenis);
    setSelected((prev) => ({ ...prev, [jenis]: new Set() }));
  };

  const hasAnyBatch = CHECKBOX_JENIS.some((j) => selected[j].size > 0);

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Daftar Rapor</h4>

      <div className="mb-5">
        <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
          Pilih Kelas
        </label>
        <select
          value={selectedKelas}
          onChange={(e) => setSelectedKelas(e.target.value)}
          className="w-full max-w-xs bg-white border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 transition-all premium-shadow"
        >
          <option value="">-- Pilih Kelas --</option>
          {refKelas.map((k: any) => (
            <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
          ))}
        </select>
      </div>

      {!selectedKelas ? (
        <div className="text-center py-16">
          <p className="text-[#6B7280]">Pilih kelas untuk melihat daftar rapor.</p>
        </div>
      ) : filteredSiswa.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#6B7280]">Belum ada siswa di kelas {kelasName}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] overflow-hidden">
          <div className="bg-blue-600 text-white px-5 py-3 rounded-t-xl flex items-center justify-between">
            <h5 className="font-semibold text-sm">Daftar Rapor {kelasName}</h5>
            <span className="text-xs text-blue-100">{filteredSiswa.length} siswa</span>
          </div>

          {hasAnyBatch && (
            <div className="bg-blue-50 border-b border-blue-100 px-5 py-2.5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-blue-700">Cetak Batch:</span>
              {CHECKBOX_JENIS.map((j) => {
                const cfg = JENIS_CONFIG.find((c) => c.key === j)!;
                const count = selected[j].size;
                if (count === 0) return null;
                return (
                  <button
                    key={j}
                    onClick={() => handleCetakBatch(j)}
                    disabled={loading === `batch-${j}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium text-white ${cfg.color} ${cfg.hoverColor} rounded-lg px-3 py-1.5 transition-all disabled:opacity-50`}
                  >
                    {loading === `batch-${j}` ? (
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    )}
                    {cfg.label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-center px-3 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider w-10">No</th>
                  <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Nama Peserta Didik</th>
                  <th className="text-center px-3 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider text-green-700">Pelengkap Rapor</th>
                  <th className="text-center px-3 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-amber-700">Tengah Semester</span>
                      <input
                        type="checkbox"
                        checked={isAllChecked('tengah_semester')}
                        ref={(el) => { if (el) el.indeterminate = isIndeterminate('tengah_semester'); }}
                        onChange={() => toggleAll('tengah_semester')}
                        className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                      />
                    </div>
                  </th>
                  <th className="text-center px-3 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-blue-700">Semester</span>
                      <input
                        type="checkbox"
                        checked={isAllChecked('semester')}
                        ref={(el) => { if (el) el.indeterminate = isIndeterminate('semester'); }}
                        onChange={() => toggleAll('semester')}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                    </div>
                  </th>
                  <th className="text-center px-3 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-red-700">P5BK</span>
                      <input
                        type="checkbox"
                        checked={isAllChecked('p5bk')}
                        ref={(el) => { if (el) el.indeterminate = isIndeterminate('p5bk'); }}
                        onChange={() => toggleAll('p5bk')}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                      />
                    </div>
                  </th>
                  <th className="text-center px-3 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider text-amber-700">Buku Induk</th>
                </tr>
              </thead>
              <tbody>
                {filteredSiswa.map((sk: any, idx: number) => (
                  <tr key={sk.id_siswa_kelas} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                    <td className="text-center px-3 py-2.5 text-[#6B7280] text-xs">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-[#1A1A2E] text-sm">{sk.nama_siswa}</td>
                    <td className="text-center px-3 py-2.5">
                      <button
                        onClick={() => handleCetakSingle('pelengkap', sk.id_siswa)}
                        disabled={loading === `pelengkap-${sk.id_siswa}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50 active:scale-[0.97]"
                      >
                        {loading === `pelengkap-${sk.id_siswa}` ? (
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : null}
                        Pelengkap Rapor
                      </button>
                    </td>
                    <td className="text-center px-3 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected.tengah_semester.has(sk.id_siswa)}
                          onChange={() => toggleOne('tengah_semester', sk.id_siswa)}
                          className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        />
                        <button
                          onClick={() => handleCetakSingle('tengah_semester', sk.id_siswa)}
                          disabled={loading === `tengah_semester-${sk.id_siswa}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50 active:scale-[0.97]"
                        >
                          {loading === `tengah_semester-${sk.id_siswa}` ? (
                            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : null}
                          Tengah Semester
                        </button>
                      </div>
                    </td>
                    <td className="text-center px-3 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected.semester.has(sk.id_siswa)}
                          onChange={() => toggleOne('semester', sk.id_siswa)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <button
                          onClick={() => handleCetakSingle('semester', sk.id_siswa)}
                          disabled={loading === `semester-${sk.id_siswa}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50 active:scale-[0.97]"
                        >
                          {loading === `semester-${sk.id_siswa}` ? (
                            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : null}
                          Semester
                        </button>
                      </div>
                    </td>
                    <td className="text-center px-3 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected.p5bk.has(sk.id_siswa)}
                          onChange={() => toggleOne('p5bk', sk.id_siswa)}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                        />
                        <button
                          onClick={() => handleCetakSingle('p5bk', sk.id_siswa)}
                          disabled={loading === `p5bk-${sk.id_siswa}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50 active:scale-[0.97]"
                        >
                          {loading === `p5bk-${sk.id_siswa}` ? (
                            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : null}
                          P5BK
                        </button>
                      </div>
                    </td>
                    <td className="text-center px-3 py-2.5">
                      <button
                        onClick={() => handleCetakSingle('buku_induk', sk.id_siswa)}
                        disabled={loading === `buku_induk-${sk.id_siswa}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50 active:scale-[0.97]"
                      >
                        {loading === `buku_induk-${sk.id_siswa}` ? (
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : null}
                        Buku Induk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
