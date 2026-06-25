'use client';

import { useState, useMemo } from 'react';

interface LegerRow {
  id: number;
  id_kelas: number;
  id_mapel: number;
  id_siswa: number;
  nilai_akhir: string;
  nama_siswa: string;
  nis: string;
  nisn: string;
  nama_mapel: string;
  singkatan: string;
  urut: number;
  nama_kelas: string;
}

interface Kelas {
  id_kelas: number;
  nama_kelas: string;
}

interface NilaiKelas {
  id_kelas: number;
  id_siswa: number;
  nilai: string;
  jumlah: string;
}

export default function LegerClient({
  data,
  refKelas,
  refNilaiKelas,
}: {
  data: LegerRow[];
  refKelas: Kelas[];
  refNilaiKelas: NilaiKelas[];
}) {
  const [selectedKelas, setSelectedKelas] = useState('');

  const filteredData = useMemo(() => {
    if (!selectedKelas) return [];
    return data.filter((r) => r.id_kelas === Number(selectedKelas));
  }, [data, selectedKelas]);

  const students = useMemo(() => {
    const seen = new Set<number>();
    return filteredData
      .filter((r) => {
        if (seen.has(r.id_siswa)) return false;
        seen.add(r.id_siswa);
        return true;
      })
      .map((r) => ({
        id_siswa: r.id_siswa,
        nama_siswa: r.nama_siswa,
        nis: r.nis,
      }));
  }, [filteredData]);

  const mapels = useMemo(() => {
    const seen = new Set<number>();
    return filteredData
      .filter((r) => {
        if (seen.has(r.id_mapel)) return false;
        seen.add(r.id_mapel);
        return true;
      })
      .map((r) => ({
        id_mapel: r.id_mapel,
        nama_mapel: r.nama_mapel,
        singkatan: r.singkatan,
        urut: r.urut,
      }))
      .sort((a, b) => a.urut - b.urut);
  }, [filteredData]);

  const nilaiLookup = useMemo(() => {
    const map: Record<string, string> = {};
    filteredData.forEach((r) => {
      map[`${r.id_siswa}_${r.id_mapel}`] = r.nilai_akhir;
    });
    return map;
  }, [filteredData]);

  const nilaiKelasLookup = useMemo(() => {
    const map: Record<string, string> = {};
    refNilaiKelas.forEach((r) => {
      map[`${r.id_kelas}_${r.id_siswa}`] = r.nilai;
    });
    return map;
  }, [refNilaiKelas]);

  const selectedKelasName = selectedKelas
    ? refKelas.find((k) => k.id_kelas === Number(selectedKelas))?.nama_kelas || ''
    : '';

  const rankedStudents = useMemo(() => {
    const withAvg = students.map((s) => ({
      ...s,
      avg: parseFloat(
        nilaiKelasLookup[`${Number(selectedKelas)}_${s.id_siswa}`]
      ) || 0,
    }));
    withAvg.sort((a, b) => b.avg - a.avg);
    let rank = 0;
    let prevAvg = -1;
    return withAvg.map((s, i) => {
      if (s.avg !== prevAvg) {
        rank = i + 1;
        prevAvg = s.avg;
      }
      return { ...s, rank };
    });
  }, [students, nilaiKelasLookup, selectedKelas]);

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
          {refKelas.map((k) => (
            <option key={k.id_kelas} value={k.id_kelas}>
              {k.nama_kelas}
            </option>
          ))}
        </select>
      </div>

      {!selectedKelas ? (
        <div className="text-center py-16">
          <p className="text-[#6B7280]">Pilih kelas untuk melihat Leger Nilai.</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#6B7280]">Belum ada data nilai untuk kelas {selectedKelasName}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.04)]">
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider w-10">
                  No
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider min-w-[180px]">
                  Nama Siswa
                </th>
                {mapels.map((m) => (
                  <th
                    key={m.id_mapel}
                    className="text-center px-3 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider min-w-[60px]"
                    title={m.nama_mapel}
                  >
                    {m.singkatan || m.nama_mapel}
                  </th>
                ))}
                <th className="text-center px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider w-20">
                  Rata-rata
                </th>
                <th className="text-center px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider w-14">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedStudents.map((siswa, idx) => (
                <tr key={siswa.id_siswa} className="border-b border-[rgba(0,0,0,0.03)] transition-colors hover:bg-[#F8F9FB]">
                  <td className="px-4 py-2.5 text-[#6B7280] text-xs">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-[#1A1A2E]">
                    {siswa.nama_siswa}
                  </td>
                  {mapels.map((m) => {
                    const val =
                      nilaiLookup[`${siswa.id_siswa}_${m.id_mapel}`];
                    return (
                      <td key={m.id_mapel} className="px-3 py-2.5 text-center text-[#1A1A2E]">
                        {val || <span className="text-[#6B7280]/40">&mdash;</span>}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2.5 text-center font-semibold text-[#1A1A2E]">
                    {siswa.avg ? siswa.avg.toFixed(2) : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold text-red-500/80">
                    {siswa.rank}
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
