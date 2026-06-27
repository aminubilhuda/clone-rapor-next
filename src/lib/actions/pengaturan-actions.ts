'use server'

import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function savePengaturan(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const
  }

  const tanggal_rapor = formData.get('tanggal_rapor') as string
  const tanggal_mid = formData.get('tanggal_mid') as string
  const lokasi = formData.get('lokasi') as string
  const tahun = formData.get('tahun') as string
  const semester = formData.get('semester') as string

  try {
    await pool.query(
      'UPDATE sekolah SET lokasi = ?, tahun = ?, semester = ? WHERE id_sekolah = 1',
      [lokasi, tahun, semester]
    )

    const [existing]: any = await pool.query(
      'SELECT * FROM pembagian_raport WHERE tahun = ? AND semester = ?',
      [tahun, semester]
    )

    if (existing.length > 0) {
      await pool.query(
        'UPDATE pembagian_raport SET tanggal_rapor = ?, tanggal_mid = ? WHERE tahun = ? AND semester = ?',
        [tanggal_rapor, tanggal_mid, tahun, semester]
      )
    } else {
      await pool.query(
        'INSERT INTO pembagian_raport (tahun, semester, tanggal_rapor, tanggal_mid) VALUES (?, ?, ?, ?)',
        [tahun, semester, tanggal_rapor, tanggal_mid]
      )
    }

    revalidatePath('/tu/pengaturan')
    return { success: true } as const
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menyimpan pengaturan' } as const
  }
}

export async function addTahunPelajaran(nama: string) {
  const session = await auth()
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const
  }

  try {
    await pool.query('INSERT INTO tahun_pelajaran (tahun_pelajaran) VALUES (?)', [nama])
    revalidatePath('/tu/pengaturan')
    return { success: true } as const
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menambah tahun pelajaran' } as const
  }
}

export async function deleteTahunPelajaran(id: number) {
  const session = await auth()
  if (!session?.user || session.user.jabatan !== 2) {
    return { success: false, error: 'Unauthorized' } as const
  }

  try {
    await pool.query('DELETE FROM tahun_pelajaran WHERE id_tahun_pelajaran = ?', [id])
    revalidatePath('/tu/pengaturan')
    return { success: true } as const
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menghapus tahun pelajaran' } as const
  }
}
