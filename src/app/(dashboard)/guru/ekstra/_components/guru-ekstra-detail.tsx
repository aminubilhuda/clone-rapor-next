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
        <a href="/guru/ekstra" className="text-blue-600 hover:underline text-sm">&larr; Kembali ke daftar</a>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold flex items-center justify-between">
          <span>{eskul.nama_eskul}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setModalAnggota(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-xs font-medium transition"
            >
              Kelola Anggota
            </button>
            <button
              onClick={() => setModalNilai(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-xs font-medium transition"
            >
              Nilai
            </button>
          </div>
        </div>
        <div className="p-5">
          {anggota.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Belum ada siswa yang terdaftar di eskul ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">NISN</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Siswa</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Predikat</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {anggota.map((s: any, i: number) => (
                    <tr key={s.id_siswa_eskul} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3">{s.nisn}</td>
                      <td className="px-4 py-3 font-medium">{s.nama_siswa}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          s.predikat === 'Sangat Baik' ? 'bg-green-100 text-green-700' :
                          s.predikat === 'Baik' ? 'bg-blue-100 text-blue-700' :
                          s.predikat === 'Cukup' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{s.predikat}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{s.keterangan}</td>
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
