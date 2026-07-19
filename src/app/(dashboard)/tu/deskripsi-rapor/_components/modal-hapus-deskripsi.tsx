'use client';

import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal';

interface ModalHapusProps {
  open: boolean;
  onClose: () => void;
  deskripsi: any | null;
  onConfirm: () => Promise<void>;
}

export default function ModalHapus({ open, onClose, deskripsi, onConfirm }: ModalHapusProps) {
  return (
    <ConfirmDeleteModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      entityName={deskripsi?.kriteria}
    />
  );
}
