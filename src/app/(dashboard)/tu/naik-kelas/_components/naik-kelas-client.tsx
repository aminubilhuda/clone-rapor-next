'use client';

import { useState, useEffect } from 'react';
import Select from 'react-select';
import { useToast } from '@/components/ui/toast-provider';
import { updateNaikKelas, promoteKelas } from '@/lib/actions/naik-kelas-actions';

interface Props {
  data: any[];
  refKelas: any[];
  refTingkat: any[];
}

export default function NaikKelasClient({ data, refKelas, refTingkat }: Props) {
  const { showToast } = useToast();
  const [sourceKelasId, setSourceKelasId] = useState('');
  const [destTingkatId, setDestTingkatId] = useState('');
  const [destKelasId, setDestKelasId] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [individualFilter, setIndividualFilter] = useState('');

  const filteredData = sourceKelasId
    ? data.filter((d: any) => String(d.id_kelas) === sourceKelasId)
    : [];

  const sourceKelas = refKelas.find((k: any) => String(k.id_kelas) === sourceKelasId);
  const sourceTingkat = filteredData.length > 0
    ? refTingkat.find((t: any) => t.id_tingkat === filteredData[0].id_tingkat)
    : null;

  const sumberTingkatId = sourceTingkat?.id_tingkat;
  const destTingkatList = refTingkat.filter((t: any) => sumberTingkatId && t.id_tingkat > sumberTingkatId);
  const destKelasList = refKelas.filter((k: any) => String(k.id_tingkat) === destTingkatId);
  const isMaxTingkat = !!sourceTingkat && !refTingkat.some((t: any) => t.id_tingkat === sumberTingkatId + 1);

  useEffect(() => {
    if (sumberTingkatId && !isMaxTingkat) {
      setDestTingkatId(String(sumberTingkatId + 1));
    } else {
      setDestTingkatId('');
    }
    setDestKelasId('');
  }, [sourceKelasId]);

  const canPromote = sourceKelasId && destTingkatId && destKelasId && !promoting && filteredData.length > 0;

  const handlePromote = async () => {
    if (!canPromote) return;
    const destKelas = refKelas.find((k: any) => String(k.id_kelas) === destKelasId);
    const ok = window.confirm(`Promosikan ${filteredData.length} siswa dari ${sourceKelas?.nama_kelas} ke ${destKelas?.nama_kelas}?`);
    if (!ok) return;

    setPromoting(true);
    const fd = new FormData();
    fd.set('id_kelas', sourceKelasId);
    fd.set('id_tingkat_lama', String(sumberTingkatId));
    fd.set('id_tingkat_baru', destTingkatId);
    fd.set('id_kelas_baru', destKelasId);
    const result = await promoteKelas(fd);
    setPromoting(false);

    if (result.success) {
      showToast(result.message || 'Berhasil promosi!', 'success');
    } else {
      showToast(result.error || 'Gagal promosi!', 'error');
    }
  };

  const handleSingleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = await updateNaikKelas(fd);
    if (result.success) showToast('Data berhasil disimpan!', 'success');
    else showToast(result.error || 'Gagal menyimpan!', 'error');
  };

  const individualData = filteredData.filter((d: any) =>
    !individualFilter || d.nama_siswa.toLowerCase().includes(individualFilter.toLowerCase())
  );

  const guruOptions = refKelas.map((k: any) => ({ value: k.id_kelas, label: k.nama_kelas }));
  const tingkatOptions = refTingkat.map((t: any) => ({ value: t.id_tingkat, label: t.tingkat }));

  return (
    <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
      <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between"><h3 className="font-semibold text-[#1A1A2E]">Naik Kelas</h3></div>
      <div className="p-4">

        {/* Source class filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1">Kelas Asal</label>
          <select
            value={sourceKelasId}
            onChange={(e) => setSourceKelasId(e.target.value)}
            className="w-full md:w-96 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
          >
            <option value="">Pilih Kelas</option>
            {refKelas.map((k: any) => (
              <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
            ))}
          </select>
        </div>

        {!sourceKelasId && (
          <p className="text-[#6B7280] text-center py-16">Pilih kelas asal untuk memulai.</p>
        )}

        {sourceKelasId && filteredData.length === 0 && (
          <p className="text-[#6B7280] text-center py-16">Tidak ada siswa di kelas ini.</p>
        )}

        {sourceKelasId && filteredData.length > 0 && (
          <>
            {/* Batch promote section */}
            <div className="border border-[rgba(0,0,0,0.04)] bg-[#F8F9FB] rounded-xl p-4 mb-6">
              <h6 className="font-semibold text-[#1A1A2E]/80 mb-3">
                Promosikan {filteredData.length} Siswa
              </h6>
              <div className="flex items-end gap-4 flex-wrap">
                <div>
                  <label className="block text-xs text-[#1A1A2E]/80 mb-1">Tingkat Tujuan</label>
                  {isMaxTingkat ? (
                    <p className="text-sm text-yellow-700 py-1.5">
                      {sourceKelas?.nama_kelas} sudah di tingkat tertinggi (lulus).
                    </p>
                  ) : (
                    <select
                      value={destTingkatId}
                      onChange={(e) => { setDestTingkatId(e.target.value); setDestKelasId(''); }}
                      className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                    >
                      <option value="">Pilih Tingkat</option>
                      {destTingkatList.map((t: any) => (
                        <option key={t.id_tingkat} value={t.id_tingkat}>{t.tingkat}</option>
                      ))}
                    </select>
                  )}
                </div>
                {destTingkatId && !isMaxTingkat && (
                  <div>
                    <label className="block text-xs text-[#1A1A2E]/80 mb-1">Kelas Tujuan</label>
                    <select
                      value={destKelasId}
                      onChange={(e) => setDestKelasId(e.target.value)}
                      className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                    >
                      <option value="">Pilih Kelas</option>
                      {destKelasList.map((k: any) => (
                        <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                      ))}
                    </select>
                  </div>
                )}
                {canPromote && (
                  <button
                    onClick={handlePromote}
                    disabled={promoting}
                    className="bg-[#DC2626] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {promoting ? 'Memproses...' : 'Promosikan Semua'}
                  </button>
                )}
              </div>
            </div>

            {/* Individual edit section */}
            <h6 className="font-semibold text-[#1A1A2E]/80 mb-2">Edit Per Siswa</h6>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Cari siswa..."
                value={individualFilter}
                onChange={(e) => setIndividualFilter(e.target.value)}
                className="w-full md:w-64 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.04)]">
                    <th className="text-center px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-12">NO</th>
                    <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">NISN</th>
                    <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Nama Siswa</th>
                    <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Kelas</th>
                    <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Tingkat</th>
                    <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Status</th>
                    <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium w-64">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {individualData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-[#6B7280]">Tidak ada data</td>
                    </tr>
                  ) : (
                    individualData.map((row: any, i: number) => (
                      <tr key={row.id_siswa_kelas} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                        <td className="text-center px-3 py-3 text-[#1A1A2E]/80">{i + 1}</td>
                        <td className="px-3 py-3">{row.nisn || '-'}</td>
                        <td className="px-3 py-3">{row.nama_siswa}</td>
                        <td className="px-3 py-3">{row.nama_kelas}</td>
                        <td className="px-3 py-3">{row.tingkat}</td>
                        <td className="px-3 py-3">{row.status_label}</td>
                        <td className="px-3 py-3">
                          <form onSubmit={handleSingleSave} className="flex items-center gap-2">
                            <input type="hidden" name="id_siswa_kelas" value={row.id_siswa_kelas} />
                            <select name="id_kelas" defaultValue={row.id_kelas} className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-2 py-1 text-xs focus:ring-2 focus:ring-red-500/20 outline-none transition-all">
                              {refKelas.map((k: any) => (
                                <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                              ))}
                            </select>
                            <select name="id_tingkat" defaultValue={row.id_tingkat} className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-2 py-1 text-xs focus:ring-2 focus:ring-red-500/20 outline-none transition-all">
                              {refTingkat.map((t: any) => (
                                <option key={t.id_tingkat} value={t.id_tingkat}>{t.tingkat}</option>
                              ))}
                            </select>
                            <button type="submit" className="bg-[#DC2626] text-white px-3 py-1 rounded-xl text-xs font-medium hover:bg-[#B91C1C] active:scale-[0.98] transition-all">Simpan</button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
