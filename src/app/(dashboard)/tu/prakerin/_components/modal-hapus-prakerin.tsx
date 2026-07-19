'use client';

import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal';

interface ModalHapusProps {
  open: boolean;
  onClose: () => void;
  prakerin: any | null;
  onConfirm: () => Promise<void>;
}

export default function ModalHapus({ open, onClose, prakerin, onConfirm }: ModalHapusProps) {
  return (
    <ConfirmDeleteModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      entityName={prakerin ? `prakerin mitra ${prakerin.mitra}` : null}
    />
  );
}
