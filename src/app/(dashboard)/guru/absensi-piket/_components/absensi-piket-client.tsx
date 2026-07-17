'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import {
  getKelasList,
  getSiswaKelas,
  cekAbsensiHariIni,
  savePresensiHarian,
} from '@/lib/actions/presensi-actions';

const ABSEN_OPTIONS = [
  { id_absen: 1, label: 'Hadir', sort: 'H' },
  { id_absen: 2, label: 'Sakit', sort: 'S' },
  { id_absen: 3, label: 'Izin', sort: 'I' },
  { id_absen: 4, label: 'Tanpa Berita', sort: 'TB' },
];

interface KelasItem {
  id_kelas: number;
  nama_kelas: string;
  jumlah: number;
}

interface SiswaItem {
  id_siswa: number;
  nama_siswa: string;
}

interface AbsensiEntry {
  id_siswa: number;
  id_absen: number;
}

export default function AbsensiPiketClient() {
  const { showToast } = useToast();
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [siswaList, setSiswaList] = useState<SiswaItem[]>([]);
  const [absensi, setAbsensi] = useState<AbsensiEntry[]>([]);
  const [sudahAbsen, setSudahAbsen] = useState(false);
  const [rekapAbsen, setRekapAbsen] = useState<any[]>([]);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getKelasList().then((data) => {
      setKelasList(data);
      setLoadingKelas(false);
    });
  }, []);

  const loadSiswa = useCallback(async (idKelas: number) => {
    setLoadingSiswa(true);
    setSudahAbsen(false);
    setRekapAbsen([]);

    const [siswa, absenHariIni] = await Promise.all([
      getSiswaKelas(idKelas),
      cekAbsensiHariIni(idKelas),
    ]);

    setSiswaList(siswa);

    if (absenHariIni.sudahAbsen) {
      setSudahAbsen(true);
      setRekapAbsen(absenHariIni.data || []);
    } else {
      setAbsensi(siswa.map((s: SiswaItem) => ({ id_siswa: s.id_siswa, id_absen: 1 })));
    }

    setLoadingSiswa(false);
  }, []);

  const handleKelasChange = (idKelas: number) => {
    setSelectedKelas(idKelas);
    if (idKelas) loadSiswa(idKelas);
  };

  const handleRadioChange = (idSiswa: number, idAbsen: number) => {
    setAbsensi((prev) =>
      prev.map((a) => (a.id_siswa === idSiswa ? { ...a, id_absen: idAbsen } : a))
    );
  };

  const handleSemuaHadir = () => {
    setAbsensi((prev) => prev.map((a) => ({ ...a, id_absen: 1 })));
  };

  const handleSimpan = async () => {
    if (!selectedKelas) return;
    setSaving(true);
    const result = await savePresensiHarian(selectedKelas, absensi);
    setSaving(false);

    if (result.success) {
      showToast(`Absensi tersimpan (${result.count} siswa tidak hadir)`, 'success');
      loadSiswa(selectedKelas);
    } else {
      showToast(result.error || 'Gagal menyimpan', 'error');
    }
  };

  const rekapHariIni = () => {
    const counts = { hadir: 0, sakit: 0, izin: 0, tanpaBerita: 0 };
    const totalSiswa = siswaList.length;

    if (sudahAbsen) {
      for (const r of rekapAbsen) {
        const absen = (r.absen || '').toLowerCase();
        if (absen === 'sakit') counts.sakit++;
        else if (absen === 'izin') counts.izin++;
        else if (absen === 'tanpa berita') counts.tanpaBerita++;
      }
      counts.hadir = totalSiswa - counts.sakit - counts.izin - counts.tanpaBerita;
    } else {
      for (const a of absensi) {
        if (a.id_absen === 1) counts.hadir++;
        else if (a.id_absen === 2) counts.sakit++;
        else if (a.id_absen === 3) counts.izin++;
        else if (a.id_absen === 4) counts.tanpaBerita++;
      }
    }
    return { ...counts, total: totalSiswa };
  };

  const rekap = rekapHariIni();
  const selectedNama = kelasList.find((k) => k.id_kelas === selectedKelas)?.nama_kelas;

  return (
    <div>
      <h4 className="text-xl font-semibold mb-6">Absensi Piket Harian</h4>

      {/* Kelas Select */}
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] p-6 mb-6">
        <label className="block text-sm font-medium text-[#1A1A2E] mb-2">Pilih Kelas</label>
        <select
          value={selectedKelas ?? ''}
          onChange={(e) => handleKelasChange(Number(e.target.value))}
          disabled={loadingKelas}
          className="w-full md:w-80 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all disabled:opacity-50"
        >
          <option value="">-- Pilih Kelas --</option>
          {kelasList.map((k) => (
            <option key={k.id_kelas} value={k.id_kelas}>
              {k.nama_kelas} ({k.jumlah} siswa)
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loadingSiswa && (
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#DC2626]/20 border-t-[#DC2626] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#6B7280]">Memuat data siswa...</p>
        </div>
      )}

      {/* Sudah Absen */}
      {!loadingSiswa && sudahAbsen && selectedKelas && (
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
          <div className="bg-[#FEF2F2] border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-[#1A1A2E]">
              Sudah Absen {selectedNama} Hari Ini
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#F0FDF4] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#16A34A]">{rekap.hadir}</p>
                <p className="text-xs text-[#6B7280] mt-1">Hadir</p>
              </div>
              <div className="bg-[#FEF9C3] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#CA8A04]">{rekap.sakit}</p>
                <p className="text-xs text-[#6B7280] mt-1">Sakit</p>
              </div>
              <div className="bg-[#DBEAFE] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#2563EB]">{rekap.izin}</p>
                <p className="text-xs text-[#6B7280] mt-1">Izin</p>
              </div>
              <div className="bg-[#FEE2E2] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#DC2626]">{rekap.tanpaBerita}</p>
                <p className="text-xs text-[#6B7280] mt-1">Tanpa Berita</p>
              </div>
            </div>
            <p className="text-xs text-[#6B7280] text-center">
              Total: {rekap.total} siswa
            </p>
          </div>
        </div>
      )}

      {/* Tabel Absensi */}
      {!loadingSiswa && !sudahAbsen && siswaList.length > 0 && (
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
          <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-[#1A1A2E]">
              Absensi {selectedNama}
            </h3>
            <button
              onClick={handleSemuaHadir}
              className="text-xs font-medium text-[#6B7280] hover:text-[#1A1A2E] bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-lg px-3 py-1.5 transition-colors"
            >
              Semua Hadir
            </button>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.04)]">
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-10">No</th>
                    <th className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Nama Siswa</th>
                    {ABSEN_OPTIONS.map((a) => (
                      <th key={a.id_absen} className="text-center px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-20">
                        {a.sort}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {siswaList.map((siswa, i) => {
                    const entry = absensi.find((a) => a.id_siswa === siswa.id_siswa);
                    const currentAbsen = entry?.id_absen ?? 1;
                    return (
                      <tr key={siswa.id_siswa} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                        <td className="px-4 py-2.5">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-[#1A1A2E]">{siswa.nama_siswa}</td>
                        {ABSEN_OPTIONS.map((a) => (
                          <td key={a.id_absen} className="px-3 py-2.5 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="radio"
                                name={`absen-${siswa.id_siswa}`}
                                checked={currentAbsen === a.id_absen}
                                onChange={() => handleRadioChange(siswa.id_siswa, a.id_absen)}
                                className="sr-only"
                              />
                              <span
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  currentAbsen === a.id_absen
                                    ? 'border-[#DC2626] bg-[#DC2626]'
                                    : 'border-[rgba(0,0,0,0.12)] bg-white hover:border-[#DC2626]/40'
                                }`}
                              >
                                {currentAbsen === a.id_absen && (
                                  <span className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </span>
                            </label>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Simpan */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-[#6B7280]">
                Total: {siswaList.length} siswa
              </p>
              <button
                onClick={handleSimpan}
                disabled={saving}
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl px-5 py-2.5 hover:bg-[#B91C1C] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Absensi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loadingKelas && !loadingSiswa && !selectedKelas && (
        <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F8F9FB] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">Pilih Kelas</h3>
          <p className="text-sm text-[#6B7280]">Pilih kelas untuk mulai mengabsen siswa.</p>
        </div>
      )}
    </div>
  );
}
