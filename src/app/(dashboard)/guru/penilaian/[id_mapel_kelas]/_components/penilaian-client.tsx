'use client';

import { useState } from 'react';

const TAB_INFO: Record<string, { label: string; color: string }> = {
  formatif: { label: 'Formatif', color: 'bg-green-600 hover:bg-green-700' },
  'sumatif-harian': { label: 'Sumatif Harian (PH)', color: 'bg-blue-600 hover:bg-blue-700' },
  'sumatif-ts': { label: 'Sumatif Tengah Semester (TS)', color: 'bg-red-600 hover:bg-red-700' },
  'sumatif-as': { label: 'Sumatif Akhir Semester (AS)', color: 'bg-yellow-600 hover:bg-yellow-600' },
};

function buildMap(rows: any[], keyFn: (r: any) => string) {
  const m: Record<string, any> = {};
  for (const r of rows) { m[keyFn(r)] = r; }
  return m;
}

export default function PenilaianClient({ data, idMapelKelas }: { data: any; idMapelKelas: string }) {
  const { mapelKelas, siswa } = data;
  const activeDetail = data.activeDetail || 'formatif';
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const tujuanRows: any[] = data.tujuanPembelajaran || [];
  const nilai: any[] = data.nilai || [];
  const nilaiFormatif: any[] = data.nilaiFormatif || [];
  const nilaiPH: any[] = data.nilaiPH || [];
  const nilaiAS: any[] = data.nilaiAS || [];

  const isAS = activeDetail === 'sumatif-as';
  const isTS = activeDetail === 'sumatif-ts';

  const nilaiMap = buildMap(nilai, (r) => `${r.id_siswa}_${r.id_tujuan}`);
  const formatifMap = buildMap(nilaiFormatif, (r) => `${r.id_siswa}_${r.id_tujuan}`);
  const phMap = buildMap(nilaiPH, (r) => `${r.id_siswa}_${r.id_tujuan}`);
  const asMap = buildMap(nilaiAS, (r) => String(r.id_siswa));

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    const fd = new FormData(e.currentTarget);
    const entries: any[] = [];
    const fmtEntries: any[] = [];
    const phEntries: any[] = [];
    const asEntries: any[] = [];
    for (const [k, v] of fd.entries()) {
      const key = k as string;
      if (!key.startsWith('nilai_')) continue;
      const parts = key.split('_');
      if (isAS) {
        if (key.endsWith('_fmt')) {
          fmtEntries.push({ idSiswa: Number(parts[1]), idTujuan: Number(parts[2]), nilai: v });
        } else if (key.endsWith('_ph')) {
          phEntries.push({ idSiswa: Number(parts[1]), idTujuan: Number(parts[2]), nilai: v });
        } else {
          asEntries.push({ idSiswa: Number(parts[1]), nilai: v });
        }
      } else if (isTS) {
        entries.push({ idSiswa: Number(parts[1]), nilai: v });
      } else {
        entries.push({ idSiswa: Number(parts[1]), idTujuan: Number(parts[2]), nilai: v });
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
      setSuccess('Nilai berhasil disimpan');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getN = (map: Record<string, any>, idSiswa: any, idTujuan?: number) => {
    if (idTujuan !== undefined) return map[`${idSiswa}_${idTujuan}`]?.nilai ?? '';
    return map[String(idSiswa)]?.nilai ?? '';
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
        Tujuan Pembelajaran {mapelKelas.nama_mapel} — {mapelKelas.nama_kelas}
      </div>

      <div className="flex flex-wrap gap-2 px-5 py-4 border-b bg-gray-50">
        {Object.entries(TAB_INFO).map(([key, info]) => (
          <a
            key={key}
            href={`/guru/penilaian/${idMapelKelas}?detail=${key}`}
            className={`px-4 py-2 rounded text-sm font-medium text-white transition ${activeDetail === key ? info.color : 'bg-gray-400 hover:bg-gray-500'}`}
          >
            {info.label}
          </a>
        ))}
      </div>

      <form onSubmit={handleSave}>
        <div className="p-5">
          {success && <div className="mb-4 bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 text-sm">{success}</div>}
          {error && <div className="mb-4 bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm">{error}</div>}

          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-semibold">
              Penilaian {TAB_INFO[activeDetail]?.label} {mapelKelas.nama_mapel} — {mapelKelas.nama_kelas}
            </h5>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
            >
              {saving ? 'Menyimpan...' : 'Simpan Nilai'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                {isAS ? (
                  <>
                    <tr className="bg-yellow-100">
                      <th rowSpan={2} className="border px-3 py-2 text-center text-xs w-10">No</th>
                      <th rowSpan={2} className="border px-3 py-2 text-left min-w-[200px] text-xs">Nama Peserta Didik</th>
                      <th colSpan={tujuanRows.length} className="border px-2 py-2 text-center text-xs">Formatif</th>
                      <th colSpan={tujuanRows.length} className="border px-2 py-2 text-center text-xs">Sumatif (PH)</th>
                      <th rowSpan={2} className="border px-2 py-2 text-center text-xs">Sumatif AS</th>
                      <th rowSpan={2} className="border px-2 py-2 text-center text-xs">Total</th>
                      <th rowSpan={2} className="border px-2 py-2 text-center text-xs font-semibold">Nilai Akhir</th>
                    </tr>
                    <tr className="bg-yellow-100">
                      {tujuanRows.map((tp: any, i: number) => (
                        <th key={`f_${tp.id_tujuan}`} className="border px-1 py-1 text-center text-xs min-w-[60px]" title={tp.tujuan}>
                          F{i+1}
                        </th>
                      ))}
                      {tujuanRows.map((tp: any, i: number) => (
                        <th key={`s_${tp.id_tujuan}`} className="border px-1 py-1 text-center text-xs min-w-[60px]" title={tp.tujuan}>
                          S{i+1}
                        </th>
                      ))}
                    </tr>
                  </>
                ) : (
                  <tr className="bg-yellow-100">
                    <th className="border px-3 py-2 text-center text-xs w-10">No</th>
                    <th className="border px-3 py-2 text-left min-w-[200px] text-xs">Nama Peserta Didik</th>
                    {!isTS && tujuanRows.map((tp: any, i: number) => (
                      <th key={tp.id_tujuan} className="border px-2 py-2 text-center min-w-[70px] text-xs" title={tp.tujuan}>
                        {activeDetail === 'formatif' ? 'F' : activeDetail === 'sumatif-harian' ? 'PH' : ''} {i + 1}
                      </th>
                    ))}
                    {!isAS && !isTS && (
                      <>
                        <th className="border px-3 py-2 text-center text-xs">Jumlah</th>
                        <th className="border px-3 py-2 text-center text-xs">Rata-rata</th>
                      </>
                    )}
                  </tr>
                )}
              </thead>
              <tbody>
                {siswa.length === 0 ? (
                  <tr><td colSpan={99} className="text-center py-8 text-gray-400 text-sm">Tidak ada siswa</td></tr>
                ) : (
                  siswa.map((sis: any, idx: number) => {
                    const avgF = (() => {
                      let t = 0, c = 0;
                      for (const tp of tujuanRows) {
                        const v = parseFloat(getN(formatifMap, sis.id_siswa, tp.id_tujuan));
                        if (!isNaN(v)) { t += v; c++; }
                      }
                      return c > 0 ? (t / c).toFixed(2) : '0.00';
                    })();
                    const avgPH = (() => {
                      let t = 0, c = 0;
                      for (const tp of tujuanRows) {
                        const v = parseFloat(getN(phMap, sis.id_siswa, tp.id_tujuan));
                        if (!isNaN(v)) { t += v; c++; }
                      }
                      return c > 0 ? (t / c).toFixed(2) : '0.00';
                    })();
                    const vAS = parseFloat(getN(asMap, sis.id_siswa));
                    const totalRaw = (() => {
                      let s = 0;
                      for (const tp of tujuanRows) {
                        const vf = parseFloat(getN(formatifMap, sis.id_siswa, tp.id_tujuan));
                        if (!isNaN(vf)) s += vf;
                        const vp = parseFloat(getN(phMap, sis.id_siswa, tp.id_tujuan));
                        if (!isNaN(vp)) s += vp;
                      }
                      return s + (isNaN(vAS) ? 0 : vAS);
                    })();
                    const nilaiAkhir = !isNaN(vAS)
                      ? (parseFloat(String(avgF)) * 0.35 + parseFloat(String(avgPH)) * 0.35 + vAS * 0.30).toFixed(2)
                      : '—';

                    if (isAS) {
                      return (
                        <tr key={sis.id_siswa_kelas} className="border-b hover:bg-gray-50">
                          <td className="border px-3 py-2 text-center text-xs">{idx + 1}</td>
                          <td className="border px-3 py-2 text-xs">{sis.nama_siswa}</td>
                          {tujuanRows.map((tp: any) => (
                            <td key={`fmt_${tp.id_tujuan}`} className="border px-1 py-1 text-center">
                              <input type="text" inputMode="numeric"
                                name={`nilai_${sis.id_siswa}_${tp.id_tujuan}_fmt`}
                                defaultValue={getN(formatifMap, sis.id_siswa, tp.id_tujuan)}
                                className="w-14 border border-gray-300 rounded px-1 py-1 text-center text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>
                          ))}
                          {tujuanRows.map((tp: any) => (
                            <td key={`ph_${tp.id_tujuan}`} className="border px-1 py-1 text-center">
                              <input type="text" inputMode="numeric"
                                name={`nilai_${sis.id_siswa}_${tp.id_tujuan}_ph`}
                                defaultValue={getN(phMap, sis.id_siswa, tp.id_tujuan)}
                                className="w-14 border border-gray-300 rounded px-1 py-1 text-center text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>
                          ))}
                          <td className="border px-2 py-2 text-center">
                            <input type="text" inputMode="numeric"
                              name={`nilai_${sis.id_siswa}_as`}
                              defaultValue={isNaN(vAS) ? '' : vAS}
                              className="w-14 border border-gray-300 rounded px-1 py-1 text-center text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </td>
                          <td className="border px-2 py-2 text-center text-xs font-medium">{totalRaw}</td>
                          <td className="border px-2 py-2 text-center text-xs font-semibold">{nilaiAkhir}</td>
                        </tr>
                      );
                    }

                    if (isTS) {
                      return (
                        <tr key={sis.id_siswa_kelas} className="border-b hover:bg-gray-50">
                          <td className="border px-3 py-2 text-center text-xs">{idx + 1}</td>
                          <td className="border px-3 py-2 text-xs">{sis.nama_siswa}</td>
                          <td className="border px-3 py-2 text-center">
                            <input type="text" inputMode="numeric"
                              name={`nilai_${sis.id_siswa}`}
                              defaultValue={getN(nilaiMap, sis.id_siswa)}
                              className="w-20 border border-gray-300 rounded px-3 py-1 text-center text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            />
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
                      <tr key={sis.id_siswa_kelas} className="border-b hover:bg-gray-50">
                        <td className="border px-3 py-2 text-center text-xs">{idx + 1}</td>
                        <td className="border px-3 py-2 text-xs">{sis.nama_siswa}</td>
                        {tujuanRows.map((tp: any) => {
                          const val = getN(nilaiMap, sis.id_siswa, tp.id_tujuan);
                          return (
                            <td key={tp.id_tujuan} className="border px-1 py-1 text-center">
                              <input type="text" inputMode="numeric"
                                name={`nilai_${sis.id_siswa}_${tp.id_tujuan}`}
                                defaultValue={val}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-center text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>
                          );
                        })}
                        <td className="border px-3 py-2 text-center text-xs font-medium">
                          {cntT > 0 ? sumT.toFixed(2) : '—'}
                        </td>
                        <td className="border px-3 py-2 text-center text-xs">
                          {cntT > 0 ? (sumT / cntT).toFixed(2) : '—'}
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
    </div>
  );
}
