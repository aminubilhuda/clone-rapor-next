'use client';

import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal';

interface ModalHapusProps {
  open: boolean;
  onClose: () => void;
  mapelKelas: any | null;
  onConfirm: () => Promise<void>;
}

export default function ModalHapus({ open, onClose, mapelKelas, onConfirm }: ModalHapusProps) {
  const entityName = mapelKelas
    ? `${mapelKelas.nama_mapel} di kelas ${mapelKelas.nama_kelas}`
    : null;
  return (
    <ConfirmDeleteModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      entityName={entityName}
    />
  );
}
