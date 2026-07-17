'use client';

import { useState } from 'react';
import Select from 'react-select';
import { useToast } from '@/components/ui/toast-provider';
import { updateMapelKelas, deleteMapelKelas, copyMapelKelasFromPreviousYear, copyMapelKelasFromSameYear } from '@/lib/actions/mapel-kelas-actions';
import { confirmAlert } from '@/lib/swal';
import ModalMapelKelas from './modal-mapel-kelas';
import ModalHapus from './modal-hapus-mapel-kelas';

const COLUMNS = [
  { key: '_no', label: 'NO' },
  { key: 'nama_kelas', label: 'Kelas' },
  { key: 'nama_mapel', label: 'Mata Pelajaran' },
  { key: 'nama_guru', label: 'Guru Pengampu' },
  { key: '_aksi', label: 'Aksi' },
];

interface MapelKelasClientProps {
  data: any[];
  refKelas: any[];
  refMapel: any[];
  refUser: any[];
}

export default function MapelKelasClient({ data, refKelas, refMapel, refUser }: MapelKelasClientProps) {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const byKelas = kelasFilter
    ? data.filter((row) => row.id_kelas === +kelasFilter)
    : data;

  const filtered = byKelas.filter((row) =>
    COLUMNS.filter((c) => c.key !== '_aksi').some((col) =>
      String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const actualPerPage = perPage === 0 ? filtered.length : perPage;
  const totalPages = Math.max(1, Math.ceil(filtered.length / actualPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedData = filtered.slice(safePage * actualPerPage, (safePage + 1) * actualPerPage);

  const guruOptions = refUser.map((u: any) => ({ value: u.id_user, label: u.nama }));

  const excludedMapelIds = kelasFilter
    ? data.filter(row => row.id_kelas === +kelasFilter).map(row => row.id_mapel)
    : [];

  const [modalEdit, setModalEdit] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [copying, setCopying] = useState(false);
  const [copyingSameYear, setCopyingSameYear] = useState(false);
  const [copyResults, setCopyResults] = useState<any[] | null>(null);

  const openTambah = () => { setSelected(null); setModalEdit(true); };
  const openEdit = (row: any) => { setSelected(row); setModalEdit(true); };
  const openHapus = (row: any) => { setSelected(row); setModalHapus(true); };
  const closeModals = () => { setModalEdit(false); setModalHapus(false); setSelected(null); };

  const handleSave = async (formData: FormData) => {
    const idKelas = formData.get('id_kelas') as string;
    const idUser = formData.get('id_user') as string || '';
    const mapelIds = formData.getAll('id_mapel') as string[];

    if (mapelIds.length === 0) {
      showToast('Pilih minimal satu mapel!', 'error');
      return;
    }

    let successCount = 0, errorCount = 0, lastError = '';

    for (const idMapel of mapelIds) {
      const fd = new FormData();
      fd.set('id_kelas', idKelas);
      fd.set('id_mapel', idMapel);
      fd.set('id_user', idUser);
      const result = await updateMapelKelas(fd);
      if (result.success) successCount++;
      else { errorCount++; lastError = result.error || 'Gagal'; }
    }

    if (successCount > 0) {
      showToast(`${successCount} mapel berhasil ditambahkan!${errorCount > 0 ? ` ${errorCount} gagal` : ''}`, 'success');
      closeModals();
    } else {
      showToast(lastError || 'Gagal menambahkan mapel!', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteMapelKelas(selected.id_mapel_kelas);
    if (result.success) {
      showToast('Data mapel kelas berhasil dihapus!', 'success');
      closeModals();
    } else {
      showToast(result.error || 'Gagal menghapus data!', 'error');
    }
  };

  const handleCopyPrevious = async () => {
    const jumlahMapel = data.length;

    const ok = await confirmAlert(
      'Salin Mapel dari Tahun Lalu?',
      `Data ${jumlahMapel} mapel kelas akan disalin ke tahun pelajaran baru.\n\nMapel yang sudah ada di tahun baru akan dilewati.\nLanjutkan?`
    );
    if (!ok) return;

    setCopying(true);
    const result = await copyMapelKelasFromPreviousYear();
    setCopying(false);

    if (result.success) {
      setCopyResults(result.hasil);
      showToast(`${result.totalDisalin} mapel berhasil disalin!${result.totalSkip > 0 ? ` (${result.totalSkip} sudah ada)` : ''}`, 'success');
    } else {
      showToast(result.error || 'Gagal menyalin mapel!', 'error');
    }
  };

  const handleCopySameYear = async () => {
    const jumlahMapel = data.length;

    const ok = await confirmAlert(
      'Salin dari Semester 1?',
      `Salin ${jumlahMapel} mapel kelas dari semester 1 ke semester 2 tahun ini.\n\nMapel yang sudah ada di semester 2 akan dilewati.\nLanjutkan?`
    );
    if (!ok) return;

    setCopyingSameYear(true);
    const result = await copyMapelKelasFromSameYear();
    setCopyingSameYear(false);

    if (result.success) {
      setCopyResults(result.hasil);
      showToast(`${result.totalDisalin} mapel berhasil disalin dari semester 1!${result.totalSkip > 0 ? ` (${result.totalSkip} sudah ada)` : ''}`, 'success');
    } else {
      showToast(result.error || 'Gagal menyalin mapel!', 'error');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between"><h3 className="font-semibold text-[#1A1A2E]">Daftar Mapel Kelas</h3>
          <button onClick={openTambah} className="bg-[#DC2626] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] transition-all">
            + Tambah Mapel Kelas
          </button>
        </div>
        <div className="p-4">

          {/* Panel Salin */}
          {!copyResults && (
            <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h6 className="font-semibold text-emerald-800">Salin Mapel</h6>
                  <p className="text-sm text-emerald-600 mt-0.5">
                    Salin mata pelajaran beserta guru pengampu dari semester 1 atau tahun sebelumnya.
                    Mapel yang sudah ada akan dilewati.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleCopySameYear}
                    disabled={copyingSameYear}
                    className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {copyingSameYear ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Menyalin...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Dari Semester 1
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCopyPrevious}
                    disabled={copying}
                    className="bg-white border border-emerald-300 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-50 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {copying ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Menyalin...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Dari Tahun Lalu
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Hasil Salin */}
          {copyResults && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={(e) => { if (e.target === e.currentTarget) setCopyResults(null); }}>
              <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-2xl mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)] max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
                  <h3 className="text-lg font-semibold text-[#1A1A2E]">
                    Hasil Salin Mapel Kelas
                  </h3>
                  <button onClick={() => setCopyResults(null)} className="text-gray-400 hover:text-gray-600 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto px-6 py-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(0,0,0,0.04)]">
                        <th className="text-left px-3 py-2 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Kelas</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Total Mapel</th>
                        <th className="text-center px-3 py-2 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Disalin</th>
                        <th className="text-center px-3 py-2 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Sudah Ada</th>
                        <th className="text-left px-3 py-2 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {copyResults.map((r, i) => (
                        <tr key={i} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                          <td className="px-3 py-2.5 font-medium">{r.kelas}</td>
                          <td className="px-3 py-2.5">{r.mapel}</td>
                          <td className="px-3 py-2.5 text-center text-emerald-600 font-medium">{r.disalin}</td>
                          <td className="px-3 py-2.5 text-center text-yellow-600 font-medium">{r.skip}</td>
                          <td className="px-3 py-2.5">
                            <span className="text-emerald-600 text-xs font-medium">{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
                  <button onClick={() => setCopyResults(null)}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] transition-all">
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Cari data..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full md:w-64 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
            />
            <select
              value={kelasFilter}
              onChange={(e) => { setKelasFilter(e.target.value); setPage(0); }}
              className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
            >
              <option value="">Semua Kelas</option>
              {refKelas.map((k: any) => (
                <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <span>Tampil:</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0); }}
                className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>All</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.04)]">
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="text-center py-16 text-[#6B7280]">Tidak ada data</td>
                  </tr>
                ) : (
                  paginatedData.map((row, i) => (
                    <tr key={row.id_mapel_kelas} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      {COLUMNS.map((col) => {
                        if (col.key === '_aksi') {
                          return (
                            <td key={col.key} className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => openEdit(row)} className="text-[#DC2626]/70 hover:text-[#DC2626] transition-colors" title="Edit">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button onClick={() => openHapus(row)} className="text-[#DC2626]/70 hover:text-[#DC2626] transition-colors" title="Hapus">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          );
                        }
                        if (col.key === '_no') {
                          return <td key={col.key} className="px-4 py-3">{safePage * actualPerPage + i + 1}</td>;
                        }
                        if (col.key === 'nama_guru') {
                          const val = guruOptions.find(o => o.value === row.id_user) || null;
                          return (
                            <td key={col.key} className="px-4 py-3 min-w-40">
                              <Select
                                options={guruOptions}
                                value={val}
                                onChange={(opt: any) => {
                                  const fd = new FormData();
                                  fd.set('id_mapel_kelas', String(row.id_mapel_kelas));
                                  fd.set('id_kelas', String(row.id_kelas));
                                  fd.set('id_mapel', String(row.id_mapel));
                                  fd.set('id_user', opt?.value || '');
                                  updateMapelKelas(fd).then(r => {
                                    if (r.success) showToast('Guru berhasil diupdate!', 'success');
                                    else showToast(r.error || 'Gagal mengupdate guru!', 'error');
                                  });
                                }}
                                placeholder="Cari guru..."
                                isClearable
                                noOptionsMessage={() => 'Guru tidak ditemukan'}
                                styles={{
                                  control: (base: any) => ({ ...base, minHeight: '28px', fontSize: '0.875rem' }),
                                  menu: (base: any) => ({ ...base, zIndex: 9999 }),
                                  option: (base: any) => ({ ...base, fontSize: '0.875rem' }),
                                }}
                              />
                            </td>
                          );
                        }
                        return <td key={col.key} className="px-4 py-3">{row[col.key] ?? '-'}</td>;
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280]">
            <span>Total: {filtered.length} data</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(0)} disabled={safePage === 0} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&laquo;</button>
                <button onClick={() => setPage(safePage - 1)} disabled={safePage === 0} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&lsaquo;</button>
                <span className="px-3 text-[#1A1A2E]/80">{safePage + 1} / {totalPages}</span>
                <button onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages - 1} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&rsaquo;</button>
                <button onClick={() => setPage(totalPages - 1)} disabled={safePage >= totalPages - 1} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&raquo;</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalMapelKelas
        open={modalEdit}
        onClose={closeModals}
        mapelKelas={selected}
        refKelas={refKelas}
        refMapel={refMapel}
        onSave={handleSave}
        kelasFilter={kelasFilter}
        excludedMapelIds={excludedMapelIds}
      />

      <ModalHapus
        open={modalHapus}
        onClose={closeModals}
        mapelKelas={selected}
        onConfirm={handleDelete}
      />
    </>
  );
}
