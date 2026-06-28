'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { updateP5BK, deleteP5BK, getSubelemenByProyek, getDataNilaiP5BK, saveNilaiP5BK } from '@/lib/actions/p5bk-actions';
import ModalP5BK from './modal-p5bk';
import ModalHapus from './modal-hapus-p5bk';
import ModalNilaiP5BK from './modal-nilai-p5bk';

const COLUMNS = [
  { key: '_no', label: 'No' },
  { key: 'nama_kelas', label: 'Kelas' },
  { key: 'tema', label: 'Tema' },
  { key: 'judul_proyek', label: 'Judul Proyek' },
  { key: 'nama_user', label: 'Pengguna' },
  { key: '_aksi', label: 'Aksi' },
];

interface P5BKClientProps {
  data: any[];
  refKelas: any[];
  refTema: any[];
  refUser: any[];
  dimensiTree: any[];
}

export default function P5BKClient({ data, refKelas, refTema, refUser, dimensiTree }: P5BKClientProps) {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const filtered = data.filter((row) =>
    COLUMNS.filter((c) => c.key !== '_aksi' && c.key !== '_no').some((col) =>
      String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const actualPerPage = perPage === 0 ? filtered.length : perPage;
  const totalPages = Math.max(1, Math.ceil(filtered.length / actualPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedData = filtered.slice(safePage * actualPerPage, (safePage + 1) * actualPerPage);

  const [modalEdit, setModalEdit] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [modalNilai, setModalNilai] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [selectedSubElemen, setSelectedSubElemen] = useState<number[]>([]);
  const [loadingSubElemen, setLoadingSubElemen] = useState(false);
  const [nilaiData, setNilaiData] = useState<any | null>(null);
  const [loadingNilai, setLoadingNilai] = useState(false);

  const openTambah = () => { setSelected(null); setSelectedSubElemen([]); setModalEdit(true); };
  const openEdit = async (row: any) => {
    setSelected(row);
    setSelectedSubElemen([]);
    setLoadingSubElemen(true);
    setModalEdit(true);
    const result = await getSubelemenByProyek(row.id_proyek_kelas);
    if (result.success) {
      setSelectedSubElemen(result.data);
    }
    setLoadingSubElemen(false);
  };
  const openHapus = (row: any) => { setSelected(row); setModalHapus(true); };
  const openNilai = async (row: any) => {
    setSelected(row);
    setNilaiData(null);
    setLoadingNilai(true);
    setModalNilai(true);
    const result = await getDataNilaiP5BK(row.id_proyek_kelas);
    if (result.success) {
      setNilaiData({ ...result.data, _debug: result.debug });
    } else {
      showToast(result.error || 'Gagal mengambil data nilai', 'error');
      setModalNilai(false);
    }
    setLoadingNilai(false);
  };
  const closeModals = () => {
    setModalEdit(false);
    setModalHapus(false);
    setModalNilai(false);
    setSelected(null);
    setSelectedSubElemen([]);
    setNilaiData(null);
  };

  const handleSave = async (formData: FormData) => {
    formData.set('sub_elemen_ids', JSON.stringify(selectedSubElemen));
    const result = await updateP5BK(formData);
    if (result.success) {
      showToast('Data P5BK berhasil disimpan!', 'success');
      closeModals();
    } else {
      showToast(result.error || 'Gagal menyimpan data!', 'error');
    }
  };

  const handleSaveNilai = async (formData: FormData) => {
    const result = await saveNilaiP5BK(formData);
    if (result.success) {
      showToast('Nilai P5BK berhasil disimpan!', 'success');
      closeModals();
    } else {
      showToast(result.error || 'Gagal menyimpan nilai!', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteP5BK(selected.id_proyek_kelas);
    if (result.success) {
      showToast('Data P5BK berhasil dihapus!', 'success');
      closeModals();
    } else {
      showToast(result.error || 'Gagal menghapus data!', 'error');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between"><h3 className="font-semibold text-[#1A1A2E]">Daftar P5BK</h3>
          <button onClick={openTambah} className="bg-[#DC2626] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] transition-all">
            + Tambah P5BK
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Cari data..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full md:w-64 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
            />
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
                  paginatedData.map((row, idx) => (
                    <tr key={row.id_proyek_kelas} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      {COLUMNS.map((col) => {
                        if (col.key === '_no') {
                          return <td key={`${row.id_proyek_kelas}-${col.key}`} className="px-4 py-3">{safePage * actualPerPage + idx + 1}</td>;
                        }
                        if (col.key === '_aksi') {
                          return (
                            <td key={`${row.id_proyek_kelas}-${col.key}`} className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => openEdit(row)} className="text-[#DC2626]/70 hover:text-[#DC2626] transition-colors" title="Edit">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button onClick={() => openNilai(row)} className="text-blue-600/70 hover:text-blue-600 transition-colors" title="Nilai">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                        return <td key={`${row.id_proyek_kelas}-${col.key}`} className="px-4 py-3">{row[col.key] ?? '-'}</td>;
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

      <ModalP5BK
        open={modalEdit}
        onClose={closeModals}
        p5bk={selected}
        refKelas={refKelas}
        refTema={refTema}
        refUser={refUser}
        dimensiTree={dimensiTree}
        selectedSubElemen={selectedSubElemen}
        setSelectedSubElemen={setSelectedSubElemen}
        loadingSubElemen={loadingSubElemen}
        onSave={handleSave}
      />

      <ModalHapus
        open={modalHapus}
        onClose={closeModals}
        p5bk={selected}
        onConfirm={handleDelete}
      />

      <ModalNilaiP5BK
        open={modalNilai}
        onClose={closeModals}
        p5bk={selected}
        loadingData={loadingNilai}
        nilaiData={nilaiData}
        onSave={handleSaveNilai}
      />
    </>
  );
}
