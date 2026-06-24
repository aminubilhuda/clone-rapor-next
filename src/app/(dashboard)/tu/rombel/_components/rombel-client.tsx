'use client';

import { useState } from 'react';
import Select from 'react-select';
import { useToast } from '@/components/ui/toast-provider';
import { updateWaliKelas } from '@/lib/actions/rombel-actions';

const COLUMNS = [
  { key: '_no', label: 'NO' },
  { key: 'nama_kelas', label: 'Nama Kelas' },
  { key: 'tingkat', label: 'Tingkat' },
  { key: 'wali_nama', label: 'Wali Kelas' },
];

interface RombelClientProps {
  data: any[];
  refUser: any[];
  tahun: number;
  semester: number;
}

export default function RombelClient({ data, refUser, tahun, semester }: RombelClientProps) {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const filtered = data.filter((row) =>
    COLUMNS.filter((c) => c.key !== '_no').some((col) =>
      String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const actualPerPage = perPage === 0 ? filtered.length : perPage;
  const totalPages = Math.max(1, Math.ceil(filtered.length / actualPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedData = filtered.slice(safePage * actualPerPage, (safePage + 1) * actualPerPage);

  const guruOptions = refUser.map((u: any) => ({ value: u.id_user, label: u.nama }));

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg flex items-center justify-between">
        <h5 className="font-semibold">Daftar Kelas / Rombel</h5>
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
                paginatedData.map((row, i) => (
                  <tr key={row.id_kelas} className="border-b hover:bg-gray-50 transition">
                    {COLUMNS.map((col) => {
                      if (col.key === '_no') {
                        return <td key={col.key} className="px-4 py-3">{safePage * actualPerPage + i + 1}</td>;
                      }
                      if (col.key === 'wali_nama') {
                        const val = guruOptions.find((o) => o.value === row.wali_user_id) || null;
                        return (
                          <td key={col.key} className="px-4 py-3 min-w-44">
                            <Select
                              instanceId={`wali-${row.id_kelas}`}
                              options={guruOptions}
                              value={val}
                              onChange={(opt: any) => {
                                const fd = new FormData();
                                fd.set('id_kelas', String(row.id_kelas));
                                fd.set('id_user', opt?.value?.toString() || '');
                                fd.set('tahun', String(tahun));
                                fd.set('semester', String(semester));
                                updateWaliKelas(fd).then((r) => {
                                  if (r.success) showToast('Wali kelas berhasil diupdate!', 'success');
                                  else showToast(r.error || 'Gagal mengupdate wali kelas!', 'error');
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
  );
}
