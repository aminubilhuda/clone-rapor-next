'use server'

import { requireTuAdmin } from '@/lib/actions/auth-guard'
import { pool, withTransaction } from '@/lib/db'
import { SEKOLAH_ID } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

export async function savePengaturan(formData: FormData) {
  const authResult = await requireTuAdmin()
  if (authResult.error) return { success: false, error: authResult.error } as const

  const tanggal_rapor = formData.get('tanggal_rapor') as string
  const tanggal_mid = formData.get('tanggal_mid') as string
  const lokasi = formData.get('lokasi') as string
  const tahun = formData.get('tahun') as string
  const semester = formData.get('semester') as string

  const tahunNum = Number(tahun)
  const semesterNum = Number(semester)
  if (!Number.isInteger(tahunNum) || tahunNum <= 0 || (semesterNum !== 1 && semesterNum !== 2)) {
    return { success: false, error: 'Periode tidak valid' } as const
  }

  try {
    await withTransaction(async (conn) => {
      await conn.query(
        'UPDATE sekolah SET lokasi = ?, tahun = ?, semester = ? WHERE id_sekolah = ?',
        [lokasi, tahunNum, semesterNum, SEKOLAH_ID]
      )

      const [existing]: any = await conn.query(
        'SELECT * FROM pembagian_raport WHERE tahun = ? AND semester = ?',
        [tahunNum, semesterNum]
      )

      if (existing.length > 0) {
        await conn.query(
          'UPDATE pembagian_raport SET tanggal_rapor = ?, tanggal_mid = ? WHERE tahun = ? AND semester = ?',
          [tanggal_rapor, tanggal_mid, tahunNum, semesterNum]
        )
      } else {
        await conn.query(
          'INSERT INTO pembagian_raport (tahun, semester, tanggal_rapor, tanggal_mid) VALUES (?, ?, ?, ?)',
          [tahunNum, semesterNum, tanggal_rapor, tanggal_mid]
        )
      }
    })

    revalidatePath('/tu/pengaturan')
    return { success: true } as const
  } catch (e: any) {
    return { success: false, error: 'Gagal menyimpan pengaturan' } as const
  }
}

export async function addTahunPelajaran(nama: string) {
  const authResult = await requireTuAdmin()
  if (authResult.error) return { success: false, error: authResult.error } as const

  const trimmed = (nama || '').trim()
  if (!/^\d{4}\/\d{4}$/.test(trimmed)) {
    return { success: false, error: 'Format tahun pelajaran harus YYYY/YYYY' } as const
  }

  try {
    const [dupRows]: any = await pool.query(
      'SELECT id_tahun_pelajaran FROM tahun_pelajaran WHERE tahun_pelajaran = ? LIMIT 1',
      [trimmed]
    )
    if (dupRows.length > 0) {
      return { success: false, error: 'Tahun pelajaran sudah ada' } as const
    }

    await pool.query('INSERT INTO tahun_pelajaran (tahun_pelajaran) VALUES (?)', [trimmed])
    revalidatePath('/tu/pengaturan')
    return { success: true } as const
  } catch (e: any) {
    return { success: false, error: 'Gagal menambah tahun pelajaran' } as const
  }
}

export async function deleteTahunPelajaran(id: number) {
  const authResult = await requireTuAdmin()
  if (authResult.error) return { success: false, error: authResult.error } as const

  try {
    await pool.query('DELETE FROM tahun_pelajaran WHERE id_tahun_pelajaran = ?', [id])
    revalidatePath('/tu/pengaturan')
    return { success: true } as const
  } catch (e: any) {
    return { success: false, error: 'Gagal menghapus tahun pelajaran' } as const
  }
}
