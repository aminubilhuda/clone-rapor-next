'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalAnggotaOrganisasi from '@/app/(dashboard)/tu/organisasi/_components/modal-anggota-organisasi';

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

interface Siswa {
  id_siswa: number;
  nisn: string | null;
  nama_siswa: string;
}

interface OrganisasiGuruClientProps {
  organisasi: Organisasi[];
  anggota: Anggota[];
  siswa: Siswa[];
  tahun: number;
  semester: number;
}

export default function OrganisasiGuruClient({ organisasi, anggota, siswa, tahun, semester }: OrganisasiGuruClientProps) {
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState<number | null>(organisasi[0]?.id_organisasi || null);
  const [search, setSearch] = useState('');
  const [modalAnggota, setModalAnggota] = useState(false);

  const filteredAnggota = anggota.filter((a) => {
    const matchOrg = selectedOrg ? a.id_organisasi === selectedOrg : true;
    const matchSearch = String(a.nama_siswa ?? '').toLowerCase().includes(search.toLowerCase());
    return matchOrg && matchSearch;
  });

  const selectedNama = organisasi.find((o) => o.id_organisasi === selectedOrg)?.nama_organisasi || '';
  const selectedOrgData = organisasi.find((o) => o.id_organisasi === selectedOrg) || null;

  return (
    <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
        <h3 className="font-semibold text-[#1A1A2E]">Organisasi — Pembina</h3>
        <button
          type="button"
          onClick={() => setModalAnggota(true)}
          disabled={!selectedOrgData}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#DC2626] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Kelola Anggota
        </button>
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

      {selectedOrgData && (
        <ModalAnggotaOrganisasi
          open={modalAnggota}
          onClose={() => {
            setModalAnggota(false);
            router.refresh();
          }}
          organisasi={selectedOrgData}
          siswa={siswa}
          anggota={anggota}
          tahun={tahun}
          semester={semester}
        />
      )}
    </div>
  );
}
