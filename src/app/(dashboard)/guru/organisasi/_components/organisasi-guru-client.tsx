'use client';

import { useState } from 'react';

interface Organisasi {
  id_organisasi: number;
  nama_organisasi: string;
  kode: string;
}

interface Anggota {
  id_siswa_organisasi: number;
  id_organisasi: number;
  tahun: number;
  semester: number;
  nama_siswa: string;
  nisn: string;
  nama_kelas: string;
}

interface OrganisasiGuruClientProps {
  organisasi: Organisasi[];
  anggota: Anggota[];
}

export default function OrganisasiGuruClient({ organisasi, anggota }: OrganisasiGuruClientProps) {
  const [selectedOrg, setSelectedOrg] = useState<number | null>(organisasi[0]?.id_organisasi || null);
  const [search, setSearch] = useState('');

  const filteredAnggota = anggota.filter((a) => {
    const matchOrg = selectedOrg ? a.id_organisasi === selectedOrg : true;
    const matchSearch = String(a.nama_siswa ?? '').toLowerCase().includes(search.toLowerCase());
    return matchOrg && matchSearch;
  });

  const selectedNama = organisasi.find((o) => o.id_organisasi === selectedOrg)?.nama_organisasi || '';

  return (
    <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
      <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
        <h3 className="font-semibold text-[#1A1A2E]">Organisasi — Pembina</h3>
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          {organisasi.map((org) => (
            <button
              key={org.id_organisasi}
              onClick={() => { setSelectedOrg(org.id_organisasi); setSearch(''); }}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${selectedOrg === org.id_organisasi ? 'bg-[#DC2626] text-white' : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'}`}
            >
              {org.nama_organisasi}
            </button>
          ))}
        </div>

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
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-10">No</th>
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Nama Siswa</th>
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">NISN</th>
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Kelas</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnggota.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-[#6B7280]">Tidak ada anggota</td>
                </tr>
              ) : (
                filteredAnggota.map((a, i) => (
                  <tr key={a.id_siswa_organisasi} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{a.nama_siswa}</td>
                    <td className="px-4 py-3">{a.nisn}</td>
                    <td className="px-4 py-3">{a.nama_kelas || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-[#6B7280]">
          {selectedNama}: {filteredAnggota.length} anggota
        </div>
      </div>
    </div>
  );
}
