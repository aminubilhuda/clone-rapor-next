'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-provider';
import {
  addTujuanMulti,
  updateTujuanMulti,
  deleteTujuanByKode,
  getKodeNext,
  getTpFromPreviousYear,
  copyTujuan,
} from '@/lib/actions/tp-actions';

interface Option {
  id_mapel: number;
  nama_mapel: string;
  id_tingkat: number;
  tingkat: number;
  tabjad: string;
  kelas_list: string;
}

interface Props {
  options: Option[];
  selectedMapel: number | null;
  selectedTingkat: number | null;
  selectedData: {
    mapel: { id_mapel: number; nama_mapel: string };
    kelasList: { id_kelas: number; nama_kelas: string }[];
    tp: any[];
  } | null;
}

function KktpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">KKTP (Kriteria Ketuntasan Tahap Pengetahuan)</label>
      <input type="number" min={0} max={100} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
    </div>
  );
}

export default function TPMultiKelasClient({ options, selectedMapel, selectedTingkat, selectedData }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isNavigating, startNavigation] = useTransition();
  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [modalCopy, setModalCopy] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [addKode, setAddKode] = useState('');
  const [addTujuan, setAddTujuan] = useState('');
  const [addKktp, setAddKktp] = useState('80');
  const [addKelas, setAddKelas] = useState<Record<number, boolean>>({});

  const [editKode, setEditKode] = useState('');
  const [editTujuanVal, setEditTujuanVal] = useState('');
  const [editKktp, setEditKktp] = useState('80');

  const [copySource, setCopySource] = useState<any[]>([]);
  const [copyChecked, setCopyChecked] = useState<Record<string, boolean>>({});
  const [copyKelas, setCopyKelas] = useState<Record<number, boolean>>({});
  const [loadingCopy, setLoadingCopy] = useState(false);

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      startNavigation(() => {
        router.replace('/guru/tujuan-pembelajaran', { scroll: false });
      });
      return;
    }
    const [idMapel, idTingkat] = val.split(',');
    startNavigation(() => {
      router.replace(
        `/guru/tujuan-pembelajaran?id_mapel=${idMapel}&id_tingkat=${idTingkat}`,
        { scroll: false }
      );
    });
  };

  const currentValue = selectedMapel && selectedTingkat ? `${selectedMapel},${selectedTingkat}` : '';

  const getDisplayKode = (kode: string) => {
    if (!kode) return '-';
    const parts = kode.split('-');
    return parts[parts.length - 1];
  };

  const openAdd = async () => {
    if (!selectedData) return;
    setAddTujuan('');
    setAddKktp('80');
    setAddKelas(Object.fromEntries(selectedData.kelasList.map(k => [k.id_kelas, true])));
    setError('');
    const result = await getKodeNext(selectedData.mapel.id_mapel);
    if (result.success) {
      setAddKode((result as any).kode);
    } else {
      setAddKode('');
      setError((result as any).error || 'Gagal generate kode');
    }
    setModalAdd(true);
  };

  const openEdit = (row: any) => {
    setSelected(row);
    setEditKode(row.kode);
    setEditTujuanVal(row.tujuan);
    setEditKktp(String(row.kktp || 80));
    setError('');
    setModalEdit(true);
  };

  const openHapus = (row: any) => {
    setSelected(row);
    setModalHapus(true);
  };

  const openCopy = async () => {
    if (!selectedData) return;
    setError('');
    setLoadingCopy(true);
    setCopyChecked({});
    setCopyKelas(Object.fromEntries(selectedData.kelasList.map(k => [k.id_kelas, true])));
    const result = await getTpFromPreviousYear(selectedData.mapel.id_mapel);
    if (result.success) {
      setCopySource((result as any).tp || []);
    } else {
      setCopySource([]);
      setError((result as any).error || 'Gagal memuat data');
    }
    setLoadingCopy(false);
    setModalCopy(true);
  };

  const handleAdd = async () => {
    if (!selectedData || !addTujuan.trim()) { setError('Tujuan wajib diisi'); return; }
    const selectedKelas = Object.entries(addKelas).filter(([, v]) => v).map(([k]) => Number(k));
    if (!selectedKelas.length) { setError('Pilih minimal satu kelas'); return; }
    if (!addKode.trim()) { setError('Kode TP gagal digenerate, coba lagi'); return; }
    setLoading(true); setError('');
    const fd = new FormData();
    fd.set('id_mapel', String(selectedData.mapel.id_mapel));
    fd.set('kelas_ids', JSON.stringify(selectedKelas));
    fd.set('kode', addKode);
    fd.set('tujuan', addTujuan);
    fd.set('kktp', addKktp);
    const result = await addTujuanMulti(fd);
    if (result.success) { setModalAdd(false); showToast('TP berhasil ditambahkan', 'success'); router.refresh(); }
    else { setError(result.error || 'Gagal menambah TP'); }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!selected || !editTujuanVal.trim()) { setError('Tujuan wajib diisi'); return; }
    setLoading(true); setError('');
    const fd = new FormData();
    fd.set('kode', selected.kode);
    fd.set('urut', selected.urut);
    fd.set('id_mapel', String(selectedData!.mapel.id_mapel));
    fd.set('tujuan', editTujuanVal);
    fd.set('kktp', editKktp);
    const result = await updateTujuanMulti(fd);
    if (result.success) { setModalEdit(false); showToast('TP berhasil diperbarui', 'success'); router.refresh(); }
    else { setError(result.error || 'Gagal mengupdate TP'); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selected || !selectedData) return;
    setLoading(true);
    const result = await deleteTujuanByKode(selected.kode, selectedData.mapel.id_mapel);
    if (result.success) { setModalHapus(false); showToast('TP berhasil dihapus', 'success'); router.refresh(); }
    else { setError(result.error || 'Gagal menghapus TP'); setModalHapus(false); }
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!selectedData) return;
    const selectedKodes = Object.entries(copyChecked).filter(([, v]) => v).map(([k]) => k);
    const selectedKelas = Object.entries(copyKelas).filter(([, v]) => v).map(([k]) => Number(k));
    if (!selectedKodes.length) { setError('Pilih minimal satu TP'); return; }
    if (!selectedKelas.length) { setError('Pilih minimal satu kelas'); return; }
    setLoading(true); setError('');
    const fd = new FormData();
    fd.set('id_mapel', String(selectedData.mapel.id_mapel));
    fd.set('kodes', JSON.stringify(selectedKodes));
    fd.set('kelas_ids', JSON.stringify(selectedKelas));
    const result = await copyTujuan(fd);
    if (result.success) { setModalCopy(false); showToast('TP berhasil disalin', 'success'); router.refresh(); }
    else { setError(result.error || 'Gagal copy TP'); }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xl font-semibold text-[#1A1A2E]">Tujuan Pembelajaran</h4>
        <p className="mt-1 text-sm text-gray-500">Pilih mata pelajaran untuk mengelola tujuan pembelajaran setiap kelas.</p>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Mata Pelajaran & Tingkat</label>
          <select
            value={currentValue}
            onChange={handleDropdownChange}
            disabled={isNavigating}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-wait disabled:bg-gray-50"
          >
            <option value="">-- Pilih mata pelajaran --</option>
            {options.map((opt) => (
              <option key={`${opt.id_mapel}-${opt.id_tingkat}`} value={`${opt.id_mapel},${opt.id_tingkat}`}>
                {opt.nama_mapel} (Kelas {opt.tabjad}) — {opt.kelas_list}
              </option>
            ))}
          </select>
        </div>
        {selectedData && (
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button onClick={openCopy} className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Salin TP
            </button>
            <button onClick={openAdd} className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Buat TP
            </button>
          </div>
        )}
      </div>

      {selectedData ? (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <span className="font-semibold text-[#1A1A2E]">{selectedData.mapel.nama_mapel}</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selectedData.kelasList.map((k) => (
                    <span key={k.id_kelas} className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{k.nama_kelas}</span>
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">{selectedData.tp.length} tujuan</span>
            </div>
            <div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                     <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-600">
                      <th className="w-14 px-4 py-3 text-left font-semibold">No</th>
                      <th className="w-20 px-3 py-3 text-left font-semibold">Kode</th>
                       <th className="w-28 px-3 py-3 text-left font-semibold">Kelas</th>
                       <th className="px-3 py-3 text-left font-semibold">Deskripsi</th>
                       <th className="w-20 px-3 py-3 text-center font-semibold">KKTP</th>
                       <th className="w-24 px-4 py-3 text-center font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.tp.length === 0 ? (
                       <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          Belum ada tujuan pembelajaran.
                        </td>
                      </tr>
                    ) : (
                      selectedData.tp.map((t: any, i: number) => (
                         <tr key={t.kode || t.urut} className="border-b border-gray-100 transition last:border-b-0 hover:bg-blue-50/30">
                          <td className="px-4 py-4 align-top text-gray-500">{i + 1}</td>
                          <td className="px-3 py-4 align-top">
                            <span className="text-xs font-semibold text-gray-800">{getDisplayKode(t.kode)}</span>
                          </td>
                          <td className="px-3 py-4 align-top">
                            <div className="flex flex-wrap gap-1">
                            {t.kelas?.map((k: any) => (
                              <span key={k.id_kelas} className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{k.nama_kelas}</span>
                            ))}
                            </div>
                          </td>
                           <td className="px-3 py-4 align-top">
                             <p className="max-w-2xl text-sm leading-5 text-gray-700">{t.tujuan}</p>
                           </td>
                           <td className="px-3 py-4 text-center align-top">
                             <span className="inline-flex min-w-9 justify-center rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{t.kktp ?? '-'}</span>
                           </td>
                           <td className="px-4 py-3 text-center align-top">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => openEdit(t)} className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-100 hover:text-blue-800" title="Edit" aria-label={`Edit TP ${getDisplayKode(t.kode)}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button onClick={() => openHapus(t)} className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700" title="Hapus" aria-label={`Hapus TP ${getDisplayKode(t.kode)}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-gray-100 md:hidden">
                {selectedData.tp.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-gray-400">Belum ada tujuan pembelajaran.</div>
                ) : (
                  selectedData.tp.map((t: any, i: number) => (
                    <article key={t.kode || t.urut} className="px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-7 w-7 flex-none items-center justify-center rounded bg-gray-100 text-xs font-semibold text-gray-600">{i + 1}</span>
                          <div>
                            <p className="text-xs text-gray-500">Kode TP</p>
                            <p className="text-sm font-semibold text-gray-800">{getDisplayKode(t.kode)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">KKTP</p>
                          <span className="inline-flex min-w-9 justify-center rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{t.kktp ?? '-'}</span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-700">{t.tujuan}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {t.kelas?.map((k: any) => (
                          <span key={k.id_kelas} className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{k.nama_kelas}</span>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                        <button onClick={() => openEdit(t)} className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          Edit
                        </button>
                        <button onClick={() => openHapus(t)} className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Hapus
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Modal Add */}
          {modalAdd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setModalAdd(false); }}>
              <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl">
                <div className="border-b px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold">Buat Tujuan Pembelajaran</h3>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                  {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded p-3 text-sm">{error}</div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No TP (otomatis)</label>
                    <input type="text" value={getDisplayKode(addKode)} disabled
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Pembelajaran</label>
                    <textarea value={addTujuan} onChange={(e) => setAddTujuan(e.target.value)} rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Tuliskan tujuan pembelajaran..." />
                  </div>
                  <KktpInput value={addKktp} onChange={setAddKktp} />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Kelas</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setAddKelas(Object.fromEntries(selectedData!.kelasList.map(k => [k.id_kelas, true])))} className="text-xs text-blue-600 hover:underline">Pilih Semua</button>
                        <button type="button" onClick={() => setAddKelas(Object.fromEntries(selectedData!.kelasList.map(k => [k.id_kelas, false])))} className="text-xs text-gray-500 hover:underline">Hapus Semua</button>
                      </div>
                    </div>
                    <div className="space-y-1.5 border border-gray-200 rounded-lg p-3">
                      {selectedData!.kelasList.map((k) => (
                        <label key={k.id_kelas} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" checked={!!addKelas[k.id_kelas]}
                            onChange={(e) => setAddKelas(prev => ({ ...prev, [k.id_kelas]: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          {k.nama_kelas}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t px-4 py-4 sm:px-6">
                  <button onClick={() => setModalAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Batal</button>
                  <button onClick={handleAdd} disabled={loading} className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Edit */}
          {modalEdit && selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setModalEdit(false); }}>
              <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
                <div className="border-b px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold">Edit Tujuan Pembelajaran — {getDisplayKode(selected.kode)}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Kelas: {selected.kelas?.map((k: any) => k.nama_kelas).join(', ')}
                  </p>
                </div>
                 <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                  {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded p-3 text-sm">{error}</div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Pembelajaran</label>
                    <textarea value={editTujuanVal} onChange={(e) => setEditTujuanVal(e.target.value)} rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <KktpInput value={editKktp} onChange={setEditKktp} />
                </div>
                <div className="flex justify-end gap-3 border-t px-4 py-4 sm:px-6">
                  <button onClick={() => setModalEdit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Batal</button>
                  <button onClick={handleEdit} disabled={loading} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Hapus */}
          {modalHapus && selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setModalHapus(false); }}>
              <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
                <div className="border-b px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold">Hapus Tujuan Pembelajaran</h3>
                </div>
                <div className="px-4 py-4 sm:px-6">
                  <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus TP <strong>{getDisplayKode(selected.kode)}</strong>?</p>
                  <p className="text-sm text-gray-600 mt-1">Ini akan menghapus dari semua kelas: {selected.kelas?.map((k: any) => k.nama_kelas).join(', ')}</p>
                  <p className="text-sm text-gray-800 mt-2 font-medium line-clamp-2">"{selected.tujuan}"</p>
                </div>
                <div className="flex justify-end gap-3 border-t px-4 py-4 sm:px-6">
                  <button onClick={() => setModalHapus(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Batal</button>
                  <button onClick={handleDelete} disabled={loading} className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50">
                    {loading ? 'Menghapus...' : 'Hapus'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Copy */}
          {modalCopy && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setModalCopy(false); }}>
              <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
                <div className="border-b px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold">Copy Tujuan Pembelajaran</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Dari semester/tahun sebelumnya</p>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                  {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded p-3 text-sm">{error}</div>}
                  {loadingCopy ? (
                    <div className="text-center py-8 text-gray-400">Memuat data...</div>
                  ) : copySource.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">Tidak ada TP dari tahun sebelumnya.</div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Pilih TP yang akan di-copy</label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setCopyChecked(Object.fromEntries(copySource.map(t => [t.kode, true])))} className="text-xs text-blue-600 hover:underline">Pilih Semua</button>
                            <button type="button" onClick={() => setCopyChecked(Object.fromEntries(copySource.map(t => [t.kode, false])))} className="text-xs text-gray-500 hover:underline">Hapus Semua</button>
                          </div>
                        </div>
                        <div className="space-y-1.5 border border-gray-200 rounded-lg p-3">
                          {copySource.map((t: any) => (
                            <label key={t.kode} className="flex items-start gap-2 cursor-pointer text-sm">
                              <input type="checkbox" checked={!!copyChecked[t.kode]}
                                onChange={(e) => setCopyChecked(prev => ({ ...prev, [t.kode]: e.target.checked }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5" />
                              <div>
                                <span className="font-medium text-gray-800">{getDisplayKode(t.kode)}</span>
                                <span className="text-gray-500 ml-2 text-xs">({t.kelas_list})</span>
                                <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{t.tujuan}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Copy ke Kelas</label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setCopyKelas(Object.fromEntries(selectedData!.kelasList.map(k => [k.id_kelas, true])))} className="text-xs text-blue-600 hover:underline">Pilih Semua</button>
                            <button type="button" onClick={() => setCopyKelas(Object.fromEntries(selectedData!.kelasList.map(k => [k.id_kelas, false])))} className="text-xs text-gray-500 hover:underline">Hapus Semua</button>
                          </div>
                        </div>
                        <div className="space-y-1.5 border border-gray-200 rounded-lg p-3">
                          {selectedData!.kelasList.map((k) => (
                            <label key={k.id_kelas} className="flex items-center gap-2 cursor-pointer text-sm">
                              <input type="checkbox" checked={!!copyKelas[k.id_kelas]}
                                onChange={(e) => setCopyKelas(prev => ({ ...prev, [k.id_kelas]: e.target.checked }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                              {k.nama_kelas}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-3 border-t px-4 py-4 sm:px-6">
                  <button onClick={() => setModalCopy(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Batal</button>
                  <button onClick={handleCopy} disabled={loading || loadingCopy || copySource.length === 0}
                    className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50">
                    {loading ? 'Menyalin...' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-gray-700">Belum ada mata pelajaran yang dipilih</p>
          <p className="mt-1 text-sm text-gray-500">Pilih mata pelajaran dan tingkat untuk melihat daftar tujuan pembelajaran.</p>
        </div>
      )}
    </div>
  );
}
