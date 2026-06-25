'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import ModalTransferAnggotaKelas from './modal-transfer-anggota-kelas';

const COLUMNS = [
  { key: '_no', label: 'No.' },
  { key: 'nama_kelas', label: 'Kelas' },
  { key: 'jumlah_anggota', label: 'Jumlah Anggota' },
  { key: '_aksi', label: 'Aksi' },
];

interface AnggotaKelasClientProps {
  data: any[];
  refSiswa: any[];
  anggotaKelas: any[];
}

export default function AnggotaKelasClient({ data, refSiswa, anggotaKelas }: AnggotaKelasClientProps) {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [modalTransfer, setModalTransfer] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const filtered = data.filter((row) =>
    String(row.nama_kelas ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const actualPerPage = perPage === 0 ? filtered.length : perPage;
  const totalPages = Math.max(1, Math.ceil(filtered.length / actualPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedData = filtered.slice(safePage * actualPerPage, (safePage + 1) * actualPerPage);

  const openAnggota = (row: any) => {
    setSelected(row);
    setModalTransfer(true);
  };
  const closeModals = () => { setModalTransfer(false); setSelected(null); };

  return (
    <>
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Daftar Anggota Kelas</h3>
        </div>
        <div className="p-4">
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Cari kelas..."
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
                  paginatedData.map((row, i) => (
                    <tr key={row.id_kelas} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      {COLUMNS.map((col) => {
                        if (col.key === '_no') {
                          return <td key={col.key} className="px-4 py-3">{safePage * actualPerPage + i + 1}</td>;
                        }
                        if (col.key === '_aksi') {
                          return (
                            <td key={col.key} className="px-4 py-3">
                              <button onClick={() => openAnggota(row)} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#DC2626] rounded-xl px-3 py-2 hover:bg-[#B91C1C] active:scale-[0.98] transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Kelola Anggota
                              </button>
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
                <span className="px-3 text-gray-600">{safePage + 1} / {totalPages}</span>
                <button onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages - 1} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&rsaquo;</button>
                <button onClick={() => setPage(totalPages - 1)} disabled={safePage >= totalPages - 1} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&raquo;</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalTransferAnggotaKelas
        open={modalTransfer}
        onClose={closeModals}
        kelas={selected}
        semuaSiswa={refSiswa}
        anggotaKelas={anggotaKelas}
      />
    </>
  );
}
