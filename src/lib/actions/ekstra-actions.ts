'use server';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateEkstra(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_eskul') as string;
  const namaEskul = formData.get('nama_eskul') as string;
  const kode = formData.get('kode') as string;

  try {
    if (id) {
      await pool.query('UPDATE eskul SET nama_eskul = ?, kode = ? WHERE id_eskul = ?', [namaEskul, kode, id]);
    } else {
      await pool.query('INSERT INTO eskul (nama_eskul, kode, id_sekolah) VALUES (?, ?, 1)', [namaEskul, kode]);
    }

    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function deleteEkstra(id: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM eskul WHERE id_eskul = ?', [id]);
    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus data' } as const;
  }
}

export async function updatePembinaEkstra(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idEskul = formData.get('id_eskul') as string;
  const idUser = formData.get('id_user') as string;
  const tahun = formData.get('tahun') as string;
  const semester = formData.get('semester') as string;

  try {
    const [existing]: any = await pool.query(
      'SELECT id_pembina_eskul FROM pembina_eskul WHERE id_eskul = ? AND tahun = ? AND semester = ?',
      [idEskul, tahun, semester]
    );

    if (idUser) {
      if (existing.length > 0) {
        await pool.query('UPDATE pembina_eskul SET id_user = ? WHERE id_pembina_eskul = ?', [idUser, existing[0].id_pembina_eskul]);
      } else {
        await pool.query(
          'INSERT INTO pembina_eskul (tahun, semester, id_eskul, id_user) VALUES (?, ?, ?, ?)',
          [tahun, semester, idEskul, idUser]
        );
      }
    } else {
      if (existing.length > 0) {
        await pool.query('DELETE FROM pembina_eskul WHERE id_pembina_eskul = ?', [existing[0].id_pembina_eskul]);
      }
    }

    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan data' } as const;
  }
}

export async function addSiswaEkstra(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const idEskul = formData.get('id_eskul') as string;
  const idSiswa = formData.get('id_siswa') as string;
  const tahun = formData.get('tahun') as string;
  const semester = formData.get('semester') as string;
  const predikat = formData.get('predikat') as string || '';
  const keterangan = formData.get('keterangan') as string || '';

  try {
    const [existing]: any = await pool.query(
      'SELECT id_siswa_eskul FROM siswa_eskul WHERE id_eskul = ? AND id_siswa = ? AND tahun = ? AND semester = ?',
      [idEskul, idSiswa, tahun, semester]
    );
    if (existing.length > 0) {
      return { success: false, error: 'Siswa sudah terdaftar di ekstrakurikuler ini' } as const;
    }

    await pool.query(
      'INSERT INTO siswa_eskul (tahun, semester, id_eskul, id_siswa, predikat, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
      [tahun, semester, idEskul, idSiswa, predikat, keterangan]
    );

    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menambah anggota' } as const;
  }
}

export async function removeSiswaEkstra(idSiswaEkstra: number) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    await pool.query('DELETE FROM siswa_eskul WHERE id_siswa_eskul = ?', [idSiswaEkstra]);
    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus anggota' } as const;
  }
}

export async function updateSiswaEkstra(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  const id = formData.get('id_siswa_eskul') as string;
  const predikat = formData.get('predikat') as string || '';
  const keterangan = formData.get('keterangan') as string || '';

  try {
    await pool.query(
      'UPDATE siswa_eskul SET predikat = ?, keterangan = ? WHERE id_siswa_eskul = ?',
      [predikat, keterangan, id]
    );
    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal mengupdate anggota' } as const;
  }
}

export async function bulkUpdateSiswaEkstra(items: { id_siswa_eskul: number; predikat: string; keterangan: string }[]) {
  const session = await auth();
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const;
  }

  try {
    for (const item of items) {
      await pool.query(
        'UPDATE siswa_eskul SET predikat = ?, keterangan = ? WHERE id_siswa_eskul = ?',
        [item.predikat || '', item.keterangan || '', item.id_siswa_eskul]
      );
    }
    revalidatePath('/tu/ekstra');
    return { success: true } as const;
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan nilai' } as const;
  }
}
