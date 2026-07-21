'use client';

import { useMemo, useState } from 'react';
import CatatanWaliEditor from '@/components/guru/catatan-wali-editor';

interface KelasItem {
  id_kelas: number;
  nama_kelas: string;
}

interface SiswaItem {
  id_kelas: number;
  id_siswa: number;
  nama_siswa: string;
  nis: string | null;
  nisn: string | null;
  catatan: string;
}

interface Props {
  kelasList: KelasItem[];
  initialSiswa: SiswaItem[];
}

type FilterStatus = 'semua' | 'belum';

export default function CatatanWaliClient({ kelasList, initialSiswa }: Props) {
  const [selectedKelas, setSelectedKelas] = useState(kelasList[0]?.id_kelas || 0);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('semua');
  const [siswaList, setSiswaList] = useState(initialSiswa);

  const siswaKelas = useMemo(
    () => siswaList.filter((siswa) => siswa.id_kelas === selectedKelas),
    [selectedKelas, siswaList]
  );

  const filteredSiswa = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return siswaKelas.filter((siswa) => {
      const matchesSearch = !keyword || [siswa.nama_siswa, siswa.nis, siswa.nisn]
        .some((value) => String(value || '').toLowerCase().includes(keyword));
      const matchesStatus = filterStatus === 'semua' || !siswa.catatan.trim();
      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, search, siswaKelas]);

  const namaKelas = kelasList.find((kelas) => kelas.id_kelas === selectedKelas)?.nama_kelas || '';
  const jumlahTerisi = siswaKelas.filter((siswa) => siswa.catatan.trim()).length;
  const progress = siswaKelas.length ? Math.round((jumlahTerisi / siswaKelas.length) * 100) : 0;

  const updateCatatan = (idSiswa: number, catatan: string) => {
    setSiswaList((current) => current.map((siswa) =>
      siswa.id_siswa === idSiswa && siswa.id_kelas === selectedKelas
        ? { ...siswa, catatan }
        : siswa
    ));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-xl font-semibold text-[#1A1A2E]">Catatan Wali</h4>
          <p className="mt-1 text-sm text-gray-500">Catatan tersimpan otomatis dan ditampilkan pada rapor siswa.</p>
        </div>
        <div className="min-w-44 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Kelengkapan {namaKelas}</span>
            <span>{jumlahTerisi}/{siswaKelas.length}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded bg-gray-100">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="grid gap-3 sm:grid-cols-2">
          {kelasList.length > 1 ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Kelas</label>
              <select
                value={selectedKelas}
                onChange={(event) => setSelectedKelas(Number(event.target.value))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
              >
                {kelasList.map((kelas) => (
                  <option key={kelas.id_kelas} value={kelas.id_kelas}>{kelas.nama_kelas}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Kelas</span>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700">{namaKelas}</div>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="cari-siswa">Cari siswa</label>
            <input
              id="cari-siswa"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nama, NIS, atau NISN"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1" aria-label="Filter status catatan">
          <button
            type="button"
            onClick={() => setFilterStatus('semua')}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${filterStatus === 'semua' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('belum')}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${filterStatus === 'belum' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Belum Terisi
          </button>
        </div>
      </div>

      {filteredSiswa.length === 0 ? (
        <div className="border-y border-gray-200 py-14 text-center">
          <p className="text-sm font-medium text-gray-700">Tidak ada siswa yang sesuai</p>
          <p className="mt-1 text-sm text-gray-500">Ubah pencarian atau filter status catatan.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="hidden grid-cols-[3rem_14rem_minmax(0,1fr)] border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500 md:grid">
            <div className="px-3 py-3 text-center font-medium">No</div>
            <div className="px-4 py-3 font-medium">Peserta Didik</div>
            <div className="px-4 py-3 font-medium">Catatan Wali</div>
          </div>
          {filteredSiswa.map((siswa, index) => (
            <article
              key={siswa.id_siswa}
              className="grid gap-3 border-b border-gray-100 p-4 last:border-b-0 md:grid-cols-[3rem_14rem_minmax(0,1fr)] md:gap-0 md:p-0"
            >
              <div className="hidden px-3 py-4 text-center text-sm text-gray-400 md:block">{index + 1}</div>
              <div className="flex items-start gap-3 md:block md:px-4 md:py-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-500 md:hidden">{index + 1}</span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{siswa.nama_siswa}</p>
                  <p className="mt-0.5 text-xs text-gray-500">NIS {siswa.nis || '-'} | NISN {siswa.nisn || '-'}</p>
                </div>
              </div>
              <div className="md:px-4 md:py-4">
                <CatatanWaliEditor
                  idKelas={siswa.id_kelas}
                  idSiswa={siswa.id_siswa}
                  initialValue={siswa.catatan}
                  siswaName={siswa.nama_siswa}
                  onSaved={(catatan) => updateCatatan(siswa.id_siswa, catatan)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
