'use client';

import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal';

interface ModalHapusProps {
  open: boolean;
  onClose: () => void;
  p5bk: any | null;
  onConfirm: () => Promise<void>;
}

export default function ModalHapus({ open, onClose, p5bk, onConfirm }: ModalHapusProps) {
  return (
    <ConfirmDeleteModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      entityName={p5bk ? `P5BK ${p5bk.judul_proyek}` : null}
    />
  );
}
