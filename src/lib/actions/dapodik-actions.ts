'use server'

import { requireTuAdmin } from '@/lib/actions/auth-guard'
import { pool } from '@/lib/db'
import { SEKOLAH_ID } from '@/lib/constants'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { getDapodikSyncStatus } from '@/lib/dapodik-status'
import {
  fetchDapodik,
  fetchDapodikSingle,
  type DapodikConnection,
} from '@/lib/dapodik/client'
import {
  buatSingkatan,
  jurusanMatch,
  mapGuru,
  mapJurusan,
  mapKelas,
  mapKelasWali,
  mapMapel,
  mapMapelKelas,
  mapSekolah,
  mapSiswa,
  norm,
  parseSemesterId,
  resolveAgama,
} from '@/lib/dapodik/mapper'

const REVALIDATE = [
  '/tu/kesiswaan',
  '/tu/pegawai',
  '/tu/rombel',
  '/tu/mapel',
  '/tu/mapel-kelas',
  '/tu/anggota-kelas',
  '/tu/kompetensi',
  '/tu/singkron-dapodik',
]

export interface SyncEntityResult {
  entity: string
  endpoint: string
  inserted: number
  updated: number
  skipped: number
  error_msg: string | null
}

async function getConnection(): Promise<DapodikConnection> {
  const [rows]: any = await pool.query(
    'SELECT url, token, npsn FROM dapodik_config WHERE id = 1 LIMIT 1'
  )
  const cfg = rows?.[0]
  if (!cfg || !cfg.url || !cfg.token || !cfg.npsn) {
    throw new Error('Konfigurasi DAPODIK belum lengkap. Isi URL, token, dan NPSN terlebih dahulu.')
  }
  return { url: cfg.url, token: cfg.token, npsn: cfg.npsn }
}

async function setSyncStatus(syncing: boolean, progress: string | null = null) {
  try {
    if (syncing) {
      await pool.query(
        'UPDATE dapodik_config SET syncing = 1, sync_started_at = NOW(), sync_progress = ? WHERE id = 1',
        [progress]
      )
    } else {
      await pool.query('UPDATE dapodik_config SET syncing = 0, sync_progress = NULL WHERE id = 1')
    }
  } catch (e) {
    console.error('setSyncStatus error:', e)
  }
}

export async function getDapodikConfig() {
  const authResult = await requireTuAdmin()
  if (authResult.error) return { config: null, logs: [] } as const

  try {
    const [cfgRows]: any = await pool.query(
      'SELECT * FROM dapodik_config WHERE id = 1 LIMIT 1'
    )
    const [logs]: any = await pool.query(
      'SELECT * FROM dapodik_log ORDER BY id DESC LIMIT 50'
    )
    return { config: cfgRows[0] || null, logs } as const
  } catch (e) {
    console.error('getDapodikConfig error:', e)
    return { config: null, logs: [] } as const
  }
}

export async function saveDapodikConfig(formData: FormData) {
  const authResult = await requireTuAdmin()
  if (authResult.error) return { success: false, error: authResult.error } as const

  const url = (formData.get('url') as string)?.trim()
  const token = (formData.get('token') as string)?.trim()
  const npsn = (formData.get('npsn') as string)?.trim()

  if (!url || !token || !npsn) {
    return { success: false, error: 'URL, token, dan NPSN wajib diisi' } as const
  }

  try {
    await pool.query(
      `INSERT INTO dapodik_config (id, url, token, npsn)
       VALUES (1, ?, ?, ?)
       ON DUPLICATE KEY UPDATE url = VALUES(url), token = VALUES(token), npsn = VALUES(npsn)`,
      [url, token, npsn]
    )
    revalidatePath('/tu/singkron-dapodik')
    return { success: true } as const
  } catch (e) {
    console.error('saveDapodikConfig error:', e)
    return { success: false, error: 'Gagal menyimpan konfigurasi DAPODIK' } as const
  }
}

export async function testDapodikConnection(url?: string, token?: string, npsn?: string) {
  const authResult = await requireTuAdmin()
  if (authResult.error) return { success: false, message: authResult.error } as const

  try {
    const conn = url && token && npsn ? { url, token, npsn } : await getConnection()

    const sekolah = await fetchDapodikSingle<any>(conn, 'getSekolah')
    const nama = sekolah?.nama || '(tanpa nama)'
    const npsnApi = sekolah?.npsn || ''
    const match = !npsnApi || npsnApi === conn.npsn
    return {
      success: true,
      message: `Koneksi berhasil — ${nama} (NPSN ${npsnApi})${match ? '' : ' — perhatian: NPSN tidak cocok dengan konfigurasi!'}`,
    } as const
  } catch (e: any) {
    return { success: false, message: e?.message || 'Gagal terhubung ke server DAPODIK' } as const
  }
}

export async function cekPeriodeDapodik() {
  const authResult = await requireTuAdmin()
  if (authResult.error) return { ok: false, error: authResult.error } as const

  try {
    const conn = await getConnection()
    const rombels = await fetchDapodik<any>(conn, 'getRombonganBelajar')
    const rombelKelas = rombels.filter((r: any) => r.jenis_rombel_str === 'Kelas')
    const parsed = parseSemesterId(rombelKelas[0]?.semester_id)
    if (!parsed) {
      return { ok: false, error: 'Tidak dapat mendeteksi tahun/semester dari data DAPODIK.' } as const
    }

    const label = `${parsed.tahun}-${parsed.tahun + 1}`
    const [tpRows]: any = await pool.query(
      `SELECT id_tahun_pelajaran FROM tahun_pelajaran
       WHERE tahun_pelajaran LIKE ? AND deleted_at IS NULL LIMIT 1`,
      [`${parsed.tahun}-%`]
    )
    const [sekolahRows]: any = await pool.query(
      'SELECT tahun, semester FROM sekolah WHERE id_sekolah = ?',
      [SEKOLAH_ID]
    )
    const [tpAktifRows]: any = await pool.query(
      `SELECT tahun_pelajaran FROM tahun_pelajaran
       WHERE id_tahun_pelajaran = ? AND deleted_at IS NULL LIMIT 1`,
      [sekolahRows[0]?.tahun ?? 0]
    )

    return {
      ok: true,
      detected: {
        label,
        semester: parsed.semester === 2 ? 'Genap' : 'Ganjil',
      },
      adaDiLokal: tpRows.length > 0,
      periodeAktif: {
        label: tpAktifRows[0]?.tahun_pelajaran || '-',
        semester: Number(sekolahRows[0]?.semester) === 2 ? 'Genap' : 'Ganjil',
      },
    } as const
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Gagal memeriksa periode DAPODIK' } as const
  }
}

async function writeLog(runId: string, entry: SyncEntityResult) {
  try {
    await pool.query(
      `INSERT INTO dapodik_log (run_id, endpoint, entity, inserted, updated, skipped, error_msg)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [runId, entry.endpoint, entry.entity, entry.inserted, entry.updated, entry.skipped, entry.error_msg]
    )
  } catch (e) {
    console.error('writeLog error:', e)
  }
}

type DetailRow = [string, string, string | null] // [status, label, keterangan]

async function flushDetail(runId: string, entity: string, rows: DetailRow[]) {
  if (rows.length === 0) return
  try {
    await pool.query(
      'INSERT INTO dapodik_log_detail (run_id, entity, status, label, keterangan) VALUES ?',
      [rows.map(([status, label, keterangan]) => [runId, entity, status, label, keterangan])]
    )
  } catch (e) {
    console.error('flushDetail error:', e)
  }
}

function addDetail(rows: DetailRow[], status: string, label: string, keterangan: string | null = null) {
  rows.push([status, label, keterangan])
}

function findKkIdByMatch(nama: string, kkRows: any[]): number | null {
  const found = kkRows.find((kk) => jurusanMatch(nama, kk.kompetensi_keahlian, kk.deskripsi))
  return found ? found.id_kompetensi_keahlian : null
}

interface SyncContext {
  periode: { idTahun: number; semester: number }
  kkMap: Map<string, number>
  kelasMap: Map<string, number>
  kelasTingkatMap: Map<number, number>
  kelasKkMap: Map<number, number>
  mapelMap: Map<string, number>
  userMap: Map<string, number>
  siswaMap: Map<string, number>
}

export async function syncDapodik(formData: FormData) {
  const authResult = await requireTuAdmin()
  if (authResult.error) return { success: false, error: authResult.error, summary: [] } as const

  const want = (name: string) => formData.get(name) === '1'
  const summary: SyncEntityResult[] = []
  const runId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

  try {
    const conn = await getConnection()
    await setSyncStatus(true, 'Langkah 0/9: Mengambil data dari server DAPODIK...')

    const sekolahRaw = await fetchDapodikSingle<any>(conn, 'getSekolah')
    const gtks = await fetchDapodik<any>(conn, 'getGtk')
    const rombels = await fetchDapodik<any>(conn, 'getRombonganBelajar')
    const pds = await fetchDapodik<any>(conn, 'getPesertaDidik')

    /* Periode aktif dari DAPODIK ("20252" -> tahun 2025, semester 2) */
    const rombelKelas = rombels.filter((r: any) => r.jenis_rombel_str === 'Kelas')
    let periode = { idTahun: 0, semester: 0 }
    let periodeAutoCreated = false
    let periodeLabel = ''
    const parsed = parseSemesterId(rombelKelas[0]?.semester_id)
    if (!parsed) {
      throw new Error(
        'Tidak dapat mendeteksi tahun/semester dari data DAPODIK. Pastikan server DAPODIK mengembalikan rombongan belajar dengan semester aktif.'
      )
    }
    periodeLabel = `${parsed.tahun}-${parsed.tahun + 1}`
    const [tpRows]: any = await pool.query(
      `SELECT id_tahun_pelajaran FROM tahun_pelajaran
       WHERE tahun_pelajaran LIKE ? AND deleted_at IS NULL LIMIT 1`,
      [`${parsed.tahun}-%`]
    )
    if (tpRows[0]?.id_tahun_pelajaran) {
      periode = { idTahun: tpRows[0].id_tahun_pelajaran, semester: parsed.semester }
    } else {
      /* Tahun pelajaran baru belum ada di lokal -> buat otomatis */
      try {
        const [res]: any = await pool.query(
          'INSERT INTO tahun_pelajaran (tahun_pelajaran) VALUES (?)',
          [periodeLabel]
        )
        periode = { idTahun: res.insertId, semester: parsed.semester }
        periodeAutoCreated = true
      } catch (e: any) {
        /* Kemungkinan race (sync dobel) -> coba cari ulang */
        const [tpAgain]: any = await pool.query(
          `SELECT id_tahun_pelajaran FROM tahun_pelajaran
           WHERE tahun_pelajaran = ? AND deleted_at IS NULL LIMIT 1`,
          [periodeLabel]
        )
        if (!tpAgain[0]) {
          throw new Error(`Gagal membuat tahun pelajaran ${periodeLabel}: ${e?.message || e}`)
        }
        periode = { idTahun: tpAgain[0].id_tahun_pelajaran, semester: parsed.semester }
      }
    }

    /* Periode aktif lama (sebelum sync) untuk laporan */
    const [sekolahAwalRows]: any = await pool.query(
      'SELECT tahun, semester FROM sekolah WHERE id_sekolah = ?',
      [SEKOLAH_ID]
    )
    const [tpAktifRows]: any = await pool.query(
      `SELECT tahun_pelajaran FROM tahun_pelajaran
       WHERE id_tahun_pelajaran = ? AND deleted_at IS NULL LIMIT 1`,
      [sekolahAwalRows[0]?.tahun ?? 0]
    )
    const periodeAktif = {
      label: tpAktifRows[0]?.tahun_pelajaran || '-',
      semester: Number(sekolahAwalRows[0]?.semester) === 2 ? 'Genap' : 'Ganjil',
    }

    const ctx: SyncContext = {
      periode,
      kkMap: new Map(),
      kelasMap: new Map(),
      kelasTingkatMap: new Map(),
      kelasKkMap: new Map(),
      mapelMap: new Map(),
      userMap: new Map(),
      siswaMap: new Map(),
    }

    /* ----- Load referensi & data existing ----- */
    const [kkRows]: any = await pool.query(
      'SELECT id_kompetensi_keahlian, kompetensi_keahlian, deskripsi FROM kompetensi_keahlian WHERE deleted_at IS NULL'
    )
    for (const kk of kkRows) ctx.kkMap.set(norm(kk.kompetensi_keahlian), kk.id_kompetensi_keahlian)

    const [kelasRows]: any = await pool.query('SELECT * FROM kelas WHERE deleted_at IS NULL')
    const kelasByName = new Map<string, any>(kelasRows.map((k: any) => [norm(k.nama_kelas), k]))
    for (const k of kelasRows) {
      ctx.kelasMap.set(norm(k.nama_kelas), k.id_kelas)
      ctx.kelasTingkatMap.set(k.id_kelas, k.id_tingkat)
      ctx.kelasKkMap.set(k.id_kelas, k.id_kompetensi_keahlian)
    }

    const [mapelRows]: any = await pool.query(
      'SELECT id_mapel, nama_mapel FROM mapel WHERE id_sekolah = ? AND deleted_at IS NULL',
      [SEKOLAH_ID]
    )
    for (const m of mapelRows) ctx.mapelMap.set(norm(m.nama_mapel), m.id_mapel)

    const [userRows]: any = await pool.query('SELECT * FROM users WHERE deleted_at IS NULL')
    const userByNuptk = new Map<string, any>()
    const userByName = new Map<string, any>()
    for (const u of userRows) {
      if (u.nuptk && u.nuptk.trim() && u.nuptk.trim() !== '-') {
        userByNuptk.set(norm(u.nuptk), u)
      }
      userByName.set(norm(u.nama), u)
    }
    for (const u of userRows) ctx.userMap.set(norm(u.nama), u.id_user)

    const [siswaRows]: any = await pool.query(
      'SELECT id_siswa, nisn, nis, nama_siswa FROM siswa WHERE deleted_at IS NULL'
    )
    const siswaByNisn = new Map<string, any>()
    const siswaByNis = new Map<string, any>()
    const siswaByName = new Map<string, any>()
    for (const s of siswaRows) {
      if (s.nisn) {
        siswaByNisn.set(norm(s.nisn), s)
        ctx.siswaMap.set(norm(s.nisn), s.id_siswa)
      }
      if (s.nis) siswaByNis.set(norm(s.nis), s)
      if (s.nama_siswa) siswaByName.set(norm(s.nama_siswa), s)
    }

    const [agamaRows]: any = await pool.query('SELECT id_agama, agama FROM agama')
    const agamaMap = new Map<string, number>()
    for (const a of agamaRows) agamaMap.set(norm(a.agama), a.id_agama)

    /* ===== 1. Sekolah + periode aktif ===== */
    await setSyncStatus(true, 'Langkah 1/9: Sekolah & periode aktif...')
    if (want('ent_sekolah') && sekolahRaw) {
      const entry: SyncEntityResult = { entity: 'Sekolah', endpoint: 'getSekolah', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const s = mapSekolah(sekolahRaw)!
        const [sekolahNow]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = ?', [SEKOLAH_ID])
        const cur = sekolahNow[0]
        await pool.query(
          `UPDATE sekolah SET npsn = ?, nama_sekolah = ?, alamat = ?, email = ?, kontak = ?,
             desa = ?, kecamatan = ?, kabupaten = ?, provinsi = ?, website = ?
           WHERE id_sekolah = ?`,
          [s.npsn, s.nama, s.alamat, s.email, s.kontak, s.desa, s.kecamatan, s.kabupaten, s.provinsi, s.website, SEKOLAH_ID]
        )
        entry.updated = 1
        addDetail(detail, 'updated', `${s.nama} (NPSN ${s.npsn})`, 'profil sekolah diperbarui')

        if (periode.idTahun && cur && (Number(cur.tahun) !== periode.idTahun || Number(cur.semester) !== periode.semester)) {
          await pool.query(
            'UPDATE sekolah SET tahun = ?, semester = ? WHERE id_sekolah = ?',
            [periode.idTahun, periode.semester, SEKOLAH_ID]
          )
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron sekolah'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Sekolah: ${entry.error_msg}`)
      }
    }

    /* ===== 2. Kompetensi Keahlian (jurusan) ===== */
    await setSyncStatus(true, 'Langkah 2/9: Kompetensi keahlian...')
    if (want('ent_jurusan')) {
      const entry: SyncEntityResult = { entity: 'Kompetensi Keahlian', endpoint: 'getRombonganBelajar', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const kkRowsAll: any[] = [...kkRows]
        for (const jur of mapJurusan(rombels)) {
          const found = kkRowsAll.find((kk) => jurusanMatch(jur.nama, kk.kompetensi_keahlian, kk.deskripsi))
          if (found) {
            ctx.kkMap.set(norm(found.kompetensi_keahlian), found.id_kompetensi_keahlian)
            entry.skipped++
            addDetail(detail, 'skipped', jur.nama, 'sudah ada di lokal')
            continue
          }
          const [res]: any = await pool.query(
            'INSERT INTO kompetensi_keahlian (kompetensi_keahlian, deskripsi, banner) VALUES (?, ?, ?)',
            [jur.nama, '', '']
          )
          ctx.kkMap.set(norm(jur.nama), res.insertId)
          kkRowsAll.push({ id_kompetensi_keahlian: res.insertId, kompetensi_keahlian: jur.nama, deskripsi: '' })
          entry.inserted++
          addDetail(detail, 'inserted', jur.nama, 'jurusan baru')
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron jurusan'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Jurusan: ${entry.error_msg}`)
      }
    }

    /* ===== 3. Kelas ===== */
    await setSyncStatus(true, 'Langkah 3/9: Kelas...')
    if (want('ent_kelas')) {
      const entry: SyncEntityResult = { entity: 'Kelas', endpoint: 'getRombonganBelajar', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        for (const k of mapKelas(rombels)) {
          const existing = kelasByName.get(norm(k.nama))
          const kkId = k.jurusanNama
            ? ctx.kkMap.get(norm(k.jurusanNama)) ?? findKkIdByMatch(k.jurusanNama, kkRows)
            : undefined
          if (existing) {
            const newTingkat = k.tingkatId ?? existing.id_tingkat
            const newKk = kkId ?? existing.id_kompetensi_keahlian
            if (Number(existing.id_tingkat) !== Number(newTingkat) || Number(existing.id_kompetensi_keahlian) !== Number(newKk)) {
              await pool.query(
                'UPDATE kelas SET id_tingkat = ?, id_kompetensi_keahlian = ? WHERE id_kelas = ?',
                [newTingkat, newKk, existing.id_kelas]
              )
              entry.updated++
              addDetail(detail, 'updated', k.nama, 'tingkat/jurusan diperbarui')
            } else {
              entry.skipped++
              addDetail(detail, 'skipped', k.nama, 'sudah ada di lokal')
            }
            ctx.kelasTingkatMap.set(existing.id_kelas, newTingkat)
            ctx.kelasKkMap.set(existing.id_kelas, newKk)
          } else {
            const [res]: any = await pool.query(
              'INSERT INTO kelas (id_tingkat, id_kompetensi_keahlian, nama_kelas) VALUES (?, ?, ?)',
              [k.tingkatId ?? 0, kkId ?? 0, k.nama]
            )
            entry.inserted++
            addDetail(detail, 'inserted', k.nama, 'kelas baru')
            ctx.kelasMap.set(norm(k.nama), res.insertId)
            ctx.kelasTingkatMap.set(res.insertId, k.tingkatId ?? 0)
            ctx.kelasKkMap.set(res.insertId, kkId ?? 0)
          }
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron kelas'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Kelas: ${entry.error_msg}`)
      }
    }

    /* ===== 4. Mata Pelajaran ===== */
    await setSyncStatus(true, 'Langkah 4/9: Mata pelajaran...')
    if (want('ent_mapel')) {
      const entry: SyncEntityResult = { entity: 'Mata Pelajaran', endpoint: 'getRombonganBelajar', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const [maxUrutRows]: any = await pool.query('SELECT COALESCE(MAX(urut), 0) AS m FROM mapel')
        let urut = maxUrutRows[0]?.m ?? 0
        for (const m of mapMapel(rombels)) {
          if (ctx.mapelMap.has(norm(m.nama))) {
            entry.skipped++
            addDetail(detail, 'skipped', m.nama, 'sudah ada di lokal')
            continue
          }
          const [res]: any = await pool.query(
            'INSERT INTO mapel (id_sekolah, id_kelompok, nama_mapel, s_mapel, agama, urut) VALUES (?, ?, ?, ?, NULL, ?)',
            [SEKOLAH_ID, m.kelompok, m.nama, buatSingkatan(m.nama), ++urut]
          )
          ctx.mapelMap.set(norm(m.nama), res.insertId)
          entry.inserted++
          addDetail(detail, 'inserted', m.nama, 'mapel baru')
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron mata pelajaran'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Mata Pelajaran: ${entry.error_msg}`)
      }
    }

    /* ===== 5. Guru / PTK ===== */
    await setSyncStatus(true, 'Langkah 5/9: Guru/PTK...')
    if (want('ent_guru')) {
      const entry: SyncEntityResult = { entity: 'Guru/PTK', endpoint: 'getGtk', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        let gtkSeq = 0
        for (const g of mapGuru(gtks, agamaMap)) {
          if (!g.nama) {
            entry.skipped++
            continue
          }
          let existing = g.nuptk ? userByNuptk.get(norm(g.nuptk)) : undefined
          if (!existing) existing = userByName.get(norm(g.nama))
          const agamaId = resolveAgama(g.agama, agamaMap)

          if (existing) {
            const nuptkBaru = existing.nuptk && String(existing.nuptk).trim() ? existing.nuptk : g.nuptk
            await pool.query(
              `UPDATE users SET nama = ?, kelamin = ?, agama = ?, nip = ?, nuptk = ?,
                 id_kepegawaian = ?, ijazah = ?, id_tugas_tambahan = ?
               WHERE id_user = ?`,
              [g.nama, g.kelamin, agamaId ?? existing.agama, g.nip || existing.nip || '', nuptkBaru || '', g.kepegawaian, g.ijazah, g.jabatan, existing.id_user]
            )
            ctx.userMap.set(norm(g.nama), existing.id_user)
            entry.updated++
            addDetail(detail, 'updated', g.nama, 'data diperbarui')
          } else {
            gtkSeq++
            const username = `gtk_${Date.now().toString(36)}${gtkSeq}`
            const password = bcrypt.hashSync(Math.random().toString(36).slice(2, 10), 10)
            const [res]: any = await pool.query(
              `INSERT INTO users (jabatan, nama, kelamin, agama, nip, nuptk, kontak, id_kepegawaian, ijazah, id_tugas_tambahan, username, pass, password, foto, moto)
               VALUES (?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, '', 0)`,
              [g.jabatan, g.nama, g.kelamin, agamaId ?? 1, g.nip || '', g.nuptk || '', g.kepegawaian, g.ijazah, g.jabatan, username, username, password]
            )
            userByName.set(norm(g.nama), { id_user: res.insertId, nama: g.nama, nuptk: g.nuptk })
            if (g.nuptk) userByNuptk.set(norm(g.nuptk), { id_user: res.insertId, nama: g.nama, nuptk: g.nuptk })
            ctx.userMap.set(norm(g.nama), res.insertId)
            entry.inserted++
            addDetail(detail, 'inserted', g.nama, 'guru baru (tanpa akun login)')
          }
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron guru'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Guru: ${entry.error_msg}`)
      }
    }

    /* ===== 6. Siswa ===== */
    await setSyncStatus(true, 'Langkah 6/9: Siswa...')
    if (want('ent_siswa')) {
      const entry: SyncEntityResult = { entity: 'Siswa', endpoint: 'getPesertaDidik', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const rombelKk = new Map<string, string>()
        for (const r of rombelKelas) {
          if (r.jurusan_id_str) rombelKk.set(norm(String(r.nama)), String(r.jurusan_id_str))
        }

        let siswaSeq = 0
        for (const s of mapSiswa(pds, agamaMap)) {
          if (!s.nama) {
            entry.skipped++
            continue
          }
          let existing = s.nisn ? siswaByNisn.get(norm(s.nisn)) : undefined
          if (!existing && s.nis) existing = siswaByNis.get(norm(s.nis))
          if (!existing && s.nama) existing = siswaByName.get(norm(s.nama))
          const agamaId = resolveAgama(s.agama, agamaMap)
          const jurusanNama = rombelKk.get(norm(s.namaRombel)) || null
          const kkId = jurusanNama
            ? ctx.kkMap.get(norm(jurusanNama)) ?? findKkIdByMatch(jurusanNama, kkRows)
            : null
          const label = `${s.nama} (${s.nisn || s.nis || '-'})`

          if (existing) {
            await pool.query(
              `UPDATE siswa SET
                 nama_siswa = ?, nik_pd = ?, nis = ?, nisn = ?,
                 tempat_lahir = ?, tanggal_lahir = ?, kelamin = ?, agama = ?,
                 kontak_siswa = ?, anak_ke = ?,
                 nama_ayah = ?, pekerjaan_ayah = ?, nama_ibu = ?, pekerjaan_ibu = ?,
                 nama_wali = ?, pekerjaan_wali = ?, sekolah_asal = ?,
                 terima_tanggal = ?, terima_tingkat = ?, terima_kelas = ?, jurusan = ?
               WHERE id_siswa = ?`,
              [s.nama || existing.nama_siswa, s.nik || existing.nik_pd, s.nis || existing.nis, s.nisn || existing.nisn,
                s.tempatLahir || existing.tempat_lahir, s.tanggalLahir || existing.tanggal_lahir, s.kelamin, agamaId ?? existing.agama,
                s.kontak || existing.kontak_siswa, s.anakKe || existing.anak_ke,
                s.namaAyah || existing.nama_ayah, s.pekerjaanAyah || existing.pekerjaan_ayah,
                s.namaIbu || existing.nama_ibu, s.pekerjaanIbu || existing.pekerjaan_ibu,
                s.namaWali || existing.nama_wali, s.pekerjaanWali || existing.pekerjaan_wali,
                s.sekolahAsal || existing.sekolah_asal, s.terimaTanggal || existing.terima_tanggal,
                s.tingkatId ?? existing.terima_tingkat, s.namaRombel || existing.terima_kelas,
                kkId ?? existing.jurusan, existing.id_siswa]
            )
            if (existing.nisn && norm(existing.nisn) !== norm(s.nisn || s.nis)) {
              ctx.siswaMap.delete(norm(existing.nisn))
            }
            ctx.siswaMap.set(norm(s.nisn || s.nis), existing.id_siswa)
            entry.updated++
            addDetail(detail, 'updated', label, 'data diperbarui')
          } else {
            siswaSeq++
            const username = s.nisn || s.nis || `siswa_${Date.now().toString(36)}${siswaSeq}`
            const password = bcrypt.hashSync(username, 10)
            const [res]: any = await pool.query(
              `INSERT INTO siswa (
                 nama_siswa, nik_pd, nis, nisn, tempat_lahir, tanggal_lahir, kelamin, agama,
                 kontak_siswa, hub_keluarga, jumlah_saudara, anak_ke,
                 nama_ayah, tahun_ayah, pendidikan_ayah, pekerjaan_ayah, kontak_ayah,
                 nama_ibu, tahun_ibu, pendidikan_ibu, pekerjaan_ibu, kontak_ibu,
                 alamat, alamat_orang_tua,
                 nama_wali, alamat_wali, pekerjaan_wali, kontak_wali,
                 jurusan, terima_tingkat, terima_kelas, sekolah_asal, terima_tanggal,
                 jenis_siswa, username, pass, password, foto, aktif
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, 0, '', ?, '', ?, 0, '', ?, '', '', '', ?, '', ?, '', ?, ?, ?, ?, ?, 1, ?, ?, ?, '', 1)`,
              [s.nama, s.nik, s.nis || '', s.nisn || '', s.tempatLahir || '', s.tanggalLahir || '1970-01-01', s.kelamin, agamaId,
                s.kontak || '', s.anakKe || 0, s.namaAyah || '', s.pekerjaanAyah || '',
                s.namaIbu || '', s.pekerjaanIbu || '', s.namaWali || '', s.pekerjaanWali || '',
                kkId ?? 0, s.tingkatId, s.namaRombel || '-', s.sekolahAsal || '',
                s.terimaTanggal || null, username, username, password]
            )
            siswaByNisn.set(norm(s.nisn || s.nis), { id_siswa: res.insertId, nisn: s.nisn })
            if (s.nis) siswaByNis.set(norm(s.nis), { id_siswa: res.insertId, nisn: s.nisn })
            if (s.nama) siswaByName.set(norm(s.nama), { id_siswa: res.insertId, nisn: s.nisn })
            ctx.siswaMap.set(norm(s.nisn || s.nis), res.insertId)
            entry.inserted++
            addDetail(detail, 'inserted', label, 'siswa baru (akun: username = NISN)')
          }
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron siswa'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Siswa: ${entry.error_msg}`)
      }
    }

    /* ===== 7. Siswa Kelas (keanggotaan rombel) ===== */
    await setSyncStatus(true, 'Langkah 7/9: Siswa kelas...')
    if (want('ent_siswa')) {
      const entry: SyncEntityResult = { entity: 'Siswa Kelas', endpoint: 'getPesertaDidik', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const siswaById = new Map<number, string>(siswaRows.map((r: any) => [r.id_siswa, r.nama_siswa]))
        for (const [nisnKey, idSiswa] of ctx.siswaMap) {
          const s = [...pds].find((p) => norm(p.nisn || p.nipd) === nisnKey)
          const namaSiswa = s?.nama ? `${s.nama} (${s.nisn || s.nipd || '-'})` : (siswaById.get(idSiswa) ?? nisnKey)
          if (!s || !s.nama_rombel) {
            entry.skipped++
            addDetail(detail, 'skipped', namaSiswa, 'tidak ditemukan di data DAPODIK')
            continue
          }
          const rombelNama = String(s.nama_rombel)
          const kelasId = ctx.kelasMap.get(norm(rombelNama))
          if (!kelasId) {
            entry.skipped++
            addDetail(detail, 'skipped', `${namaSiswa} → ${rombelNama}`, 'kelas belum ada di lokal')
            continue
          }
          const [existing]: any = await pool.query(
            `SELECT id_siswa_kelas FROM siswa_kelas
             WHERE tahun = ? AND semester = ? AND id_siswa = ? AND deleted_at IS NULL LIMIT 1`,
            [periode.idTahun, periode.semester, idSiswa]
          )
          const tingkatId = ctx.kelasTingkatMap.get(kelasId) ?? 1
          if (existing.length > 0) {
            await pool.query(
              'UPDATE siswa_kelas SET id_kelas = ?, id_tingkat = ?, status = 1 WHERE id_siswa_kelas = ?',
              [kelasId, tingkatId, existing[0].id_siswa_kelas]
            )
            entry.updated++
            addDetail(detail, 'updated', `${namaSiswa} → ${rombelNama}`, 'keanggotaan rombel diperbarui')
          } else {
            await pool.query(
              'INSERT INTO siswa_kelas (tahun, semester, id_tingkat, id_kelas, id_siswa, status) VALUES (?, ?, ?, ?, ?, 1)',
              [periode.idTahun, periode.semester, tingkatId, kelasId, idSiswa]
            )
            entry.inserted++
            addDetail(detail, 'inserted', `${namaSiswa} → ${rombelNama}`, 'keanggotaan rombel baru')
          }
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron siswa kelas'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Siswa Kelas: ${entry.error_msg}`)
      }
    }

    /* ===== 8. Wali Kelas ===== */
    await setSyncStatus(true, 'Langkah 8/9: Wali kelas...')
    if (want('ent_kelas')) {
      const entry: SyncEntityResult = { entity: 'Wali Kelas', endpoint: 'getRombonganBelajar', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        for (const kw of mapKelasWali(rombels)) {
          const kelasId = ctx.kelasMap.get(norm(kw.namaRombel))
          const idUser = kw.waliNama ? ctx.userMap.get(norm(kw.waliNama)) : undefined
          const label = `${kw.namaRombel}${kw.waliNama ? ` → ${kw.waliNama}` : ''}`
          if (!kelasId) {
            entry.skipped++
            addDetail(detail, 'skipped', label, 'kelas belum ada di lokal')
            continue
          }
          const [existing]: any = await pool.query(
            `SELECT id_kelas_wali FROM kelas_wali
             WHERE id_kelas = ? AND tahun = ? AND semester = ? LIMIT 1`,
            [kelasId, periode.idTahun, periode.semester]
          )
          if (existing.length > 0) {
            if (idUser) {
              await pool.query('UPDATE kelas_wali SET id_user = ? WHERE id_kelas_wali = ?', [idUser, existing[0].id_kelas_wali])
              entry.updated++
              addDetail(detail, 'updated', label, 'wali kelas diperbarui')
            } else {
              entry.skipped++
              addDetail(detail, 'skipped', label, 'wali tidak ditemukan di data DAPODIK')
            }
          } else if (idUser) {
            await pool.query(
              'INSERT INTO kelas_wali (tahun, semester, id_kelas, id_user) VALUES (?, ?, ?, ?)',
              [periode.idTahun, periode.semester, kelasId, idUser]
            )
            entry.inserted++
            addDetail(detail, 'inserted', label, 'wali kelas baru')
          } else {
            entry.skipped++
            addDetail(detail, 'skipped', label, 'wali tidak ditemukan di data DAPODIK')
          }
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron wali kelas'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Wali Kelas: ${entry.error_msg}`)
      }
    }

    /* ===== 9. Mapel Kelas (pembelajaran) ===== */
    await setSyncStatus(true, 'Langkah 9/9: Mapel kelas...')
    if (want('ent_mapel')) {
      const entry: SyncEntityResult = { entity: 'Mapel Kelas', endpoint: 'getRombonganBelajar', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const seenPair = new Set<string>()
        for (const mk of mapMapelKelas(rombels)) {
          const kelasId = ctx.kelasMap.get(norm(mk.namaRombel))
          const mapelId = ctx.mapelMap.get(norm(mk.mapelNama))
          const label = `${mk.namaRombel} — ${mk.mapelNama}${mk.guruNama ? ` (${mk.guruNama})` : ''}`
          if (!kelasId || !mapelId) {
            entry.skipped++
            addDetail(detail, 'skipped', label, 'kelas/mapel belum ada di lokal')
            continue
          }
          const pairKey = `${kelasId}:${mapelId}`
          if (seenPair.has(pairKey)) {
            entry.skipped++
            addDetail(detail, 'skipped', label, 'duplikat dalam data DAPODIK')
            continue
          }
          seenPair.add(pairKey)
          const idUser = mk.guruNama ? ctx.userMap.get(norm(mk.guruNama)) : null
          const [existing]: any = await pool.query(
            `SELECT id_mapel_kelas FROM mapel_kelas
             WHERE tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? LIMIT 1`,
            [periode.idTahun, periode.semester, kelasId, mapelId]
          )
          if (existing.length > 0) {
            if (idUser) {
              await pool.query(
                'UPDATE mapel_kelas SET id_user = ? WHERE id_mapel_kelas = ?',
                [idUser, existing[0].id_mapel_kelas]
              )
              entry.updated++
              addDetail(detail, 'updated', label, 'pembelajaran diperbarui')
            } else {
              entry.skipped++
              addDetail(detail, 'skipped', label, 'guru tidak ditemukan di data DAPODIK — pertahankan guru lama')
            }
          } else {
            await pool.query(
              'INSERT INTO mapel_kelas (tahun, semester, id_kelas, id_mapel, id_user) VALUES (?, ?, ?, ?, ?)',
              [periode.idTahun, periode.semester, kelasId, mapelId, idUser]
            )
            entry.inserted++
            addDetail(detail, 'inserted', label, 'pembelajaran baru')
          }
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron mapel kelas'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Mapel Kelas: ${entry.error_msg}`)
      }
    }

    await pool.query('UPDATE dapodik_config SET last_sync_at = NOW() WHERE id = 1')
    for (const p of REVALIDATE) revalidatePath(p)

    return {
      success: true,
      summary,
      runId,
      periode: {
        label: periodeLabel,
        semester: periode.semester,
        autoCreated: periodeAutoCreated,
        periodeAktif,
      },
    } as const
  } catch (e: any) {
    return { success: false, error: e?.message || 'Sinkronisasi gagal', summary, runId, periode: null } as const
  } finally {
    await setSyncStatus(false)
  }
}

export async function getDapodikSyncStatusAction() {
  return getDapodikSyncStatus()
}

export interface DapodikLogDetailRow {
  entity: string
  status: 'inserted' | 'updated' | 'skipped'
  label: string
  keterangan: string | null
}

export async function getDapodikLogDetail(runId: string) {
  const authResult = await requireTuAdmin()
  if (authResult.error) return { success: false, error: 'Unauthorized' } as const

  try {
    const [rows]: any = await pool.query(
      `SELECT entity, status, label, keterangan FROM dapodik_log_detail
       WHERE run_id = ? ORDER BY id ASC`,
      [runId]
    )
    return { success: true, rows: rows as DapodikLogDetailRow[] } as const
  } catch (e: any) {
    return { success: false, error: e?.message || 'Gagal memuat detail' } as const
  }
}
