'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast-provider';
import { updateSiswa, deleteSiswa, importSiswa, generateUsernamePasswordBulk } from '@/lib/actions/siswa-actions';
import { confirmAlert } from '@/lib/swal';
import ModalSiswa from './modal-siswa';
import ModalHapus from './modal-hapus';
import ModalImportSiswa from './modal-import-siswa';

const COLUMNS = [
  { key: 'id_siswa', label: 'ID' },
  { key: 'nama_siswa', label: 'Nama Siswa' },
  { key: 'nis', label: 'NIS' },
  { key: 'nisn', label: 'NISN' },
  { key: 'kelas_display', label: 'Kelas' },
  { key: 'kompetensi_keahlian', label: 'Jurusan' },
  { key: 'terima_kelas', label: 'Terima Kelas' },
  { key: 'jenis_kelamin', label: 'Kelamin' },
  { key: 'agama', label: 'Agama' },
  { key: 'tempat_tanggal_lahir', label: 'Tempat, Tgl Lahir' },
  { key: '_aksi', label: 'Aksi' },
];

interface SiswaClientProps {
  siswa: any[];
  total: number;
  page: number;
  perPage: number;
  search: string;
  refKelamin: any[];
  refAgama: any[];
  refJurusan: any[];
  refTingkat: any[];
  refHubKeluarga: any[];
  refJenisSiswa: any[];
  refPendidikan: any[];
}

export default function SiswaClient({ siswa, total, page, perPage, search, refKelamin, refAgama, refJurusan, refTingkat, refHubKeluarga, refJenisSiswa, refPendidikan }: SiswaClientProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(search);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [modalImport, setModalImport] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const navigate = useCallback((overrides: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v) sp.set(k, v); else sp.delete(k);
    }
    router.push(`/tu/kesiswaan?${sp.toString()}`);
  }, [router, searchParams]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) navigate({ search: searchInput, page: '0' });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, search, navigate]);

  const openTambah = () => { setSelected(null); setModalEdit(true); };
  const openEdit = (row: any) => { setSelected(row); setModalEdit(true); };
  const openHapus = (row: any) => { setSelected(row); setModalHapus(true); };
  const closeModals = () => { setModalEdit(false); setModalHapus(false); setSelected(null); };

  const handleSave = async (formData: FormData) => {
    const result = await updateSiswa(formData);
    if (result.success) {
      showToast('Data siswa berhasil disimpan!', 'success');
      closeModals();
      router.refresh();
    } else {
      showToast(result.error || 'Gagal menyimpan data!', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteSiswa(selected.id_siswa);
    if (result.success) {
      showToast('Data siswa berhasil dihapus!', 'success');
      closeModals();
      router.refresh();
    } else {
      showToast(result.error || 'Gagal menghapus data!', 'error');
    }
  };

  const handleBulkGenerate = async () => {
    const confirmed = await confirmAlert(
      'Generate Username/Password',
      'Semua siswa yang memiliki NISN akan di-set username & password = NISN. Lanjutkan?'
    );
    if (!confirmed) return;
    const result = await generateUsernamePasswordBulk();
    if (result.success) {
      showToast(`Berhasil generate ${result.count} siswa`, 'success');
      router.refresh();
    } else {
      showToast(result.error || 'Gagal generate!', 'error');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between">
          <h5 className="font-semibold text-[#1A1A2E]">Daftar Siswa</h5>
          <div className="flex items-center gap-2">
            <button onClick={handleBulkGenerate} className="bg-white text-[#DC2626] border border-[#DC2626]/30 px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#DC2626]/5 active:scale-[0.98] transition-all flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Generate Username/Pwd
            </button>
            <button onClick={() => setModalImport(true)} className="bg-white text-[#DC2626] border border-[#DC2626]/30 px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#DC2626]/5 active:scale-[0.98] transition-all flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Excel
            </button>
            <button onClick={openTambah} className="bg-[#DC2626] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] transition-all">
              + Tambah Siswa
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Cari data..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full md:w-64 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Tampil:</span>
              <select
                value={perPage}
                onChange={(e) => navigate({ perPage: e.target.value, page: '0' })}
                className="bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.04)]">
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="text-left px-4 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {siswa.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="text-center py-16 text-[#6B7280]">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  siswa.map((row: any, i: number) => (
                    <tr key={row.id_siswa ?? i} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                      {COLUMNS.map((col) => {
                        if (col.key === '_aksi') {
                          return (
                            <td key={col.key} className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => openEdit(row)} className="text-[#DC2626]/70 hover:text-[#DC2626] transition-colors" title="Edit">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button onClick={() => openHapus(row)} className="text-[#DC2626]/70 hover:text-[#DC2626] transition-colors" title="Hapus">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td key={col.key} className="px-4 py-3">
                            {row[col.key] ?? '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280]">
            <span>Total: {total} data</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => navigate({ page: '0' })} disabled={page === 0} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&laquo;</button>
                <button onClick={() => navigate({ page: String(page - 1) })} disabled={page === 0} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&lsaquo;</button>
                <span className="px-3 text-gray-600">{page + 1} / {totalPages}</span>
                <button onClick={() => navigate({ page: String(page + 1) })} disabled={page >= totalPages - 1} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&rsaquo;</button>
                <button onClick={() => navigate({ page: String(totalPages - 1) })} disabled={page >= totalPages - 1} className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">&raquo;</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalSiswa
        open={modalEdit}
        onClose={closeModals}
        siswa={selected}
        refKelamin={refKelamin}
        refAgama={refAgama}
        refJurusan={refJurusan}
        refTingkat={refTingkat}
        refHubKeluarga={refHubKeluarga}
        refJenisSiswa={refJenisSiswa}
        refPendidikan={refPendidikan}
        onSave={handleSave}
      />

      <ModalHapus
        open={modalHapus}
        onClose={closeModals}
        siswa={selected}
        onConfirm={handleDelete}
      />

      <ModalImportSiswa
        open={modalImport}
        onClose={() => setModalImport(false)}
        refKelamin={refKelamin}
        refAgama={refAgama}
        refJurusan={refJurusan}
        refTingkat={refTingkat}
        refHubKeluarga={refHubKeluarga}
        refJenisSiswa={refJenisSiswa}
        refPendidikan={refPendidikan}
        onImport={importSiswa}
      />
    </>
  );
}
