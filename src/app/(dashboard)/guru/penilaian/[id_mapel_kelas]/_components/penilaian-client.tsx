'use client';

import { useState } from 'react';

interface PenilaianClientProps {
  data: any;
  idMapelKelas: string;
}

const TAB_INFO: Record<string, { label: string; color: string }> = {
  'formatif': { label: 'Formatif', color: 'bg-green-600 hover:bg-green-700' },
  'sumatif-harian': { label: 'Sumatif Harian (PH)', color: 'bg-blue-600 hover:bg-blue-700' },
  'sumatif-ts': { label: 'Sumatif Tengah Semester (TS)', color: 'bg-red-600 hover:bg-red-700' },
  'sumatif-as': { label: 'Sumatif Akhir Semester (AS)', color: 'bg-yellow-600 hover:bg-yellow-700' },
};

export default function PenilaianClient({ data, idMapelKelas }: PenilaianClientProps) {
  const { mapelKelas, tujuanPembelajaran, siswa, nilai, activeDetail } = data;
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const tabs = Object.entries(TAB_INFO);

  const getNilai = (idSiswa: number, idTujuan: number) => {
    const val = nilai.find(
      (n: any) =>
        Number(n.id_siswa) === Number(idSiswa) &&
        Number(n.id_tujuan) === Number(idTujuan)
    );
    return val?.nilai || '';
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    const formData = new FormData(e.currentTarget);
    const entries: any[] = [];

    for (const [key, val] of formData.entries()) {
      if (key.startsWith('nilai_')) {
        const [, idSiswa, idTujuan] = key.split('_');
        entries.push({
          id_siswa: Number(idSiswa),
          id_tujuan: Number(idTujuan),
          nilai: val as string,
        });
      }
    }

    try {
      const res = await fetch(`/api/guru/penilaian/${idMapelKelas}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detail: activeDetail,
          entries,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan');
      }

      setSuccess('Nilai berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold">
        Tujuan Pembelajaran {mapelKelas.nama_mapel} - {mapelKelas.nama_kelas}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 px-5 py-4 border-b bg-gray-50">
        {tabs.map(([key, info]) => (
          <a
            key={key}
            href={`/guru/penilaian/${idMapelKelas}?detail=${key}`}
            className={`px-4 py-2 rounded text-sm font-medium text-white transition ${
              activeDetail === key ? info.color : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            {info.label}
          </a>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSave}>
        <div className="p-5">
          {/* Success/Error messages */}
          {success && (
            <div className="mb-4 bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-semibold">
              Penilaian <span className="text-red-500">{TAB_INFO[activeDetail]?.label}</span> {mapelKelas.nama_mapel} - {mapelKelas.nama_kelas}
            </h5>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:bg-green-400 transition"
            >
              {saving ? 'Menyimpan...' : 'Simpan Nilai'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-yellow-100">
                  <th className="border px-3 py-2 text-center w-10">No</th>
                  <th className="border px-3 py-2 text-left min-w-[200px]">Nama Peserta Didik</th>
                  {tujuanPembelajaran.map((tp: any, i: number) => (
                    <th key={tp.id_tujuan} className="border px-2 py-2 text-center min-w-[70px]">
                      <div className="text-xs font-medium" title={tp.tujuan}>
                        {activeDetail === 'formatif' ? 'F' : 'N'}. {i + 1}
                      </div>
                    </th>
                  ))}
                  <th className="border px-3 py-2 text-center">Jumlah</th>
                  <th className="border px-3 py-2 text-center">Rata-rata</th>
                </tr>
              </thead>
              <tbody>
                {siswa.length === 0 ? (
                  <tr>
                    <td colSpan={tujuanPembelajaran.length + 3} className="text-center py-8 text-gray-400">
                      Tidak ada siswa
                    </td>
                  </tr>
                ) : (
                  siswa.map((sis: any, idx: number) => {
                    let total = 0;
                    let count = 0;

                    return (
                      <tr key={sis.id_siswa_kelas} className="border-b hover:bg-gray-50">
                        <td className="border px-3 py-2 text-center">{idx + 1}</td>
                        <td className="border px-3 py-2">{sis.nama_siswa}</td>
                        {tujuanPembelajaran.map((tp: any) => {
                          const val = getNilai(sis.id_siswa, tp.id_tujuan);
                          const numVal = parseFloat(val);
                          if (!isNaN(numVal)) {
                            total += numVal;
                            count++;
                          }
                          return (
                            <td key={tp.id_tujuan} className="border px-1 py-1 text-center">
                              <input
                                type="number"
                                name={`nilai_${sis.id_siswa}_${tp.id_tujuan}`}
                                defaultValue={val}
                                min="0"
                                max="100"
                                step="0.01"
                                className="w-[60px] border border-gray-300 rounded px-2 py-1 text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>
                          );
                        })}
                        <td className="border px-3 py-2 text-center font-medium">
                          {total.toFixed(2)}
                        </td>
                        <td className="border px-3 py-2 text-center font-medium">
                          {count > 0 ? (total / count).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
}
