'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateSiswa(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_siswa') as string;
  const namaSiswa = formData.get('nama_siswa') as string;
  const nis = formData.get('nis') as string;
  const nisn = formData.get('nisn') as string;
  const tempatLahir = formData.get('tempat_lahir') as string;
  const tanggalLahir = formData.get('tanggal_lahir') as string;
  const kelamin = formData.get('kelamin') as string;
  const agama = formData.get('agama') as string;
  const kontakSiswa = formData.get('kontak_siswa') as string;
  const alamat = formData.get('alamat') as string;
  const jurusan = formData.get('jurusan') as string;
  const terimaKelas = formData.get('terima_kelas') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    if (id) {
      // Update
      await pool.query(
        `UPDATE siswa SET
          nama_siswa = ?, nis = ?, nisn = ?, tempat_lahir = ?,
          tanggal_lahir = ?, kelamin = ?, agama = ?,
          kontak_siswa = ?, alamat = ?, jurusan = ?,
          terima_kelas = ?, username = ?, password = ?
        WHERE id_siswa = ?`,
        [namaSiswa, nis, nisn, tempatLahir, tanggalLahir || null, kelamin, agama, kontakSiswa, alamat, jurusan, terimaKelas, username, password || '', id]
      );
    } else {
      // Insert
      await pool.query(
        `INSERT INTO siswa (nama_siswa, nis, nisn, tempat_lahir, tanggal_lahir, kelamin, agama, kontak_siswa, alamat, jurusan, terima_kelas, username, password, aktif, terima_tingkat)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, SUBSTRING(?, 1, 2))`,
        [namaSiswa, nis, nisn, tempatLahir, tanggalLahir || null, kelamin, agama, kontakSiswa, alamat, jurusan, terimaKelas, username, password, terimaKelas]
      );
    }

    revalidatePath('/tu/kesiswaan');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteSiswa(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('UPDATE siswa SET deleted_at = NOW() WHERE id_siswa = ?', [id]);
    await pool.query('UPDATE siswa_kelas SET deleted_at = NOW() WHERE id_siswa = ?', [id]);
    await pool.query('UPDATE mapel_siswa SET deleted_at = NOW() WHERE id_siswa = ?', [id]);
    revalidatePath('/tu/kesiswaan');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
