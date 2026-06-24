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
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pilih Kelas
        </label>
        <select
          value={selectedKelas}
          onChange={(e) => setSelectedKelas(e.target.value)}
          className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 text-sm"
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
        <p className="text-gray-400 text-center py-8">
          Pilih kelas untuk melihat Leger Nilai.
        </p>
      ) : students.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Belum ada data nilai untuk kelas {selectedKelasName}.
        </p>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-3 py-2 font-medium text-gray-600 w-10">
                  No
                </th>
                <th className="text-left px-3 py-2 font-medium text-gray-600 min-w-[180px]">
                  Nama Siswa
                </th>
                {mapels.map((m) => (
                  <th
                    key={m.id_mapel}
                    className="text-center px-2 py-2 font-medium text-gray-600 min-w-[60px]"
                    title={m.nama_mapel}
                  >
                    {m.singkatan || m.nama_mapel}
                  </th>
                ))}
                <th className="text-center px-3 py-2 font-medium text-gray-600 w-20">
                  Rata-rata
                </th>
                <th className="text-center px-3 py-2 font-medium text-gray-600 w-14">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedStudents.map((siswa) => (
                <tr key={siswa.id_siswa} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-1.5 text-gray-500">{siswa.rank}</td>
                  <td className="px-3 py-1.5 font-medium">
                    {siswa.nama_siswa}
                  </td>
                  {mapels.map((m) => {
                    const val =
                      nilaiLookup[`${siswa.id_siswa}_${m.id_mapel}`];
                    return (
                      <td key={m.id_mapel} className="px-2 py-1.5 text-center">
                        {val || '-'}
                      </td>
                    );
                  })}
                  <td className="px-3 py-1.5 text-center font-semibold">
                    {siswa.avg ? siswa.avg.toFixed(2) : '-'}
                  </td>
                  <td className="px-3 py-1.5 text-center font-bold text-blue-600">
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
