'use client';

import { useState } from 'react';
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
    kelasList: { id_kelas: number; nama_kelas: string; id_mapel_kelas: number }[];
    tp: any[];
  } | null;
}

export default function TPMultiKelasClient({ options, selectedMapel, selectedTingkat, selectedData }: Props) {
  const { showToast } = useToast();
  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [modalCopy, setModalCopy] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [addKode, setAddKode] = useState('');
  const [addTujuan, setAddTujuan] = useState('');
  const [addKelas, setAddKelas] = useState<Record<number, boolean>>({});

  const [editKode, setEditKode] = useState('');
  const [editTujuanVal, setEditTujuanVal] = useState('');
  const [editKktp, setEditKktp] = useState('70');

  const [copySource, setCopySource] = useState<any[]>([]);
  const [copyChecked, setCopyChecked] = useState<Record<string, boolean>>({});
  const [copyKelas, setCopyKelas] = useState<Record<number, boolean>>({});
  const [loadingCopy, setLoadingCopy] = useState(false);

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) { window.location.href = '/guru/tujuan-pembelajaran'; return; }
    const [idMapel, idTingkat] = val.split(',');
    window.location.href = `/guru/tujuan-pembelajaran?id_mapel=${idMapel}&id_tingkat=${idTingkat}`;
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
    setEditKktp(String(row.kktp || 70));
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
    fd.set('kktp', '70');
    const result = await addTujuanMulti(fd);
    if (result.success) { setModalAdd(false); showToast('TP berhasil ditambahkan', 'success'); setTimeout(() => window.location.reload(), 800); }
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
    if (result.success) { setModalEdit(false); showToast('TP berhasil diperbarui', 'success'); setTimeout(() => window.location.reload(), 800); }
    else { setError(result.error || 'Gagal mengupdate TP'); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selected || !selectedData) return;
    setLoading(true);
    const result = await deleteTujuanByKode(selected.kode, selectedData.mapel.id_mapel);
    if (result.success) { setModalHapus(false); showToast('TP berhasil dihapus', 'success'); setTimeout(() => window.location.reload(), 800); }
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
    if (result.success) { setModalCopy(false); showToast('TP berhasil disalin', 'success'); setTimeout(() => window.location.reload(), 800); }
    else { setError(result.error || 'Gagal copy TP'); }
    setLoading(false);
  };

  return (
    <div>
      <h4 className="text-xl font-semibold mb-4">Tujuan Pembelajaran</h4>

      <div className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Mapel & Tingkat</label>
          <select
            value={currentValue}
            onChange={handleDropdownChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">-- Pilih --</option>
            {options.map((opt) => (
              <option key={`${opt.id_mapel}-${opt.id_tingkat}`} value={`${opt.id_mapel},${opt.id_tingkat}`}>
                {opt.nama_mapel} (Kelas {opt.tabjad}) — {opt.kelas_list}
              </option>
            ))}
          </select>
        </div>
        {selectedData && (
          <div className="flex gap-2">
            <button onClick={openCopy} className="bg-white text-blue-700 border-2 border-blue-500 hover:bg-blue-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copy Tujuan Pembelajaran
            </button>
            <button onClick={openAdd} className="bg-white text-green-700 border-2 border-green-600 hover:bg-green-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Buat Tujuan Pembelajaran
            </button>
          </div>
        )}
      </div>

      {selectedData ? (
        <>
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg flex items-center justify-between">
              <div>
                <span className="font-semibold">{selectedData.mapel.nama_mapel}</span>
                <div className="text-xs text-blue-200 mt-0.5">
                  {selectedData.kelasList.map((k, i) => (
                    <span key={k.id_kelas}>{i > 0 && ' | '}{k.nama_kelas}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                     <tr className="bg-orange-100 border-b text-orange-800">
                      <th className="text-left px-3 py-2.5 font-semibold w-10">No</th>
                      <th className="text-left px-3 py-2.5 font-semibold w-16">Kode</th>
                      <th className="text-left px-3 py-2.5 font-semibold w-20">Kelas</th>
                      <th className="text-left px-3 py-2.5 font-semibold">Deskripsi</th>
                      <th className="text-center px-3 py-2.5 font-semibold w-20">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.tp.length === 0 ? (
                       <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">
                          Belum ada tujuan pembelajaran.
                        </td>
                      </tr>
                    ) : (
                      selectedData.tp.map((t: any, i: number) => (
                         <tr key={t.kode || t.urut} className="border-b hover:bg-orange-50">
                          <td className="px-3 py-3 align-top">{i + 1}</td>
                          <td className="px-3 py-3 align-top">
                            <span className="text-xs font-medium">{getDisplayKode(t.kode)}</span>
                          </td>
                          <td className="px-3 py-3 align-top">
                            {t.kelas?.map((k: any, ki: number) => (
                              <span key={k.id_kelas}>
                                {ki > 0 && <span className="mx-1 text-gray-300">|</span>}
                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{k.nama_kelas}</span>
                              </span>
                            ))}
                          </td>
                          <td className="px-3 py-3 align-top max-w-xs">
                            <p className="text-xs line-clamp-2">{t.tujuan}</p>
                          </td>
                          <td className="px-3 py-3 align-top text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => openEdit(t)} className="text-blue-600 hover:text-blue-800 transition" title="Edit">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button onClick={() => openHapus(t)} className="text-red-500 hover:text-red-700 transition" title="Hapus">
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
            </div>
          </div>

          {/* Modal Add */}
          {modalAdd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setModalAdd(false); }}>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Buat Tujuan Pembelajaran</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
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
                <div className="px-6 py-4 border-t flex justify-end gap-3">
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setModalEdit(false); }}>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Edit Tujuan Pembelajaran — {getDisplayKode(selected.kode)}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Kelas: {selected.kelas?.map((k: any) => k.nama_kelas).join(', ')}
                  </p>
                </div>
                 <div className="px-6 py-4 space-y-4">
                  {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded p-3 text-sm">{error}</div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Pembelajaran</label>
                    <textarea value={editTujuanVal} onChange={(e) => setEditTujuanVal(e.target.value)} rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="px-6 py-4 border-t flex justify-end gap-3">
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setModalHapus(false); }}>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Hapus Tujuan Pembelajaran</h3>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus TP <strong>{getDisplayKode(selected.kode)}</strong>?</p>
                  <p className="text-sm text-gray-600 mt-1">Ini akan menghapus dari semua kelas: {selected.kelas?.map((k: any) => k.nama_kelas).join(', ')}</p>
                  <p className="text-sm text-gray-800 mt-2 font-medium line-clamp-2">"{selected.tujuan}"</p>
                </div>
                <div className="px-6 py-4 border-t flex justify-end gap-3">
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setModalCopy(false); }}>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Copy Tujuan Pembelajaran</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Dari semester/tahun sebelumnya</p>
                </div>
                <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
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
                <div className="px-6 py-4 border-t flex justify-end gap-3">
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
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-5 py-12 text-center text-gray-400">
            Pilih mata pelajaran dan tingkat di atas untuk menampilkan Tujuan Pembelajaran.
          </div>
        </div>
      )}
    </div>
  );
}
