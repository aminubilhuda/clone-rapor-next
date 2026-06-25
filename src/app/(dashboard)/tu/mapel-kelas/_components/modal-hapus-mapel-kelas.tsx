'use client';

import { useState } from 'react';

interface ModalHapusProps {
  open: boolean;
  onClose: () => void;
  mapelKelas: any | null;
  onConfirm: () => Promise<void>;
}

export default function ModalHapus({ open, onClose, mapelKelas, onConfirm }: ModalHapusProps) {
  const [deleting, setDeleting] = useState(false);

  if (!open || !mapelKelas) return null;

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl premium-shadow-lg w-full max-w-md mx-4 animate-modal-in border border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A2E]">Konfirmasi Hapus</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-start gap-3 text-yellow-800 bg-yellow-50/80 rounded-xl p-4 mb-4 text-sm border border-yellow-200/50">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Data yang dihapus tidak dapat dikembalikan.</span>
          </div>
          <p className="text-gray-700 text-sm">
            Apakah kamu yakin ingin menghapus <strong>{mapelKelas.nama_mapel}</strong> di kelas <strong>{mapelKelas.nama_kelas}</strong>?
          </p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(0,0,0,0.04)]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#1A1A2E]/60 bg-[#F8F9FB] rounded-xl hover:bg-[#F8F9FB]/80 border border-[rgba(0,0,0,0.06)] active:scale-[0.98] transition-all">
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-xl hover:bg-[#B91C1C] active:scale-[0.98] transition-all"
          >
            {deleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
