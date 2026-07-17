'use client';

import { useState } from 'react';

const COLUMNS = [
  { key: '_no', label: 'No.' },
  { key: 'nama_siswa', label: 'Nama Siswa' },
  { key: 'hadir', label: 'Hadir' },
  { key: 'sakit', label: 'Sakit' },
  { key: 'izin', label: 'Izin' },
  { key: 'alpa', label: 'Alpa' },
  { key: '_persentase', label: 'Persentase Hadir' },
];

interface RekapPresensiGuruClientProps {
  data: any[];
  namaKelas: string;
}

export default function RekapPresensiGuruClient({ data, namaKelas }: RekapPresensiGuruClientProps) {
  const [search, setSearch] = useState('');

  const filtered = data.filter((row) =>
    String(row.nama_siswa ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
      <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
        <h3 className="font-semibold text-[#1A1A2E]">Rekap Presensi — {namaKelas}</h3>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
          />
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="text-center py-16 text-[#6B7280]">Tidak ada data presensi</td>
                </tr>
              ) : (
                filtered.map((row, i) => {
                  const total = (row.hadir || 0) + (row.sakit || 0) + (row.izin || 0) + (row.alpa || 0);
                  const persentase = total > 0 ? Math.round(((row.hadir || 0) / total) * 100) : 0;
                  return (
                    <tr key={row.id_siswa} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{row.nama_siswa}</td>
                      <td className="px-4 py-3 text-green-600 font-medium">{row.hadir || 0}</td>
                      <td className="px-4 py-3 text-yellow-600 font-medium">{row.sakit || 0}</td>
                      <td className="px-4 py-3 text-blue-600 font-medium">{row.izin || 0}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">{row.alpa || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${persentase >= 80 ? 'bg-green-500' : persentase >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${persentase}%` }} />
                          </div>
                          <span className="text-xs">{persentase}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-[#6B7280]">
          Total: {filtered.length} siswa
        </div>
      </div>
    </div>
  );
}
