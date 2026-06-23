'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { updateP5BK, deleteP5BK } from '@/lib/actions/p5bk-actions';
import ModalP5BK from './modal-p5bk';
import ModalHapus from './modal-hapus-p5bk';

const COLUMNS = [
  { key: 'id_proyek_kelas', label: 'ID' },
  { key: 'kode', label: 'Kode' },
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
}

export default function P5BKClient({ data, refKelas, refTema, refUser }: P5BKClientProps) {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const filtered = data.filter((row) =>
    COLUMNS.filter((c) => c.key !== '_aksi').some((col) =>
      String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const actualPerPage = perPage === 0 ? filtered.length : perPage;
  const totalPages = Math.max(1, Math.ceil(filtered.length / actualPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedData = filtered.slice(safePage * actualPerPage, (safePage + 1) * actualPerPage);

  const [modalEdit, setModalEdit] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const openTambah = () => { setSelected(null); setModalEdit(true); };
  const openEdit = (row: any) => { setSelected(row); setModalEdit(true); };
  const openHapus = (row: any) => { setSelected(row); setModalHapus(true); };
  const closeModals = () => { setModalEdit(false); setModalHapus(false); setSelected(null); };

  const handleSave = async (formData: FormData) => {
    const result = await updateP5BK(formData);
    if (result.success) {
      showToast('Data P5BK berhasil disimpan!', 'success');
      closeModals();
    } else {
      showToast(result.error || 'Gagal menyimpan data!', 'error');
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
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg flex items-center justify-between">
          <h5 className="font-semibold">Daftar P5BK</h5>
          <button onClick={openTambah} className="bg-white text-blue-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50 transition">
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
              className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Tampil:</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0); }}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
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
                <tr className="bg-gray-50 border-b">
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="text-left px-4 py-3 font-medium text-gray-600">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="text-center py-8 text-gray-400">Tidak ada data</td>
                  </tr>
                ) : (
                  paginatedData.map((row) => (
                    <tr key={row.id_proyek_kelas} className="border-b hover:bg-gray-50 transition">
                      {COLUMNS.map((col) => {
                        if (col.key === '_aksi') {
                          return (
                            <td key={col.key} className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => openEdit(row)} className="text-blue-600 hover:text-blue-800 transition" title="Edit">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button onClick={() => openHapus(row)} className="text-red-500 hover:text-red-700 transition" title="Hapus">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
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
          <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
            <span>Total: {filtered.length} data</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(0)} disabled={safePage === 0} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&laquo;</button>
                <button onClick={() => setPage(safePage - 1)} disabled={safePage === 0} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&lsaquo;</button>
                <span className="px-3 text-gray-600">{safePage + 1} / {totalPages}</span>
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
        onSave={handleSave}
      />

      <ModalHapus
        open={modalHapus}
        onClose={closeModals}
        p5bk={selected}
        onConfirm={handleDelete}
      />
    </>
  );
}
