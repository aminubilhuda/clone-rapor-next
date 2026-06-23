'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { updateNaikKelas } from '@/lib/actions/naik-kelas-actions';

interface Props {
  data: any[];
  refKelas: any[];
  refTingkat: any[];
}

export default function NaikKelasClient({ data, refKelas, refTingkat }: Props) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');

  const filtered = data.filter((row) => {
    const matchSearch = !search || [row.nama_siswa, row.nama_kelas, row.tingkat].some(
      (v) => String(v ?? '').toLowerCase().includes(search.toLowerCase())
    );
    const matchKelas = !selectedKelas || row.id_kelas.toString() === selectedKelas;
    return matchSearch && matchKelas;
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = await updateNaikKelas(fd);
    if (result.success) {
      showToast('Data berhasil disimpan!', 'success');
    } else {
      showToast(result.error || 'Gagal menyimpan!', 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg">
        <h5 className="font-semibold">Daftar Siswa Per Kelas</h5>
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Cari siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">Semua Kelas</option>
            {refKelas.map((k: any) => (
              <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">NISN</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Siswa</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kelas</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tingkat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">Tidak ada data</td>
                </tr>
              ) : (
                filtered.map((row: any) => (
                  <tr key={row.id_siswa_kelas} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{row.id_siswa_kelas}</td>
                    <td className="px-4 py-3">{row.nisn || '-'}</td>
                    <td className="px-4 py-3">{row.nama_siswa}</td>
                    <td className="px-4 py-3">{row.nama_kelas}</td>
                    <td className="px-4 py-3">{row.tingkat}</td>
                    <td className="px-4 py-3">{row.status_label}</td>
                    <td className="px-4 py-3">
                      <form onSubmit={handleSave} className="flex items-center gap-2 flex-wrap">
                        <input type="hidden" name="id_siswa_kelas" value={row.id_siswa_kelas} />
                        <select name="id_kelas" defaultValue={row.id_kelas} className="border rounded px-2 py-1 text-xs bg-white">
                          {refKelas.map((k: any) => (
                            <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                          ))}
                        </select>
                        <select name="id_tingkat" defaultValue={row.id_tingkat} className="border rounded px-2 py-1 text-xs bg-white">
                          {refTingkat.map((t: any) => (
                            <option key={t.id_tingkat} value={t.id_tingkat}>{t.tingkat}</option>
                          ))}
                        </select>
                        <button type="submit" className="text-blue-600 hover:text-blue-800 text-xs font-medium">Simpan</button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-sm text-gray-400">
          Total: {filtered.length} data
        </div>
      </div>
    </div>
  );
}
