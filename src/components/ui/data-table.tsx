'use client';

import { useState } from 'react';

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  addLabel?: string;
  onAdd?: () => void;
}

export default function DataTable({ columns, data, title, addLabel = 'Tambah Data', onAdd }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const filtered = data.filter((row) =>
    columns.some((col) =>
      String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const actualPerPage = perPage === 0 ? filtered.length : perPage;
  const totalPages = Math.max(1, Math.ceil(filtered.length / actualPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedData = filtered.slice(safePage * actualPerPage, (safePage + 1) * actualPerPage);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {title && (
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg flex items-center justify-between">
          <h5 className="font-semibold">{title}</h5>
          {onAdd && (
            <button onClick={onAdd} className="bg-white text-blue-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50 transition">
              {addLabel}
            </button>
          )}
        </div>
      )}
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
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 font-medium text-gray-600">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, i) => (
                  <tr key={row.id ?? i} className="border-b hover:bg-gray-50 transition">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {row[col.key] ?? '-'}
                      </td>
                    ))}
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
              <button
                onClick={() => setPage(0)}
                disabled={safePage === 0}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &laquo;
              </button>
              <button
                onClick={() => setPage(safePage - 1)}
                disabled={safePage === 0}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &lsaquo;
              </button>
              <span className="px-3 text-gray-600">
                {safePage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages - 1}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &rsaquo;
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={safePage >= totalPages - 1}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
