'use client';

import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal';

interface ModalHapusProps {
  open: boolean;
  onClose: () => void;
  siswa: any | null;
  onConfirm: () => Promise<void>;
}

export default function ModalHapus({ open, onClose, siswa, onConfirm }: ModalHapusProps) {
  return (
    <ConfirmDeleteModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      entityName={siswa?.nama_siswa}
      warning="Siswa yang dihapus akan dinonaktifkan dan tidak muncul di data aktif."
    />
  );
}
