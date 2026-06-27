import Swal from 'sweetalert2'

export function confirmAlert(title: string, text: string): Promise<boolean> {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#DC2626',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal',
    customClass: { popup: 'rounded-2xl' },
  }).then((r) => r.isConfirmed)
}
