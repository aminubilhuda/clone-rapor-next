'use client';

import { useState, useMemo } from 'react';

interface Props {
  refKelas: any[];
  siswaKelas: any[];
}

export default function DaftarRaporClient({ refKelas, siswaKelas }: Props) {
  const [selectedKelas, setSelectedKelas] = useState('');

  const filteredSiswa = useMemo(() => {
    if (!selectedKelas) return [];
    return siswaKelas.filter((sk) => sk.id_kelas === Number(selectedKelas));
  }, [siswaKelas, selectedKelas]);

  const kelasName = selectedKelas
    ? refKelas.find((k) => k.id_kelas === Number(selectedKelas))?.nama_kelas || ''
    : '';

  return (
    <div>
      <div className="mb-5">
        <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
          Pilih Kelas
        </label>
        <select
          value={selectedKelas}
          onChange={(e) => setSelectedKelas(e.target.value)}
          className="w-full max-w-xs bg-white border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 transition-all premium-shadow"
        >
          <option value="">-- Pilih Kelas --</option>
          {refKelas.map((k: any) => (
            <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
          ))}
        </select>
      </div>

      {!selectedKelas ? (
        <div className="text-center py-16">
          <p className="text-[#6B7280]">Pilih kelas untuk melihat daftar rapor.</p>
        </div>
      ) : filteredSiswa.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#6B7280]">Belum ada siswa di kelas {kelasName}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.04)]">
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider w-10">No</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Nama Siswa</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">NIS</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">NISN</th>
                <th className="text-center px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSiswa.map((sk: any, idx: number) => (
                <tr key={sk.id_siswa_kelas} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                  <td className="px-4 py-2.5 text-[#6B7280] text-xs">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-[#1A1A2E]">{sk.nama_siswa}</td>
                  <td className="px-4 py-2.5 text-[#1A1A2E]/70">{sk.nis || '-'}</td>
                  <td className="px-4 py-2.5 text-[#1A1A2E]/70">{sk.nisn || '-'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#DC2626] rounded-xl px-3 py-1.5 hover:bg-[#B91C1C] active:scale-[0.98] transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Cetak Rapor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
