'use server';

import { requireTuAdmin } from '@/lib/actions/auth-guard';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updatePegawai(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error || !authResult.user) return { success: false, error: authResult.error } as const;

  const actorJabatan = authResult.user.jabatan;

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

  const jabatanNum = Number(jabatan);
  if (![1, 2, 3].includes(jabatanNum)) {
    return { success: false, error: 'Jabatan tidak valid' } as const;
  }

  if (!id) {
    if (!nama?.trim() || !username?.trim() || !password) {
      return { success: false, error: 'Nama, username, dan password wajib diisi' } as const;
    }
  }

  if (jabatanNum === 1 && actorJabatan !== 1) {
    return { success: false, error: 'Hanya super admin yang dapat menetapkan jabatan super admin' } as const;
  }

  try {
    if (id) {
      const [targetRows]: any = await pool.query(
        'SELECT jabatan FROM users WHERE id_user = ? AND deleted_at IS NULL LIMIT 1',
        [id]
      );
      if (targetRows.length === 0) {
        return { success: false, error: 'Pengguna tidak ditemukan' } as const;
      }
      if (Number(targetRows[0].jabatan) === 1 && actorJabatan !== 1) {
        return { success: false, error: 'Hanya super admin yang dapat mengubah akun super admin' } as const;
      }
    }

    const [dupRows]: any = await pool.query(
      'SELECT id_user FROM users WHERE username = ? AND id_user != ? AND deleted_at IS NULL LIMIT 1',
      [username, id || 0]
    );
    if (dupRows.length > 0) {
      return { success: false, error: 'Username sudah digunakan' } as const;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    if (id) {
      const fields = [
        'nama = ?', 'nip = ?', 'nuptk = ?', 'kontak = ?',
        'username = ?', 'jabatan = ?', 'kelamin = ?',
        'agama = ?', 'id_kepegawaian = ?', 'id_tugas_tambahan = ?',
      ];
      const values: any[] = [nama, nip, nuptk || '', kontak, username, jabatanNum, kelamin, agama, idKepegawaian, idTugasTambahan];

      if (hashedPassword) {
        fields.push('password = ?');
        values.push(hashedPassword);
      }

      values.push(id);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id_user = ?`, values);
    } else {
      await pool.query(
        `INSERT INTO users (nama, nip, nuptk, kontak, username, password, jabatan, kelamin, agama, id_kepegawaian, id_tugas_tambahan, moto)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [nama, nip, nuptk || '', kontak, username, hashedPassword, jabatanNum, kelamin, agama, idKepegawaian, idTugasTambahan]
      );
    }

    revalidatePath('/tu/pegawai');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan data' } as const;
  }
}

export async function deletePegawai(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    await pool.query('UPDATE users SET deleted_at = NOW() WHERE id_user = ?', [id]);
    revalidatePath('/tu/pegawai');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}
