'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updatePegawai(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_user') as string;
  const nama = formData.get('nama') as string;
  const nip = formData.get('nip') as string;
  const nuptk = formData.get('nuptk') as string;
  const kontak = formData.get('kontak') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const jabatan = formData.get('jabatan') as string;
  const kelamin = formData.get('kelamin') as string;
  const agama = formData.get('agama') as string;
  const idKepegawaian = formData.get('id_kepegawaian') as string;
  const idTugasTambahan = formData.get('id_tugas_tambahan') as string;

  try {
    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    if (id) {
      // Update
      await pool.query(
        `UPDATE users SET
          nama = ?, nip = ?, nuptk = ?, kontak = ?,
          username = ?, jabatan = ?, kelamin = ?,
          agama = ?, id_kepegawaian = ?, id_tugas_tambahan = ?,
          password = ?
        WHERE id_user = ?`,
        [nama, nip, nuptk || '', kontak, username, jabatan, kelamin, agama, idKepegawaian, idTugasTambahan, hashedPassword || '', id]
      );
    } else {
      // Insert
      await pool.query(
        `INSERT INTO users (nama, nip, nuptk, kontak, username, password, jabatan, kelamin, agama, id_kepegawaian, id_tugas_tambahan, moto)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [nama, nip, nuptk || '', kontak, username, hashedPassword, jabatan, kelamin, agama, idKepegawaian, idTugasTambahan]
      );
    }

    revalidatePath('/tu/pegawai');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deletePegawai(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('UPDATE users SET deleted_at = NOW() WHERE id_user = ?', [id]);
    revalidatePath('/tu/pegawai');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}
