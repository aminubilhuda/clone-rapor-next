'use client';

import { useState } from 'react';

const COLUMNS = [
  { key: '_no', label: 'No.' },
  { key: 'nama_siswa', label: 'Nama Siswa' },
  { key: 'nisn', label: 'NISN' },
  { key: 'nis', label: 'NIS' },
  { key: 'nama_kelamin', label: 'Jenis Kelamin' },
  { key: 'nama_agama', label: 'Agama' },
  { key: 'tanggal_lahir', label: 'Tgl Lahir' },
  { key: 'kontak_siswa', label: 'Kontak' },
  { key: 'nama_ayah', label: 'Ayah' },
  { key: 'nama_ibu', label: 'Ibu' },
];

interface AnggotaKelasGuruClientProps {
  data: any[];
  namaKelas: string;
}

export default function AnggotaKelasGuruClient({ data, namaKelas }: AnggotaKelasGuruClientProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);

  const filtered = data.filter((row) =>
    String(row.nama_siswa ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(row.nisn ?? '').includes(search) ||
    String(row.nis ?? '').includes(search)
  );

  const actualPerPage = perPage === 0 ? filtered.length : perPage;
  const totalPages = Math.max(1, Math.ceil(filtered.length / actualPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedData = filtered.slice(safePage * actualPerPage, (safePage + 1) * actualPerPage);

  return (
    <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
      <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
        <h3 className="font-semibold text-[#1A1A2E]">Anggota Kelas — {namaKelas}</h3>
        <p className="text-sm text-[#6B7280] mt-1">{data.length} siswa</p>
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Cari nama / NISN / NIS..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full md:w-72 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
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
              <option value={0}>All</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.04)]">
                {COLUMNS.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium whitespace-nowrap">{col.label}</th>
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
                  <tr key={row.id_siswa} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                    {COLUMNS.map((col) => {
                      if (col.key === '_no') {
                        return <td key={col.key} className="px-4 py-3">{safePage * actualPerPage + i + 1}</td>;
                      }
                      if (col.key === 'tanggal_lahir') {
                        return <td key={col.key} className="px-4 py-3 whitespace-nowrap">{row[col.key] ? new Date(row[col.key]).toLocaleDateString('id-ID') : '-'}</td>;
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
  );
}
