'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';

async function saveProfileFile(file: File, currentFilename: string | null): Promise<string | null> {
  if (!file || file.size === 0) return currentFilename;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `profile_${Date.now()}.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'profile');
  const filepath = join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filepath, buffer);

  if (currentFilename) {
    try {
      const oldPath = join(uploadDir, currentFilename);
      await unlink(oldPath);
    } catch {}
  }

  return filename;
}

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idUser = session.user.id_user;
  const nama = formData.get('nama') as string;
  const nip = formData.get('nip') as string;
  const nuptk = formData.get('nuptk') as string;
  const kontak = formData.get('kontak') as string;
  const username = formData.get('username') as string;
  const newPassword = formData.get('new_password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (!nama?.trim()) {
    return { success: false, error: 'Nama wajib diisi' } as const;
  }

  if (!username?.trim()) {
    return { success: false, error: 'Username wajib diisi' } as const;
  }

  if (newPassword && newPassword !== confirmPassword) {
    return { success: false, error: 'Password baru tidak cocok' } as const;
  }

  if (newPassword && newPassword.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter' } as const;
  }

  try {
    // Check username uniqueness
    const [existingUsername]: any = await pool.query(
      'SELECT id_user FROM users WHERE username = ? AND id_user != ?',
      [username, idUser]
    );
    if (existingUsername.length > 0) {
      return { success: false, error: 'Username sudah digunakan' } as const;
    }

    // Handle foto upload
    const fotoFile = formData.get('foto_file') as File;
    const [currentFoto]: any = await pool.query('SELECT foto FROM users WHERE id_user = ?', [idUser]);
    let fotoFilename = currentFoto[0]?.foto || '';

    if (fotoFile && fotoFile.size > 0) {
      const saved = await saveProfileFile(fotoFile, fotoFilename);
      fotoFilename = saved || '';
    }

    // Update query
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query(
        'UPDATE users SET nama = ?, nip = ?, nuptk = ?, kontak = ?, username = ?, password = ?, foto = ? WHERE id_user = ?',
        [nama.trim(), nip || '', nuptk || '', kontak || '', username.trim(), hashedPassword, fotoFilename, idUser]
      );
    } else {
      await pool.query(
        'UPDATE users SET nama = ?, nip = ?, nuptk = ?, kontak = ?, username = ?, foto = ? WHERE id_user = ?',
        [nama.trim(), nip || '', nuptk || '', kontak || '', username.trim(), fotoFilename, idUser]
      );
    }

    revalidatePath('/profile');
    revalidatePath('/tu');
    revalidatePath('/guru');
    return { success: true } as const;
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Username sudah digunakan' } as const;
    }
    return { success: false, error: 'Gagal menyimpan profil' } as const;
  }
}
