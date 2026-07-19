'use client';

import { useState } from 'react';
import ModalAnggotaEskul from '@/app/(dashboard)/tu/ekstra/_components/modal-anggota-eskul';
import ModalNilaiEskul from '@/app/(dashboard)/tu/ekstra/_components/modal-nilai-eskul';

interface Props {
  eskul: any;
  siswa: any[];
  siswaEkstra: any[];
  tahun: number;
  semester: number;
}

export default function GuruEkstraDetail({ eskul, siswa, siswaEkstra, tahun, semester }: Props) {
  const [modalAnggota, setModalAnggota] = useState(false);
  const [modalNilai, setModalNilai] = useState(false);

  const anggota = siswaEkstra.filter((a: any) => a.id_eskul === eskul.id_eskul);

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <a href="/guru/ekstra" className="text-[#DC2626] hover:underline text-sm">&larr; Kembali ke daftar</a>
      </div>

      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-[#1A1A2E]">{eskul.nama_eskul}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setModalAnggota(true)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-[0.98]"
            >
              Kelola Anggota
            </button>
            <button
              onClick={() => setModalNilai(true)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-[0.98]"
            >
              Nilai
            </button>
          </div>
        </div>
        <div className="p-4">
          {anggota.length === 0 ? (
            <div className="text-center py-8 text-[#6B7280]">
              Belum ada siswa yang terdaftar di eskul ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.04)]">
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">No</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">NISN</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Nama Siswa</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Predikat</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {anggota.map((s: any, i: number) => (
                    <tr key={s.id_siswa_eskul} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3">{s.nisn}</td>
                      <td className="px-4 py-3 font-medium text-[#1A1A2E]">{s.nama_siswa}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          s.predikat === 'Sangat Baik' ? 'bg-green-100 text-green-700' :
                          s.predikat === 'Baik' ? 'bg-blue-100 text-blue-700' :
                          s.predikat === 'Cukup' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{s.predikat}</span>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280] max-w-xs truncate">{s.keterangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ModalAnggotaEskul
        open={modalAnggota}
        onClose={() => setModalAnggota(false)}
        eskul={eskul}
        siswa={siswa}
        anggota={siswaEkstra}
        tahun={tahun}
        semester={semester}
      />

      <ModalNilaiEskul
        open={modalNilai}
        onClose={() => setModalNilai(false)}
        eskul={eskul}
        anggota={siswaEkstra}
      />
    </>
  );
}
