'use client';

import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { addSiswaEkstra, removeSiswaEkstra } from '@/lib/actions/ekstra-actions';

interface ModalAnggotaEskulProps {
  open: boolean;
  onClose: () => void;
  eskul: any;
  siswa: any[];
  anggota: any[];
  tahun: number;
  semester: number;
}

export default function ModalAnggotaEskul({ open, onClose, eskul, siswa, anggota, tahun, semester }: ModalAnggotaEskulProps) {
  const { showToast } = useToast();
  const [localAnggota, setLocalAnggota] = useState<any[]>([]);
  const [leftChecked, setLeftChecked] = useState<Set<number>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<number>>(new Set());
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && eskul) {
      setLocalAnggota(anggota.filter((a: any) => a.id_eskul === eskul.id_eskul));
      setLeftChecked(new Set());
      setRightChecked(new Set());
      setLeftSearch('');
      setRightSearch('');
    }
  }, [open, eskul?.id_eskul, anggota]);

  const anggotaIds = useMemo(() => new Set(localAnggota.map((a: any) => a.id_siswa)), [localAnggota]);

  const leftData = useMemo(() => {
    const q = leftSearch.toLowerCase();
    return siswa.filter((s: any) => !anggotaIds.has(s.id_siswa) && (
      !q || s.nama_siswa.toLowerCase().includes(q) || s.nisn?.toLowerCase().includes(q)
    ));
  }, [siswa, anggotaIds, leftSearch]);

  const rightData = useMemo(() => {
    const q = rightSearch.toLowerCase();
    return localAnggota.filter((a: any) => (
      !q || a.nama_siswa?.toLowerCase().includes(q) || a.nisn?.toLowerCase().includes(q)
    ));
  }, [localAnggota, rightSearch]);

  if (!open || !eskul) return null;

  const toggleLeft = (id: number) => {
    setLeftChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleRight = (id: number) => {
    setRightChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllLeft = () => {
    if (leftChecked.size === leftData.length) {
      setLeftChecked(new Set());
    } else {
      setLeftChecked(new Set(leftData.map((s: any) => s.id_siswa)));
    }
  };

  const toggleAllRight = () => {
    if (rightChecked.size === rightData.length) {
      setRightChecked(new Set());
    } else {
      setRightChecked(new Set(rightData.map((a: any) => a.id_siswa)));
    }
  };

  const handleAdd = async () => {
    if (leftChecked.size === 0) return;
    setLoading(true);
    let added = 0;
    let failed = 0;

    for (const idSiswa of leftChecked) {
      const fd = new FormData();
      fd.set('id_eskul', String(eskul.id_eskul));
      fd.set('id_siswa', String(idSiswa));
      fd.set('tahun', String(tahun));
      fd.set('semester', String(semester));
      const result = await addSiswaEkstra(fd);
      if (result.success) {
        const s = siswa.find((x: any) => x.id_siswa === idSiswa);
        setLocalAnggota((prev) => [...prev, { id_siswa: idSiswa, nama_siswa: s?.nama_siswa || '', nisn: s?.nisn || '' }]);
        added++;
      } else {
        failed++;
      }
    }

    setLeftChecked(new Set());
    if (added > 0) showToast(`${added} anggota berhasil ditambahkan!`, 'success');
    if (failed > 0) showToast(`${failed} gagal ditambahkan`, 'error');
    setLoading(false);
  };

  const handleRemove = async () => {
    if (rightChecked.size === 0) return;
    setLoading(true);
    let removed = 0;

    for (const idSiswa of rightChecked) {
      const anggotaRow = localAnggota.find((a: any) => a.id_siswa === idSiswa);
      if (anggotaRow?.id_siswa_eskul) {
        const result = await removeSiswaEkstra(anggotaRow.id_siswa_eskul);
        if (result.success) removed++;
      }
    }

    setLocalAnggota((prev) => prev.filter((a: any) => !rightChecked.has(a.id_siswa)));
    setRightChecked(new Set());
    if (removed > 0) showToast(`${removed} anggota berhasil dihapus!`, 'success');
    setLoading(false);
  };



  const renderPanel = (
    items: any[],
    checked: Set<number>,
    onToggle: (id: number) => void,
    onToggleAll: () => void,
    allChecked: boolean,
    isLeft: boolean
  ) => (
    <div className="flex-1 border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden bg-white">
      <div className="bg-[#F8F9FB] px-3 py-2 border-b border-[rgba(0,0,0,0.06)] flex items-center gap-2">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={onToggleAll}
          className="accent-[#DC2626] w-3.5 h-3.5 cursor-pointer"
        />
        <input
          type="text"
          placeholder="Cari siswa..."
          value={isLeft ? leftSearch : rightSearch}
          onChange={(e) => isLeft ? setLeftSearch(e.target.value) : setRightSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        <span className="text-xs text-[#6B7280] whitespace-nowrap">{items.length}</span>
      </div>
      <div className="h-64 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-[#6B7280]">
            {isLeft ? 'Semua siswa sudah jadi anggota' : 'Belum ada anggota'}
          </div>
        ) : (
          items.map((item: any) => {
            const id = item.id_siswa;
            const isChecked = checked.has(id);
            return (
              <label
                key={id}
                className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer border-b border-[rgba(0,0,0,0.03)] transition-colors ${isChecked ? 'bg-[#DC2626]/5' : 'hover:bg-[#F8F9FB]'}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(id)}
                  className="accent-[#DC2626] w-3.5 h-3.5 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#1A1A2E] truncate">{item.nama_siswa}</div>
                  <div className="text-xs text-[#6B7280]">{item.nisn || '-'}</div>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-5xl mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">
            Kelola Anggota — {eskul.nama_eskul}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-stretch gap-4">
            <div className="flex-1 text-sm font-medium text-[#1A1A2E]/80 mb-2 hidden">Siswa Tersedia</div>
            {renderPanel(leftData, leftChecked, toggleLeft, toggleAllLeft, leftChecked.size === leftData.length && leftData.length > 0, true)}

            <div className="flex flex-col items-center justify-center gap-2">
              <button
                onClick={handleAdd}
                disabled={leftChecked.size === 0 || loading}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.95]"
                title="Tambah terpilih"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button
                onClick={handleRemove}
                disabled={rightChecked.size === 0 || loading}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.95]"
                title="Hapus terpilih"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>

            {renderPanel(rightData, rightChecked, toggleRight, toggleAllRight, rightChecked.size === rightData.length && rightData.length > 0, false)}
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] transition-all">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
