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
  mapPendidikanFormal,
  mapSekolah,
  mapSiswa,
  norm,
  normNamaPtk,
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
  kkByJurusanId: Map<string, number>
  kelasMap: Map<string, number>
  kelasByRombelId: Map<string, number>
  kelasTingkatMap: Map<number, number>
  kelasKkMap: Map<number, number>
  mapelMap: Map<string, number>
  mapelByMataPelajaranId: Map<string, number>
  userMap: Map<string, number>
  userByPtkId: Map<string, any>
  userByPenggunaId: Map<string, number>
  siswaMap: Map<string, number>
  siswaByPesertaDidikId: Map<string, number>
}

export async function syncDapodik(formData: FormData) {
  const authResult = await requireTuAdmin()
  if (authResult.error) return { success: false, error: authResult.error, summary: [] } as const

  const want = (name: string) => formData.get(name) === '1'
  const summary: SyncEntityResult[] = []
  const runId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

  try {
    const conn = await getConnection()
    await setSyncStatus(true, 'Langkah 0/11: Mengambil data dari server DAPODIK...')

    const sekolahRaw = await fetchDapodikSingle<any>(conn, 'getSekolah')
    const gtks = await fetchDapodik<any>(conn, 'getGtk')
    const rombels = await fetchDapodik<any>(conn, 'getRombonganBelajar')
    const pds = await fetchDapodik<any>(conn, 'getPesertaDidik')
    let penggunas: any[] = []
    if (want('ent_guru') || want('ent_siswa')) {
      try {
        penggunas = await fetchDapodik<any>(conn, 'getPengguna')
      } catch (e: any) {
        console.error('getPengguna gagal (dilewati):', e?.message || e)
      }
    }

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
      kkByJurusanId: new Map(),
      kelasMap: new Map(),
      kelasByRombelId: new Map(),
      kelasTingkatMap: new Map(),
      kelasKkMap: new Map(),
      mapelMap: new Map(),
      mapelByMataPelajaranId: new Map(),
      userMap: new Map(),
      userByPtkId: new Map(),
      userByPenggunaId: new Map(),
      siswaMap: new Map(),
      siswaByPesertaDidikId: new Map(),
    }

    /* ----- Load referensi & data existing ----- */
    const [kkRows]: any = await pool.query(
      'SELECT id_kompetensi_keahlian, kompetensi_keahlian, deskripsi, jurusan_id_dapodik FROM kompetensi_keahlian WHERE deleted_at IS NULL'
    )
    for (const kk of kkRows) {
      ctx.kkMap.set(norm(kk.kompetensi_keahlian), kk.id_kompetensi_keahlian)
      if (kk.jurusan_id_dapodik) ctx.kkByJurusanId.set(String(kk.jurusan_id_dapodik), kk.id_kompetensi_keahlian)
    }

    const [kelasRows]: any = await pool.query('SELECT * FROM kelas WHERE deleted_at IS NULL')
    const kelasByName = new Map<string, any>(kelasRows.map((k: any) => [norm(k.nama_kelas), k]))
    const kelasByUuid = new Map<string, any>()
    for (const k of kelasRows) {
      ctx.kelasMap.set(norm(k.nama_kelas), k.id_kelas)
      ctx.kelasTingkatMap.set(k.id_kelas, k.id_tingkat)
      ctx.kelasKkMap.set(k.id_kelas, k.id_kompetensi_keahlian)
      if (k.rombongan_belajar_id_dapodik) {
        ctx.kelasByRombelId.set(String(k.rombongan_belajar_id_dapodik), k.id_kelas)
        kelasByUuid.set(String(k.rombongan_belajar_id_dapodik), k)
      }
    }

    const [mapelRows]: any = await pool.query(
      'SELECT id_mapel, nama_mapel, mata_pelajaran_id_dapodik FROM mapel WHERE id_sekolah = ? AND deleted_at IS NULL',
      [SEKOLAH_ID]
    )
    for (const m of mapelRows) {
      ctx.mapelMap.set(norm(m.nama_mapel), m.id_mapel)
      if (m.mata_pelajaran_id_dapodik) ctx.mapelByMataPelajaranId.set(String(m.mata_pelajaran_id_dapodik), m.id_mapel)
    }

    const [userRows]: any = await pool.query('SELECT * FROM users WHERE deleted_at IS NULL')
    const userByNuptk = new Map<string, any>()
    const userByName = new Map<string, any>()
    const userByNamaTanpaGelar = new Map<string, any>()
    const namaTanpaGelarAmbigu = new Set<string>()
    for (const u of userRows) {
      if (u.nuptk && u.nuptk.trim() && u.nuptk.trim() !== '-') {
        userByNuptk.set(norm(u.nuptk), u)
      }
      userByName.set(norm(u.nama), u)
      const namaTanpaGelar = normNamaPtk(u.nama)
      if (namaTanpaGelar) {
        const existingNama = userByNamaTanpaGelar.get(namaTanpaGelar)
        if (existingNama && existingNama.id_user !== u.id_user) {
          namaTanpaGelarAmbigu.add(namaTanpaGelar)
        } else {
          userByNamaTanpaGelar.set(namaTanpaGelar, u)
        }
      }
      if (u.ptk_id_dapodik) ctx.userByPtkId.set(String(u.ptk_id_dapodik), u)
      if (u.pengguna_id_dapodik) ctx.userByPenggunaId.set(String(u.pengguna_id_dapodik), u.id_user)
    }
    for (const nama of namaTanpaGelarAmbigu) userByNamaTanpaGelar.delete(nama)
    for (const u of userRows) ctx.userMap.set(norm(u.nama), u.id_user)

    const [siswaRows]: any = await pool.query(
      'SELECT id_siswa, nisn, nis, nama_siswa, peserta_didik_id_dapodik FROM siswa WHERE deleted_at IS NULL'
    )
    const siswaByNisn = new Map<string, any>()
    const siswaByNis = new Map<string, any>()
    const siswaByName = new Map<string, any>()
    const siswaByUuid = new Map<string, any>()
    for (const s of siswaRows) {
      if (s.nisn) {
        siswaByNisn.set(norm(s.nisn), s)
        ctx.siswaMap.set(norm(s.nisn), s.id_siswa)
      }
      if (s.nis) siswaByNis.set(norm(s.nis), s)
      if (s.nama_siswa) siswaByName.set(norm(s.nama_siswa), s)
      if (s.peserta_didik_id_dapodik) {
        ctx.siswaByPesertaDidikId.set(String(s.peserta_didik_id_dapodik), s.id_siswa)
        siswaByUuid.set(String(s.peserta_didik_id_dapodik), s)
      }
    }

    const [agamaRows]: any = await pool.query('SELECT id_agama, agama FROM agama')
    const agamaMap = new Map<string, number>()
    for (const a of agamaRows) agamaMap.set(norm(a.agama), a.id_agama)

    /* ===== 1. Sekolah + periode aktif ===== */
    await setSyncStatus(true, 'Langkah 1/11: Sekolah & periode aktif...')
    if (want('ent_sekolah') && sekolahRaw) {
      const entry: SyncEntityResult = { entity: 'Sekolah', endpoint: 'getSekolah', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const s = mapSekolah(sekolahRaw)!
        const [sekolahNow]: any = await pool.query('SELECT * FROM sekolah WHERE id_sekolah = ?', [SEKOLAH_ID])
        const cur = sekolahNow[0]
        await pool.query(
          `UPDATE sekolah SET
             npsn = ?, nama_sekolah = ?, alamat = ?, email = ?, kontak = ?,
             desa = ?, kecamatan = ?, kabupaten = ?, provinsi = ?, website = ?,
             sekolah_id_dapodik = ?, nss = ?, status_sekolah = ?, alamat_jalan = ?,
             rt = ?, rw = ?, kode_wilayah = ?, kode_pos = ?, nomor_fax = ?,
             is_sks = ?, lintang = ?, bujur = ?
           WHERE id_sekolah = ?`,
          [s.npsn, s.nama, s.alamat, s.email, s.kontak, s.desa, s.kecamatan, s.kabupaten, s.provinsi, s.website,
            s.sekolahId || null, s.nss || null, s.statusSekolah || null, s.alamatJalan || null,
            s.rt || null, s.rw || null, s.kodeWilayah || null, s.kodePos || null, s.nomorFax || null,
            s.isSks, s.lintang || null, s.bujur || null, SEKOLAH_ID]
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
    await setSyncStatus(true, 'Langkah 2/11: Kompetensi keahlian...')
    if (want('ent_jurusan')) {
      const entry: SyncEntityResult = { entity: 'Kompetensi Keahlian', endpoint: 'getRombonganBelajar', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const kkRowsAll: any[] = [...kkRows]
        for (const jur of mapJurusan(rombels)) {
          let kkId = jur.jurusanId ? ctx.kkByJurusanId.get(jur.jurusanId) : undefined
          if (!kkId) kkId = kkRowsAll.find((kk) => jurusanMatch(jur.nama, kk.kompetensi_keahlian, kk.deskripsi))?.id_kompetensi_keahlian
          if (kkId) {
            ctx.kkMap.set(norm(jur.nama), kkId)
            if (jur.jurusanId) ctx.kkByJurusanId.set(jur.jurusanId, kkId)
            entry.skipped++
            addDetail(detail, 'skipped', jur.nama, 'sudah ada di lokal')
            continue
          }
          const [res]: any = await pool.query(
            'INSERT INTO kompetensi_keahlian (kompetensi_keahlian, deskripsi, banner, jurusan_id_dapodik) VALUES (?, ?, ?, ?)',
            [jur.nama, '', '', jur.jurusanId || null]
          )
          ctx.kkMap.set(norm(jur.nama), res.insertId)
          if (jur.jurusanId) ctx.kkByJurusanId.set(jur.jurusanId, res.insertId)
          kkRowsAll.push({ id_kompetensi_keahlian: res.insertId, kompetensi_keahlian: jur.nama, deskripsi: '', jurusan_id_dapodik: jur.jurusanId || null })
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
    await setSyncStatus(true, 'Langkah 3/11: Kelas...')
    if (want('ent_kelas')) {
      const entry: SyncEntityResult = { entity: 'Kelas', endpoint: 'getRombonganBelajar', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        for (const k of mapKelas(rombels)) {
          const existing = k.rombelId ? kelasByUuid.get(k.rombelId) : undefined
          const existingByName = !existing ? kelasByName.get(norm(k.nama)) : undefined
          const cur = existing ?? existingByName
          const kkId = k.jurusanNama
            ? ctx.kkMap.get(norm(k.jurusanNama)) ?? findKkIdByMatch(k.jurusanNama, kkRows)
            : undefined
          if (cur) {
            const newTingkat = k.tingkatId ?? cur.id_tingkat
            const newKk = kkId ?? cur.id_kompetensi_keahlian
            const kurikulumBaru = k.kurikulumId ?? cur.kurikulum_id_dapodik ?? null
            const waliBaru = k.ptkWaliId || cur.ptk_id_wali_dapodik || null
            const perluUpdate =
              Number(cur.id_tingkat) !== Number(newTingkat) ||
              Number(cur.id_kompetensi_keahlian) !== Number(newKk) ||
              !cur.rombongan_belajar_id_dapodik ||
              Number(cur.kurikulum_id_dapodik) !== Number(kurikulumBaru) ||
              String(cur.ptk_id_wali_dapodik || '') !== String(waliBaru || '')
            if (perluUpdate) {
              await pool.query(
                `UPDATE kelas SET id_tingkat = ?, id_kompetensi_keahlian = ?,
                   rombongan_belajar_id_dapodik = ?, kurikulum_id_dapodik = ?,
                   jurusan_id_dapodik = ?, ptk_id_wali_dapodik = ?
                 WHERE id_kelas = ?`,
                [newTingkat, newKk, k.rombelId || null, kurikulumBaru, k.jurusanId || null, waliBaru, cur.id_kelas]
              )
              entry.updated++
              addDetail(detail, 'updated', k.nama, 'tingkat/jurusan/UUID diperbarui')
            } else {
              entry.skipped++
              addDetail(detail, 'skipped', k.nama, 'sudah ada di lokal')
            }
            ctx.kelasTingkatMap.set(cur.id_kelas, newTingkat)
            ctx.kelasKkMap.set(cur.id_kelas, newKk)
            if (k.rombelId) ctx.kelasByRombelId.set(k.rombelId, cur.id_kelas)
          } else {
            const [res]: any = await pool.query(
              `INSERT INTO kelas (id_tingkat, id_kompetensi_keahlian, nama_kelas,
                 rombongan_belajar_id_dapodik, kurikulum_id_dapodik, jurusan_id_dapodik, ptk_id_wali_dapodik)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [k.tingkatId ?? 0, kkId ?? 0, k.nama, k.rombelId || null, k.kurikulumId, k.jurusanId || null, k.ptkWaliId || null]
            )
            entry.inserted++
            addDetail(detail, 'inserted', k.nama, 'kelas baru')
            ctx.kelasMap.set(norm(k.nama), res.insertId)
            ctx.kelasTingkatMap.set(res.insertId, k.tingkatId ?? 0)
            ctx.kelasKkMap.set(res.insertId, kkId ?? 0)
            if (k.rombelId) ctx.kelasByRombelId.set(k.rombelId, res.insertId)
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
    await setSyncStatus(true, 'Langkah 4/11: Mata pelajaran...')
    if (want('ent_mapel')) {
      const entry: SyncEntityResult = { entity: 'Mata Pelajaran', endpoint: 'getRombonganBelajar', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const [maxUrutRows]: any = await pool.query('SELECT COALESCE(MAX(urut), 0) AS m FROM mapel')
        let urut = maxUrutRows[0]?.m ?? 0
        for (const m of mapMapel(rombels)) {
          const existingId = m.mataPelajaranId ? ctx.mapelByMataPelajaranId.get(m.mataPelajaranId) : undefined
          if (existingId) {
            ctx.mapelMap.set(norm(m.nama), existingId)
            entry.skipped++
            addDetail(detail, 'skipped', m.nama, 'sudah ada di lokal')
            continue
          }
          if (ctx.mapelMap.has(norm(m.nama))) {
            entry.skipped++
            addDetail(detail, 'skipped', m.nama, 'sudah ada di lokal')
            continue
          }
          const [res]: any = await pool.query(
            'INSERT INTO mapel (id_sekolah, id_kelompok, nama_mapel, s_mapel, agama, urut, mata_pelajaran_id_dapodik, jurusan_id_dapodik, last_sync) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, NOW())',
            [SEKOLAH_ID, m.kelompok, m.nama, buatSingkatan(m.nama), ++urut, m.mataPelajaranId || null, m.jurusanId || null]
          )
          ctx.mapelMap.set(norm(m.nama), res.insertId)
          if (m.mataPelajaranId) ctx.mapelByMataPelajaranId.set(m.mataPelajaranId, res.insertId)
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
    await setSyncStatus(true, 'Langkah 5/11: Guru/PTK...')
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
          let existing = g.ptkId ? ctx.userByPtkId.get(g.ptkId) : undefined
          if (!existing) existing = g.nuptk ? userByNuptk.get(norm(g.nuptk)) : undefined
          if (!existing) existing = userByName.get(norm(g.nama))
          if (!existing) existing = userByNamaTanpaGelar.get(normNamaPtk(g.nama))
          const agamaId = resolveAgama(g.agama, agamaMap)

          if (existing) {
            const nuptkBaru = existing.nuptk && String(existing.nuptk).trim() ? existing.nuptk : g.nuptk
            await pool.query(
              `UPDATE users SET nama = ?, kelamin = ?, agama = ?, nip = ?, nuptk = ?,
                 id_kepegawaian = ?, ijazah = ?, id_tugas_tambahan = ?,
                 ptk_id_dapodik = ?, nik = ?, tanggal_lahir = ?
               WHERE id_user = ?`,
              [existing.nama || g.nama, g.kelamin, agamaId ?? existing.agama, g.nip || existing.nip || '', nuptkBaru || '',
                g.kepegawaian, g.ijazah, g.jabatan, g.ptkId || null,
                g.nik || existing.nik || null, g.tanggalLahir || existing.tanggal_lahir || null, existing.id_user]
            )
            ctx.userMap.set(norm(g.nama), existing.id_user)
            if (g.ptkId) ctx.userByPtkId.set(g.ptkId, existing.id_user)
            entry.updated++
            addDetail(detail, 'updated', g.nama, 'data diperbarui; nama lokal dipertahankan')
          } else {
            gtkSeq++
            const username = `gtk_${Date.now().toString(36)}${gtkSeq}`
            const password = bcrypt.hashSync(Math.random().toString(36).slice(2, 10), 10)
            const [res]: any = await pool.query(
              `INSERT INTO users (jabatan, nama, kelamin, agama, nip, nuptk, kontak, id_kepegawaian, ijazah, id_tugas_tambahan, username, pass, password, foto, moto, ptk_id_dapodik, nik, tanggal_lahir)
               VALUES (?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, '', 0, ?, ?, ?)`,
              [g.jabatan, g.nama, g.kelamin, agamaId ?? 1, g.nip || '', g.nuptk || '', g.kepegawaian, g.ijazah, g.jabatan, username, username, password,
                g.ptkId || null, g.nik || null, g.tanggalLahir || null]
            )
            userByName.set(norm(g.nama), { id_user: res.insertId, nama: g.nama, nuptk: g.nuptk })
            if (g.nuptk) userByNuptk.set(norm(g.nuptk), { id_user: res.insertId, nama: g.nama, nuptk: g.nuptk })
            if (g.ptkId) ctx.userByPtkId.set(g.ptkId, { id_user: res.insertId, nama: g.nama, nuptk: g.nuptk, agama: agamaId ?? 1, nip: g.nip })
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
    await setSyncStatus(true, 'Langkah 6/11: Siswa...')
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
          let existing = s.pesertaDidikId ? siswaByUuid.get(s.pesertaDidikId) : undefined
          if (!existing && s.nisn) existing = siswaByNisn.get(norm(s.nisn))
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
                 terima_tanggal = ?, terima_tingkat = ?, terima_kelas = ?, jurusan = ?,
                 peserta_didik_id_dapodik = ?, registrasi_id_dapodik = ?, nik = ?,
                 tinggi_badan = ?, berat_badan = ?, email = ?, kebutuhan_khusus = ?
               WHERE id_siswa = ?`,
              [s.nama || existing.nama_siswa, s.nik || existing.nik_pd, s.nis || existing.nis, s.nisn || existing.nisn,
                s.tempatLahir || existing.tempat_lahir, s.tanggalLahir || existing.tanggal_lahir, s.kelamin, agamaId ?? existing.agama,
                s.kontak || existing.kontak_siswa, s.anakKe || existing.anak_ke,
                s.namaAyah || existing.nama_ayah, s.pekerjaanAyah || existing.pekerjaan_ayah,
                s.namaIbu || existing.nama_ibu, s.pekerjaanIbu || existing.pekerjaan_ibu,
                s.namaWali || existing.nama_wali, s.pekerjaanWali || existing.pekerjaan_wali,
                s.sekolahAsal || existing.sekolah_asal, s.terimaTanggal || existing.terima_tanggal,
                s.tingkatId ?? existing.terima_tingkat, s.namaRombel || existing.terima_kelas,
                kkId ?? existing.jurusan,
                s.pesertaDidikId || existing.peserta_didik_id_dapodik || null,
                s.registrasiId || existing.registrasi_id_dapodik || null,
                s.nik || existing.nik || null,
                s.tinggiBadan ?? existing.tinggi_badan, s.beratBadan ?? existing.berat_badan,
                s.email || existing.email || null, s.kebutuhanKhusus || existing.kebutuhan_khusus || 'Tidak ada',
                existing.id_siswa]
            )
            if (existing.nisn && norm(existing.nisn) !== norm(s.nisn || s.nis)) {
              ctx.siswaMap.delete(norm(existing.nisn))
            }
            if (s.pesertaDidikId) ctx.siswaMap.set(norm(s.pesertaDidikId), existing.id_siswa)
            if (s.pesertaDidikId) ctx.siswaByPesertaDidikId.set(s.pesertaDidikId, existing.id_siswa)
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
                 jenis_siswa, username, pass, password, foto, aktif,
                 peserta_didik_id_dapodik, registrasi_id_dapodik, nik,
                 tinggi_badan, berat_badan, email, kebutuhan_khusus
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, 0, '', ?, '', ?, 0, '', ?, '', '', '', ?, '', ?, '', ?, ?, ?, ?, ?, 1, ?, ?, ?, '', 1, ?, ?, ?, ?, ?, ?, ?)`,
              [s.nama, s.nik, s.nis || '', s.nisn || '', s.tempatLahir || '', s.tanggalLahir || '1970-01-01', s.kelamin, agamaId,
                s.kontak || '', s.anakKe || 0, s.namaAyah || '', s.pekerjaanAyah || '',
                s.namaIbu || '', s.pekerjaanIbu || '', s.namaWali || '', s.pekerjaanWali || '',
                kkId ?? 0, s.tingkatId, s.namaRombel || '-', s.sekolahAsal || '',
                s.terimaTanggal || null, username, username, password,
                s.pesertaDidikId || null, s.registrasiId || null, s.nik || null,
                s.tinggiBadan, s.beratBadan, s.email || null, s.kebutuhanKhusus]
            )
            siswaByNisn.set(norm(s.nisn || s.nis), { id_siswa: res.insertId, nisn: s.nisn })
            if (s.nis) siswaByNis.set(norm(s.nis), { id_siswa: res.insertId, nisn: s.nisn })
            if (s.nama) siswaByName.set(norm(s.nama), { id_siswa: res.insertId, nisn: s.nisn })
            if (s.pesertaDidikId) siswaByUuid.set(s.pesertaDidikId, { id_siswa: res.insertId, nisn: s.nisn })
            if (s.pesertaDidikId) ctx.siswaMap.set(norm(s.pesertaDidikId), res.insertId)
            ctx.siswaMap.set(norm(s.nisn || s.nis), res.insertId)
            if (s.pesertaDidikId) ctx.siswaByPesertaDidikId.set(s.pesertaDidikId, res.insertId)
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
    await setSyncStatus(true, 'Langkah 7/11: Siswa kelas...')
    if (want('ent_siswa')) {
      const entry: SyncEntityResult = { entity: 'Siswa Kelas', endpoint: 'getPesertaDidik', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const [skRows]: any = await pool.query(
          `SELECT id_siswa_kelas, id_siswa, anggota_rombel_id_dapodik FROM siswa_kelas
           WHERE deleted_at IS NULL AND anggota_rombel_id_dapodik IS NOT NULL`
        )
        const skByAnggota = new Map<string, any>()
        for (const sk of skRows) skByAnggota.set(String(sk.anggota_rombel_id_dapodik), sk)

        const findSiswaId = (s: any): number | undefined => {
          if (s.pesertaDidikId && ctx.siswaByPesertaDidikId.has(s.pesertaDidikId)) return ctx.siswaByPesertaDidikId.get(s.pesertaDidikId)
          if (s.nisn && ctx.siswaMap.has(norm(s.nisn))) return ctx.siswaMap.get(norm(s.nisn))
          if (s.nis && ctx.siswaMap.has(norm(s.nis))) return ctx.siswaMap.get(norm(s.nis))
          return undefined
        }

        for (const s of mapSiswa(pds, agamaMap)) {
          const label = `${s.nama} (${s.nisn || s.nis || '-'})`
          if (!s.namaRombel) {
            entry.skipped++
            addDetail(detail, 'skipped', label, 'tidak punya rombel')
            continue
          }
          const idSiswa = findSiswaId(s)
          if (!idSiswa) {
            entry.skipped++
            addDetail(detail, 'skipped', label, 'tidak ditemukan di tabel siswa')
            continue
          }
          const rombelNama = String(s.namaRombel)
          const kelasId = ctx.kelasMap.get(norm(rombelNama))
          if (!kelasId) {
            entry.skipped++
            addDetail(detail, 'skipped', `${label} → ${rombelNama}`, 'kelas belum ada di lokal')
            continue
          }
          let existing = s.anggotaRombelId ? skByAnggota.get(s.anggotaRombelId) : undefined
          if (!existing) {
            const [rows]: any = await pool.query(
              `SELECT id_siswa_kelas FROM siswa_kelas
               WHERE tahun = ? AND semester = ? AND id_siswa = ? AND deleted_at IS NULL LIMIT 1`,
              [periode.idTahun, periode.semester, idSiswa]
            )
            if (rows.length > 0) existing = rows[0]
          }
          const tingkatId = ctx.kelasTingkatMap.get(kelasId) ?? 1
          if (existing) {
            await pool.query(
              `UPDATE siswa_kelas SET id_kelas = ?, id_tingkat = ?, status = 1,
                 anggota_rombel_id_dapodik = ?, jenis_pendaftaran_id = ?
               WHERE id_siswa_kelas = ?`,
              [kelasId, tingkatId, s.anggotaRombelId || null, s.jenisPendaftaranId || null, existing.id_siswa_kelas]
            )
            if (s.anggotaRombelId) skByAnggota.set(s.anggotaRombelId, { id_siswa_kelas: existing.id_siswa_kelas })
            entry.updated++
            addDetail(detail, 'updated', `${label} → ${rombelNama}`, 'keanggotaan rombel diperbarui')
          } else {
            const [res]: any = await pool.query(
              `INSERT INTO siswa_kelas (tahun, semester, id_tingkat, id_kelas, id_siswa, status, anggota_rombel_id_dapodik, jenis_pendaftaran_id)
               VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
              [periode.idTahun, periode.semester, tingkatId, kelasId, idSiswa, s.anggotaRombelId || null, s.jenisPendaftaranId || null]
            )
            if (s.anggotaRombelId) skByAnggota.set(s.anggotaRombelId, { id_siswa_kelas: res.insertId })
            entry.inserted++
            addDetail(detail, 'inserted', `${label} → ${rombelNama}`, 'keanggotaan rombel baru')
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
    await setSyncStatus(true, 'Langkah 8/11: Wali kelas...')
    if (want('ent_kelas')) {
      const entry: SyncEntityResult = { entity: 'Wali Kelas', endpoint: 'getRombonganBelajar', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        for (const kw of mapKelasWali(rombels)) {
          const kelasId = kw.rombelId ? ctx.kelasByRombelId.get(kw.rombelId) : undefined
          const kelasIdByName = !kelasId ? ctx.kelasMap.get(norm(kw.namaRombel)) : undefined
          const idKelas = kelasId ?? kelasIdByName
          const idUser = kw.ptkWaliId
            ? ctx.userByPtkId.get(kw.ptkWaliId)?.id_user ?? ctx.userByPtkId.get(kw.ptkWaliId)
            : undefined
          const idUserByName = !idUser && kw.waliNama ? ctx.userMap.get(norm(kw.waliNama)) : undefined
          const idUserFinal = typeof idUser === 'number' ? idUser : idUserByName
          const label = `${kw.namaRombel}${kw.waliNama ? ` → ${kw.waliNama}` : ''}`
          if (!idKelas) {
            entry.skipped++
            addDetail(detail, 'skipped', label, 'kelas belum ada di lokal')
            continue
          }
          const [existing]: any = await pool.query(
            `SELECT id_kelas_wali FROM kelas_wali
             WHERE id_kelas = ? AND tahun = ? AND semester = ? LIMIT 1`,
            [idKelas, periode.idTahun, periode.semester]
          )
          if (existing.length > 0) {
            if (idUserFinal) {
              await pool.query(
                'UPDATE kelas_wali SET id_user = ?, ptk_id_dapodik = ? WHERE id_kelas_wali = ?',
                [idUserFinal, kw.ptkWaliId || null, existing[0].id_kelas_wali]
              )
              entry.updated++
              addDetail(detail, 'updated', label, 'wali kelas diperbarui')
            } else {
              entry.skipped++
              addDetail(detail, 'skipped', label, 'wali tidak ditemukan di data DAPODIK')
            }
          } else if (idUserFinal) {
            await pool.query(
              'INSERT INTO kelas_wali (tahun, semester, id_kelas, id_user, ptk_id_dapodik) VALUES (?, ?, ?, ?, ?)',
              [periode.idTahun, periode.semester, idKelas, idUserFinal, kw.ptkWaliId || null]
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
    await setSyncStatus(true, 'Langkah 9/11: Mapel kelas...')
    if (want('ent_mapel')) {
      const entry: SyncEntityResult = { entity: 'Mapel Kelas', endpoint: 'getRombonganBelajar', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        const [mkRows]: any = await pool.query(
          `SELECT id_mapel_kelas, id_kelas, id_mapel, pembelajaran_id_dapodik FROM mapel_kelas
           WHERE deleted_at IS NULL AND pembelajaran_id_dapodik IS NOT NULL`
        )
        const mkByPembelajaran = new Map<string, any>()
        for (const mk of mkRows) mkByPembelajaran.set(String(mk.pembelajaran_id_dapodik), mk)

        for (const mk of mapMapelKelas(rombels)) {
          const kelasId = mk.rombelId ? ctx.kelasByRombelId.get(mk.rombelId) : undefined
          const kelasIdByName = !kelasId ? ctx.kelasMap.get(norm(mk.namaRombel)) : undefined
          const idKelas = kelasId ?? kelasIdByName
          const mapelId = ctx.mapelMap.get(norm(mk.mapelNama))
          const idMapel = mapelId
          const label = `${mk.namaRombel} — ${mk.mapelNama}${mk.guruNama ? ` (${mk.guruNama})` : ''}`
          if (!idKelas || !idMapel) {
            entry.skipped++
            addDetail(detail, 'skipped', label, 'kelas/mapel belum ada di lokal')
            continue
          }
          let existing = mk.pembelajaranId ? mkByPembelajaran.get(mk.pembelajaranId) : undefined
          if (!existing) {
            const [rows]: any = await pool.query(
              `SELECT id_mapel_kelas FROM mapel_kelas
               WHERE tahun = ? AND semester = ? AND id_kelas = ? AND id_mapel = ? LIMIT 1`,
              [periode.idTahun, periode.semester, idKelas, idMapel]
            )
            if (rows.length > 0) existing = rows[0]
          }
          const guru = mk.guruPtkId ? ctx.userByPtkId.get(mk.guruPtkId) : undefined
          const idUser = guru?.id_user ?? (typeof guru === 'number' ? guru : null)
          if (existing) {
            if (idUser || !existing.id_user) {
              await pool.query(
                `UPDATE mapel_kelas SET id_user = ?, pembelajaran_id_dapodik = ?, rombongan_belajar_id_dapodik = ?,
                   jam_mengajar_per_minggu = ?, status_di_kurikulum = ?
                 WHERE id_mapel_kelas = ?`,
                [idUser, mk.pembelajaranId || null, mk.rombelId || null, mk.jamMengajar, mk.statusDiKurikulum || null, existing.id_mapel_kelas]
              )
              entry.updated++
              addDetail(detail, 'updated', label, 'pembelajaran diperbarui')
            } else {
              entry.skipped++
              addDetail(detail, 'skipped', label, 'guru tidak ditemukan di data DAPODIK — pertahankan guru lama')
            }
          } else {
            await pool.query(
              `INSERT INTO mapel_kelas (tahun, semester, id_kelas, id_mapel, id_user, pembelajaran_id_dapodik, rombongan_belajar_id_dapodik, jam_mengajar_per_minggu, status_di_kurikulum)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [periode.idTahun, periode.semester, idKelas, idMapel, idUser, mk.pembelajaranId || null, mk.rombelId || null, mk.jamMengajar, mk.statusDiKurikulum || null]
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

    /* ===== 10. Riwayat Pendidikan Formal (guru) ===== */
    await setSyncStatus(true, 'Langkah 10/11: Riwayat pendidikan guru...')
    if (want('ent_guru')) {
      const entry: SyncEntityResult = { entity: 'Riwayat Pendidikan', endpoint: 'getGtk', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        for (const rpf of mapPendidikanFormal(gtks)) {
          const label = `${rpf.ptkId} — ${rpf.jenjangPendidikan || rpf.satuanPendidikan || '-'}`
          const [existing]: any = await pool.query(
            'SELECT id_riwayat FROM riwayat_pendidikan_formal WHERE riwayat_id_dapodik = ? LIMIT 1',
            [rpf.riwayatId]
          )
          if (existing.length > 0) {
            await pool.query(
              `UPDATE riwayat_pendidikan_formal SET
                 ptk_id_dapodik = ?, satuan_pendidikan = ?, fakultas = ?, kependidikan = ?,
                 tahun_masuk = ?, tahun_lulus = ?, nim = ?, status_kuliah = ?, semester = ?,
                 ipk = ?, prodi = ?, bidang_studi = ?, jenjang_pendidikan = ?, gelar_akademik = ?,
                 deleted_at = NULL
               WHERE id_riwayat = ?`,
              [rpf.ptkId || null, rpf.satuanPendidikan || null, rpf.fakultas || null, rpf.kependidikan || null,
                rpf.tahunMasuk || null, rpf.tahunLulus || null, rpf.nim || null, rpf.statusKuliah || null, rpf.semester || null,
                rpf.ipk || null, rpf.prodi || null, rpf.bidangStudi || null, rpf.jenjangPendidikan || null, rpf.gelarAkademik || null,
                existing[0].id_riwayat]
            )
            entry.updated++
            addDetail(detail, 'updated', label, 'riwayat pendidikan diperbarui')
          } else {
            await pool.query(
              `INSERT INTO riwayat_pendidikan_formal (
                 riwayat_id_dapodik, ptk_id_dapodik, satuan_pendidikan, fakultas, kependidikan,
                 tahun_masuk, tahun_lulus, nim, status_kuliah, semester, ipk, prodi,
                 bidang_studi, jenjang_pendidikan, gelar_akademik
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [rpf.riwayatId, rpf.ptkId || null, rpf.satuanPendidikan || null, rpf.fakultas || null, rpf.kependidikan || null,
                rpf.tahunMasuk || null, rpf.tahunLulus || null, rpf.nim || null, rpf.statusKuliah || null, rpf.semester || null,
                rpf.ipk || null, rpf.prodi || null, rpf.bidangStudi || null, rpf.jenjangPendidikan || null, rpf.gelarAkademik || null]
            )
            entry.inserted++
            addDetail(detail, 'inserted', label, 'riwayat pendidikan baru')
          }
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron riwayat pendidikan'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Riwayat Pendidikan: ${entry.error_msg}`)
      }
    }

    /* ===== 11. Akun Pengguna (getPengguna) ===== */
    await setSyncStatus(true, 'Langkah 11/11: Akun pengguna...')
    if (penggunas.length > 0) {
      const entry: SyncEntityResult = { entity: 'Akun Pengguna', endpoint: 'getPengguna', inserted: 0, updated: 0, skipped: 0, error_msg: null }
      const detail: DetailRow[] = []
      try {
        for (const pg of penggunas) {
          const penggunaId = String(pg.pengguna_id || '')
          const ptkId = String(pg.ptk_id || '')
          const pesertaDidikId = String(pg.peserta_didik_id || '')
          const peran = String(pg.peran_id_str || '')
          if (!penggunaId) {
            entry.skipped++
            continue
          }
          let idUser = penggunaId ? ctx.userByPenggunaId.get(penggunaId) : undefined
          if (!idUser && ptkId) idUser = ctx.userByPtkId.get(ptkId)?.id_user
          if (idUser) {
            await pool.query(
              'UPDATE users SET pengguna_id_dapodik = ?, peran_id_str = ? WHERE id_user = ?',
              [penggunaId, peran || null, idUser]
            )
            ctx.userByPenggunaId.set(penggunaId, idUser)
            entry.updated++
            addDetail(detail, 'updated', peran || penggunaId, 'akun pengguna diperbarui')
          } else {
            entry.skipped++
            addDetail(detail, 'skipped', peran || penggunaId, `belum ada user lokal (ptk=${ptkId.slice(0, 8) || '-'}${pesertaDidikId ? `, pd=${pesertaDidikId.slice(0, 8)}` : ''})`)
          }
        }
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
      } catch (e: any) {
        entry.error_msg = e?.message || 'Gagal sinkron akun pengguna'
        summary.push(entry)
        await writeLog(runId, entry)
        await flushDetail(runId, entry.entity, detail)
        throw new Error(`Gagal pada langkah Akun Pengguna: ${entry.error_msg}`)
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
