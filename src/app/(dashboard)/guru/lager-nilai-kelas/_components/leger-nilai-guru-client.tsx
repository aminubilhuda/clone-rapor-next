'use client';

import { useMemo } from 'react';
import * as XLSX from 'xlsx';

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
}

interface NilaiKelas {
  id_siswa: number;
  nilai: string;
}

interface RekapPresensi {
  id_siswa: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
}

export default function LegerGuruClient({
  data,
  namaKelas,
  refNilaiKelas,
  rekapPresensi,
}: {
  data: LegerRow[];
  namaKelas: string;
  refNilaiKelas: NilaiKelas[];
  rekapPresensi: RekapPresensi[];
}) {
  const students = useMemo(() => {
    const seen = new Set<number>();
    return data
      .filter((r) => {
        if (seen.has(r.id_siswa)) return false;
        seen.add(r.id_siswa);
        return true;
      })
      .map((r) => ({
        id_siswa: r.id_siswa,
        nama_siswa: r.nama_siswa,
        nis: r.nis,
        nisn: r.nisn,
      }));
  }, [data]);

  const mapels = useMemo(() => {
    const seen = new Set<number>();
    return data
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
  }, [data]);

  const nilaiLookup = useMemo(() => {
    const map: Record<string, string> = {};
    data.forEach((r) => {
      map[`${r.id_siswa}_${r.id_mapel}`] = r.nilai_akhir;
    });
    return map;
  }, [data]);

  const nilaiKelasLookup = useMemo(() => {
    const map: Record<string, string> = {};
    refNilaiKelas.forEach((r) => {
      map[r.id_siswa] = r.nilai;
    });
    return map;
  }, [refNilaiKelas]);

  const presensiLookup = useMemo(() => {
    const map: Record<number, RekapPresensi> = {};
    rekapPresensi.forEach((r) => {
      map[r.id_siswa] = r;
    });
    return map;
  }, [rekapPresensi]);

  const rankedStudents = useMemo(() => {
    const withAvg = students.map((s) => ({
      ...s,
      avg: parseFloat(nilaiKelasLookup[s.id_siswa]) || 0,
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
  }, [students, nilaiKelasLookup]);

  function handleExportExcel() {
    if (!mapels.length) return;

    const sorted = [...students].sort((a, b) =>
      a.nama_siswa.localeCompare(b.nama_siswa)
    );

    const header = [
      'No', 'Nama Siswa', 'NIS', 'NISN',
      ...mapels.map((m) => m.nama_mapel),
      'Rata-rata', 'Rank', 'Hadir', 'Sakit', 'Izin', 'Alpa',
    ];
    const rows = sorted.map((s, i) => {
      const pres = presensiLookup[s.id_siswa];
      return [
        i + 1,
        s.nama_siswa,
        s.nis,
        s.nisn,
        ...mapels.map((m) => nilaiLookup[`${s.id_siswa}_${m.id_mapel}`] || ''),
        nilaiKelasLookup[s.id_siswa] ? parseFloat(nilaiKelasLookup[s.id_siswa]).toFixed(2) : '',
        rankedStudents.find((r) => r.id_siswa === s.id_siswa)?.rank || '',
        pres?.hadir || 0,
        pres?.sakit || 0,
        pres?.izin || 0,
        pres?.alpa || 0,
      ];
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws['!cols'] = [
      { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
      ...mapels.map(() => ({ wch: 10 })),
      { wch: 12 }, { wch: 6 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Leger');
    XLSX.writeFile(wb, `Leger_Nilai_${namaKelas.replace(/\s+/g, '_')}.xlsx`);
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[#6B7280]">Belum ada data nilai untuk kelas {namaKelas}.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">Leger Nilai — {namaKelas}</h2>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          Export Excel
        </button>
      </div>

      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.04)]">
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider w-10">No</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider min-w-[180px]">Nama Siswa</th>
              {mapels.map((m) => (
                <th key={m.id_mapel} className="text-center px-3 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider min-w-[60px]" title={m.nama_mapel}>
                  {m.singkatan || m.nama_mapel}
                </th>
              ))}
              <th className="text-center px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider w-20">Rata-rata</th>
              <th className="text-center px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider w-14">Rank</th>
              <th className="text-center px-3 py-3 font-medium text-green-600 text-xs uppercase tracking-wider w-14">H</th>
              <th className="text-center px-3 py-3 font-medium text-yellow-600 text-xs uppercase tracking-wider w-14">S</th>
              <th className="text-center px-3 py-3 font-medium text-blue-600 text-xs uppercase tracking-wider w-14">I</th>
              <th className="text-center px-3 py-3 font-medium text-red-600 text-xs uppercase tracking-wider w-14">A</th>
            </tr>
          </thead>
          <tbody>
            {rankedStudents.map((siswa, idx) => {
              const pres = presensiLookup[siswa.id_siswa];
              return (
                <tr key={siswa.id_siswa} className="border-b border-[rgba(0,0,0,0.03)] transition-colors hover:bg-[#F8F9FB]">
                  <td className="px-4 py-2.5 text-[#6B7280] text-xs">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-[#1A1A2E]">{siswa.nama_siswa}</td>
                  {mapels.map((m) => {
                    const val = nilaiLookup[`${siswa.id_siswa}_${m.id_mapel}`];
                    return (
                      <td key={m.id_mapel} className="px-3 py-2.5 text-center text-[#1A1A2E]">
                        {val || <span className="text-[#6B7280]/40">&mdash;</span>}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2.5 text-center font-semibold text-[#1A1A2E]">
                    {siswa.avg ? siswa.avg.toFixed(2) : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold text-red-500/80">{siswa.rank}</td>
                  <td className="px-3 py-2.5 text-center text-green-600">{pres?.hadir || 0}</td>
                  <td className="px-3 py-2.5 text-center text-yellow-600">{pres?.sakit || 0}</td>
                  <td className="px-3 py-2.5 text-center text-blue-600">{pres?.izin || 0}</td>
                  <td className="px-3 py-2.5 text-center text-red-600">{pres?.alpa || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
