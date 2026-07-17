'use client';

import { useState } from 'react';

interface SiswaBukuInduk {
  id_siswa: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  nama_kelamin: string;
  nama_agama: string;
  kontak_siswa: string;
  jumlah_saudara: number;
  anak_ke: number;
  nama_ayah: string;
  pekerjaan_ayah: string;
  kontak_ayah: string;
  nama_ibu: string;
  pekerjaan_ibu: string;
  kontak_ibu: string;
  alamat: string;
  alamat_orang_tua: string;
  nama_wali: string;
  alamat_wali: string;
  pekerjaan_wali: string;
  kontak_wali: string;
  sekolah_asal: string;
  nama_jenis_siswa: string;
  nama_tingkat: string;
  nama_kelas: string;
}

const SECTIONS = [
  { key: 'identitas', label: 'Identitas Siswa' },
  { key: 'orangtua', label: 'Data Orang Tua' },
  { key: 'wali', label: 'Data Wali' },
  { key: 'sekolah', label: 'Riwayat Sekolah' },
];

interface BukuIndukGuruClientProps {
  data: SiswaBukuInduk[];
  namaKelas: string;
}

export default function BukuIndukGuruClient({ data, namaKelas }: BukuIndukGuruClientProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SiswaBukuInduk | null>(null);
  const [activeSection, setActiveSection] = useState('identitas');

  const filtered = data.filter((row) =>
    String(row.nama_siswa ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(row.nisn ?? '').includes(search) ||
    String(row.nis ?? '').includes(search)
  );

  function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function renderDetail(s: SiswaBukuInduk) {
    if (activeSection === 'identitas') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-[#6B7280]">Nama Lengkap:</span> <span className="font-medium">{s.nama_siswa}</span></div>
          <div><span className="text-[#6B7280]">NISN:</span> <span className="font-medium">{s.nisn}</span></div>
          <div><span className="text-[#6B7280]">NIS:</span> <span className="font-medium">{s.nis}</span></div>
          <div><span className="text-[#6B7280]">Tempat Lahir:</span> <span className="font-medium">{s.tempat_lahir}</span></div>
          <div><span className="text-[#6B7280]">Tanggal Lahir:</span> <span className="font-medium">{formatDate(s.tanggal_lahir)}</span></div>
          <div><span className="text-[#6B7280]">Jenis Kelamin:</span> <span className="font-medium">{s.nama_kelamin}</span></div>
          <div><span className="text-[#6B7280]">Agama:</span> <span className="font-medium">{s.nama_agama}</span></div>
          <div><span className="text-[#6B7280]">Kontak:</span> <span className="font-medium">{s.kontak_siswa}</span></div>
          <div><span className="text-[#6B7280]">Alamat:</span> <span className="font-medium">{s.alamat}</span></div>
          <div><span className="text-[#6B7280]">Anak Ke:</span> <span className="font-medium">{s.anak_ke}</span></div>
          <div><span className="text-[#6B7280]">Jumlah Saudara:</span> <span className="font-medium">{s.jumlah_saudara}</span></div>
          <div><span className="text-[#6B7280]">Jenis Siswa:</span> <span className="font-medium">{s.nama_jenis_siswa}</span></div>
        </div>
      );
    }
    if (activeSection === 'orangtua') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="md:col-span-2 font-semibold text-[#1A1A2E] border-b pb-1">Ayah</div>
          <div><span className="text-[#6B7280]">Nama:</span> <span className="font-medium">{s.nama_ayah}</span></div>
          <div><span className="text-[#6B7280]">Pekerjaan:</span> <span className="font-medium">{s.pekerjaan_ayah}</span></div>
          <div><span className="text-[#6B7280]">Kontak:</span> <span className="font-medium">{s.kontak_ayah}</span></div>
          <div className="md:col-span-2 font-semibold text-[#1A1A2E] border-b pb-1 mt-2">Ibu</div>
          <div><span className="text-[#6B7280]">Nama:</span> <span className="font-medium">{s.nama_ibu}</span></div>
          <div><span className="text-[#6B7280]">Pekerjaan:</span> <span className="font-medium">{s.pekerjaan_ibu}</span></div>
          <div><span className="text-[#6B7280]">Kontak:</span> <span className="font-medium">{s.kontak_ibu}</span></div>
          <div><span className="text-[#6B7280]">Alamat Orang Tua:</span> <span className="font-medium">{s.alamat_orang_tua}</span></div>
        </div>
      );
    }
    if (activeSection === 'wali') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-[#6B7280]">Nama Wali:</span> <span className="font-medium">{s.nama_wali || '-'}</span></div>
          <div><span className="text-[#6B7280]">Pekerjaan:</span> <span className="font-medium">{s.pekerjaan_wali || '-'}</span></div>
          <div><span className="text-[#6B7280]">Kontak:</span> <span className="font-medium">{s.kontak_wali || '-'}</span></div>
          <div><span className="text-[#6B7280]">Alamat:</span> <span className="font-medium">{s.alamat_wali || '-'}</span></div>
        </div>
      );
    }
    if (activeSection === 'sekolah') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-[#6B7280]">Sekolah Asal:</span> <span className="font-medium">{s.sekolah_asal}</span></div>
          <div><span className="text-[#6B7280]">Tingkat:</span> <span className="font-medium">{s.nama_tingkat}</span></div>
          <div><span className="text-[#6B7280]">Kelas:</span> <span className="font-medium">{s.nama_kelas}</span></div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
      <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
        <h3 className="font-semibold text-[#1A1A2E]">Buku Induk — {namaKelas}</h3>
        <p className="text-sm text-[#6B7280] mt-1">{data.length} siswa</p>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari nama / NISN / NIS..."
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
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">NIS</th>
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">JK</th>
                <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Agama</th>
                <th className="text-center px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#6B7280]">Tidak ada data</td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={row.id_siswa} className={`border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors ${selected?.id_siswa === row.id_siswa ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{row.nama_siswa}</td>
                    <td className="px-4 py-3">{row.nisn}</td>
                    <td className="px-4 py-3">{row.nis}</td>
                    <td className="px-4 py-3">{row.nama_kelamin}</td>
                    <td className="px-4 py-3">{row.nama_agama}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelected(selected?.id_siswa === row.id_siswa ? null : row)}
                        className="text-xs font-medium text-white bg-[#DC2626] rounded-lg px-3 py-1.5 hover:bg-[#B91C1C] active:scale-[0.98] transition-all"
                      >
                        {selected?.id_siswa === row.id_siswa ? 'Tutup' : 'Detail'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="mt-4 border border-[rgba(0,0,0,0.08)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 border-b border-[rgba(0,0,0,0.06)] pb-2">
              <h4 className="font-semibold text-[#1A1A2E]">{selected.nama_siswa}</h4>
              <span className="text-xs text-[#6B7280]">— {selected.nama_kelas}</span>
            </div>
            <div className="flex gap-1 mb-3">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.key}
                  onClick={() => setActiveSection(sec.key)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${activeSection === sec.key ? 'bg-[#DC2626] text-white' : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'}`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
            {renderDetail(selected)}
          </div>
        )}
      </div>
    </div>
  );
}
