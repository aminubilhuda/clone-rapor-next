'use client';

import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal';

interface ModalHapusProps {
  open: boolean;
  onClose: () => void;
  ekstra: any | null;
  onConfirm: () => Promise<void>;
}

export default function ModalHapus({ open, onClose, ekstra, onConfirm }: ModalHapusProps) {
  return (
    <ConfirmDeleteModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      entityName={ekstra?.nama_eskul}
    />
  );
}
