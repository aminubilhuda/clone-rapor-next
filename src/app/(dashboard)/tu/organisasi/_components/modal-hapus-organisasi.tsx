'use client';

import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal';

interface ModalHapusProps {
  open: boolean;
  onClose: () => void;
  organisasi: any | null;
  onConfirm: () => Promise<void>;
}

export default function ModalHapusOrganisasi({ open, onClose, organisasi, onConfirm }: ModalHapusProps) {
  return (
    <ConfirmDeleteModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      entityName={organisasi?.nama_organisasi}
    />
  );
}
