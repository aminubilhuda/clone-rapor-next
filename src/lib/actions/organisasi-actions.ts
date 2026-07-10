'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateOrganisasi(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_organisasi') as string;
  const nama = formData.get('nama_organisasi') as string;
  const kode = formData.get('kode') as string;

  try {
    if (id) {
      await pool.query('UPDATE organisasi SET nama_organisasi = ?, kode = ? WHERE id_organisasi = ?', [nama, kode, id]);
    } else {
      await pool.query('INSERT INTO organisasi (nama_organisasi, kode) VALUES (?, ?)', [nama, kode]);
    }

    revalidatePath('/tu/organisasi');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteOrganisasi(id: number) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM organisasi WHERE id_organisasi = ?', [id]);
    revalidatePath('/tu/organisasi');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}

export async function updatePembinaOrganisasi(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idOrganisasi = formData.get('id_organisasi') as string;
  const idUser = formData.get('id_user') as string;
  const tahun = formData.get('tahun') as string;
  const semester = formData.get('semester') as string;

  try {
    const [existing]: any = await pool.query(
      'SELECT id_pembina_organisasi FROM pembina_organisasi WHERE id_organisasi = ? AND tahun = ? AND semester = ?',
      [idOrganisasi, tahun, semester]
    );

    if (idUser) {
      if (existing.length > 0) {
        await pool.query('UPDATE pembina_organisasi SET id_user = ? WHERE id_pembina_organisasi = ?', [idUser, existing[0].id_pembina_organisasi]);
      } else {
        await pool.query(
          'INSERT INTO pembina_organisasi (tahun, semester, id_organisasi, id_user) VALUES (?, ?, ?, ?)',
          [tahun, semester, idOrganisasi, idUser]
        );
      }
    } else {
      if (existing.length > 0) {
        await pool.query('DELETE FROM pembina_organisasi WHERE id_pembina_organisasi = ?', [existing[0].id_pembina_organisasi]);
      }
    }

    revalidatePath('/tu/organisasi');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function addSiswaOrganisasi(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idOrganisasi = formData.get('id_organisasi') as string;
  const idSiswa = formData.get('id_siswa') as string;
  const tahun = formData.get('tahun') as string;
  const semester = formData.get('semester') as string;

  try {
    const [existing]: any = await pool.query(
      'SELECT id_siswa_organisasi FROM siswa_organisasi WHERE id_organisasi = ? AND id_siswa = ? AND tahun = ? AND semester = ?',
      [idOrganisasi, idSiswa, tahun, semester]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Siswa sudah terdaftar di organisasi ini' } as const;
    }

    await pool.query(
      'INSERT INTO siswa_organisasi (tahun, semester, id_organisasi, id_siswa) VALUES (?, ?, ?, ?)',
      [tahun, semester, idOrganisasi, idSiswa]
    );

    revalidatePath('/tu/organisasi');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menambah anggota' } as const;
  }
}

export async function removeSiswaOrganisasi(id: number) {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM siswa_organisasi WHERE id_siswa_organisasi = ?', [id]);
    revalidatePath('/tu/organisasi');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus anggota' } as const;
  }
}
