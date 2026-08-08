'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast-provider'
import { confirmAlert } from '@/lib/swal'
import {
  saveDapodikConfig,
  testDapodikConnection,
  cekPeriodeDapodik,
  syncDapodik,
  getDapodikLogDetail,
  type DapodikLogDetailRow,
} from '@/lib/actions/dapodik-actions'
import ModalDetailSinkron from './modal-detail-sinkron'

const ENTITAS = [
  { key: 'ent_sekolah', label: 'Sekolah & Periode Aktif', desc: 'Profil sekolah (NPSN, alamat, kontak) + tahun/semester aktif', endpoint: 'getSekolah' },
  { key: 'ent_jurusan', label: 'Kompetensi Keahlian', desc: 'Tambah jurusan baru dari rombongan belajar', endpoint: 'getRombonganBelajar' },
  { key: 'ent_kelas', label: 'Kelas & Wali Kelas', desc: 'Kelas baru + update tingkat/jurusan + penunjukkan wali kelas', endpoint: 'getRombonganBelajar' },
  { key: 'ent_mapel', label: 'Mata Pelajaran & Mapel Kelas', desc: 'Mapel baru dari pembelajaran + penugasan guru pengampu per kelas', endpoint: 'getRombonganBelajar' },
  { key: 'ent_guru', label: 'Guru / PTK', desc: 'Data guru dari getGtk (update yang ada, tambah yang baru)', endpoint: 'getGtk' },
  { key: 'ent_siswa', label: 'Siswa & Keanggotaan Kelas', desc: 'Data siswa + orang tua dari getPesertaDidik, tanpa akun login', endpoint: 'getPesertaDidik' },
]

interface Props {
  config: any
  logs: any[]
}

interface PeriodeInfo {
  detected: { label: string; semester: string }
  adaDiLokal: boolean
  periodeAktif: { label: string; semester: string }
}

interface SyncPeriodeInfo {
  label: string
  semester: number
  autoCreated: boolean
  periodeAktif: { label: string; semester: string }
}

const namaSemester = (s: number | string) => (Number(s) === 2 ? 'Genap' : 'Ganjil')

export default function SingkronClient({ config, logs }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [url, setUrl] = useState(config?.url || '')
  const [token, setToken] = useState(config?.token || '')
  const [npsn, setNpsn] = useState(config?.npsn || '')
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [checkingPeriode, setCheckingPeriode] = useState(false)
  const [periodeInfo, setPeriodeInfo] = useState<PeriodeInfo | null>(null)
  const [syncPeriodeInfo, setSyncPeriodeInfo] = useState<SyncPeriodeInfo | null>(null)
  const [summary, setSummary] = useState<any[] | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [detailStatus, setDetailStatus] = useState<'inserted' | 'updated' | 'skipped' | null>(null)
  const [detailRows, setDetailRows] = useState<DapodikLogDetailRow[] | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({
    ent_sekolah: true,
    ent_jurusan: true,
    ent_kelas: true,
    ent_mapel: true,
    ent_guru: true,
    ent_siswa: true,
  })

  const handleSave = async () => {
    setSaving(true)
    const fd = new FormData()
    fd.set('url', url)
    fd.set('token', token)
    fd.set('npsn', npsn)
    const result = await saveDapodikConfig(fd)
    if (result.success) {
      showToast('Konfigurasi DAPODIK disimpan!', 'success')
    } else {
      showToast(result.error || 'Gagal menyimpan konfigurasi!', 'error')
    }
    setSaving(false)
  }

  const handleTest = async () => {
    setTesting(true)
    const result = await testDapodikConnection(
      url.trim() || undefined,
      token.trim() || undefined,
      npsn.trim() || undefined
    )
    if (result.success) {
      showToast(result.message, 'success')
    } else {
      showToast(result.message, 'error')
    }
    setTesting(false)
  }

  const handleCekPeriode = async () => {
    setCheckingPeriode(true)
    setPeriodeInfo(null)
    const result = await cekPeriodeDapodik()
    if (result.ok) {
      setPeriodeInfo(result)
    } else {
      showToast(result.error || 'Gagal memeriksa periode!', 'error')
    }
    setCheckingPeriode(false)
  }

  const handleSync = async () => {
    const aktif = ENTITAS.filter((e) => checked[e.key])
    if (aktif.length === 0) {
      showToast('Pilih minimal satu entitas untuk disinkronkan!', 'error')
      return
    }
    const ok = await confirmAlert(
      'Mulai Sinkronisasi?',
      `Data ${aktif.length} entitas akan ditarik dari server DAPODIK. Data yang sudah ada akan diperbarui (tidak ada yang dihapus). Lanjutkan?`
    )
    if (!ok) return

    setSyncing(true)
    setSummary(null)
    setRunId(null)
    setSyncPeriodeInfo(null)
    const fd = new FormData()
    for (const e of aktif) fd.set(e.key, '1')
    const result = await syncDapodik(fd)
    if (result.success) {
      showToast('Sinkronisasi DAPODIK berhasil!', 'success')
      setSummary(result.summary)
      if (result.runId) setRunId(result.runId)
      if (result.periode) setSyncPeriodeInfo(result.periode)
    } else {
      showToast(result.error || 'Sinkronisasi gagal!', 'error')
      if (result.summary && result.summary.length > 0) setSummary([...result.summary])
      if (result.runId) setRunId(result.runId)
    }
    setSyncing(false)
    router.refresh()
  }

  const openDetail = async (status: 'inserted' | 'updated' | 'skipped') => {
    if (!runId) {
      showToast('Detail tidak tersedia untuk sesi ini.', 'error')
      return
    }
    setDetailStatus(status)
    setDetailRows(null)
    setDetailLoading(true)
    const result = await getDapodikLogDetail(runId)
    if (result.success) {
      setDetailRows(result.rows)
    } else {
      showToast(result.error || 'Gagal memuat detail!', 'error')
      setDetailStatus(null)
    }
    setDetailLoading(false)
  }

  const fmtDate = (d: any) => {
    if (!d) return '-'
    return new Date(d).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
  }

  const totalSync = summary
    ? summary.reduce((acc: any, s: any) => ({ inserted: acc.inserted + s.inserted, updated: acc.updated + s.updated, skipped: acc.skipped + s.skipped }), { inserted: 0, updated: 0, skipped: 0 })
    : null

  return (
    <div className="space-y-6">
      {/* Konfigurasi */}
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-[#1A1A2E]">Konfigurasi Webservice DAPODIK</h3>
          {config?.last_sync_at && (
            <span className="text-xs text-[#6B7280]">Sinkron terakhir: {fmtDate(config.last_sync_at)}</span>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">URL Webservice</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://ip-server:5774/WebService/"
                className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Token</label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Token akses DAPODIK"
                className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">NPSN</label>
              <input
                value={npsn}
                onChange={(e) => setNpsn(e.target.value)}
                placeholder="NPSN sekolah"
                className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleTest}
              disabled={testing || syncing}
              className="px-4 py-2.5 rounded-xl border border-[#DC2626] text-[#DC2626] text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {testing ? 'Menguji...' : 'Test Koneksi'}
            </button>
            <button
              onClick={handleCekPeriode}
              disabled={checkingPeriode || syncing}
              className="px-4 py-2.5 rounded-xl border border-[#1A1A2E]/20 text-[#1A1A2E] text-sm font-medium hover:bg-[#1A1A2E]/5 transition-colors disabled:opacity-50"
            >
              {checkingPeriode ? 'Memeriksa...' : 'Cek Periode DAPODIK'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || syncing}
              className="px-4 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-sm font-medium hover:bg-[#2a2a4a] transition-colors disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>
          </div>

          {periodeInfo && (
            <div
              className={`mt-4 rounded-xl p-4 text-sm border ${
                periodeInfo.detected.label === periodeInfo.periodeAktif.label &&
                periodeInfo.detected.semester === periodeInfo.periodeAktif.semester
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : periodeInfo.adaDiLokal
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <p className="font-medium">
                Periode DAPODIK: {periodeInfo.detected.label} · {periodeInfo.detected.semester}
              </p>
              <p className="mt-1 opacity-90">
                Periode aktif sekolah: {periodeInfo.periodeAktif.label} · {periodeInfo.periodeAktif.semester}
              </p>
              {periodeInfo.detected.label === periodeInfo.periodeAktif.label &&
              periodeInfo.detected.semester === periodeInfo.periodeAktif.semester ? (
                <p className="mt-1 opacity-90">Periode DAPODIK sesuai dengan periode aktif sekolah.</p>
              ) : periodeInfo.adaDiLokal ? (
                <p className="mt-1 opacity-90">
                  Periode berbeda dari periode aktif — tahun pelajaran {periodeInfo.detected.label} sudah terdaftar,
                  sinkronisasi akan berjalan normal.
                </p>
              ) : (
                <p className="mt-1 opacity-90">
                  Periode berbeda dari periode aktif — tahun pelajaran {periodeInfo.detected.label} belum ada dan akan
                  <b> dibuat otomatis </b>
                  saat sinkronisasi.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Checklist entitas */}
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Sinkronisasi Data</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {ENTITAS.map((e) => (
              <label
                key={e.key}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  checked[e.key]
                    ? 'border-[#DC2626]/40 bg-red-50/40'
                    : 'border-[rgba(0,0,0,0.08)] bg-[#F8F9FB]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checked[e.key]}
                  onChange={() => setChecked((c) => ({ ...c, [e.key]: !c[e.key] }))}
                  className="mt-0.5 accent-[#DC2626]"
                />
                <span>
                  <span className="block text-sm font-medium text-[#1A1A2E]">{e.label}</span>
                  <span className="block text-xs text-[#6B7280] mt-0.5">{e.desc}</span>
                </span>
              </label>
            ))}
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-6 py-2.5 rounded-xl bg-[#DC2626] text-white text-sm font-medium hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
          >
            {syncing ? 'Menyinkronkan...' : 'Mulai Sinkronisasi'}
          </button>

          {syncPeriodeInfo && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 p-4 text-sm">
              <p className="font-medium">
                Periode terdeteksi: {syncPeriodeInfo.label} · {namaSemester(syncPeriodeInfo.semester)}
              </p>
              {syncPeriodeInfo.autoCreated ? (
                <p className="mt-1 opacity-90">
                  Tahun pelajaran {syncPeriodeInfo.label} dibuat otomatis dan menjadi periode aktif baru.
                </p>
              ) : (
                <p className="mt-1 opacity-90">Tahun pelajaran {syncPeriodeInfo.label} sudah terdaftar sebelumnya.</p>
              )}
              <p className="mt-1 opacity-90">
                Periode aktif sebelumnya: {syncPeriodeInfo.periodeAktif.label} · {syncPeriodeInfo.periodeAktif.semester}
              </p>
            </div>
          )}

          {totalSync && (
            <div className="mt-5 grid grid-cols-3 gap-3 max-w-md">
              <button
                onClick={() => openDetail('inserted')}
                className="bg-[#F8F9FB] rounded-xl p-3.5 text-center border border-[rgba(0,0,0,0.06)] hover:border-[#1A1A2E]/30 hover:bg-white transition-all group"
              >
                <div className="text-2xl font-bold text-[#1A1A2E]">{totalSync.inserted}</div>
                <div className="text-xs text-[#6B7280] mt-0.5 group-hover:text-[#1A1A2E]">Ditambahkan</div>
                <div className="text-[10px] text-[#6B7280] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Lihat detail</div>
              </button>
              <button
                onClick={() => openDetail('updated')}
                className="bg-[#F8F9FB] rounded-xl p-3.5 text-center border border-[rgba(0,0,0,0.06)] hover:border-[#DC2626]/40 hover:bg-white transition-all group"
              >
                <div className="text-2xl font-bold text-[#DC2626]">{totalSync.updated}</div>
                <div className="text-xs text-[#6B7280] mt-0.5 group-hover:text-[#DC2626]">Diperbarui</div>
                <div className="text-[10px] text-[#6B7280] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Lihat detail</div>
              </button>
              <button
                onClick={() => openDetail('skipped')}
                className="bg-[#F8F9FB] rounded-xl p-3.5 text-center border border-[rgba(0,0,0,0.06)] hover:border-[#6B7280]/40 hover:bg-white transition-all group"
              >
                <div className="text-2xl font-bold text-[#6B7280]">{totalSync.skipped}</div>
                <div className="text-xs text-[#6B7280] mt-0.5 group-hover:text-[#6B7280]">Dilewati</div>
                <div className="text-[10px] text-[#6B7280] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Lihat detail</div>
              </button>
            </div>
          )}

          {summary && summary.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.06)] text-left text-xs text-[#6B7280] uppercase tracking-wide">
                    <th className="py-2.5 pr-4">Entitas</th>
                    <th className="py-2.5 pr-4">Endpoint</th>
                    <th className="py-2.5 pr-4">Ditambah</th>
                    <th className="py-2.5 pr-4">Update</th>
                    <th className="py-2.5 pr-4">Lewati</th>
                    <th className="py-2.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s: any, i: number) => (
                    <tr key={i} className="border-b border-[rgba(0,0,0,0.04)]">
                      <td className="py-2.5 pr-4 font-medium text-[#1A1A2E]">{s.entity}</td>
                      <td className="py-2.5 pr-4 text-[#6B7280]">{s.endpoint}</td>
                      <td className="py-2.5 pr-4">{s.inserted}</td>
                      <td className="py-2.5 pr-4">{s.updated}</td>
                      <td className="py-2.5 pr-4">{s.skipped}</td>
                      <td className="py-2.5 text-xs text-[#DC2626]">{s.error_msg || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Riwayat log */}
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Riwayat Sinkronisasi</h3>
        </div>
        <div className="p-6 overflow-x-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-[#6B7280]">Belum ada riwayat sinkronisasi.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.06)] text-left text-xs text-[#6B7280] uppercase tracking-wide">
                  <th className="py-2.5 pr-4">Waktu</th>
                  <th className="py-2.5 pr-4">Entitas</th>
                  <th className="py-2.5 pr-4">Ditambah</th>
                  <th className="py-2.5 pr-4">Update</th>
                  <th className="py-2.5 pr-4">Lewati</th>
                  <th className="py-2.5">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b border-[rgba(0,0,0,0.04)]">
                    <td className="py-2.5 pr-4 text-[#6B7280] whitespace-nowrap">{fmtDate(log.created_at)}</td>
                    <td className="py-2.5 pr-4 font-medium text-[#1A1A2E]">{log.entity}</td>
                    <td className="py-2.5 pr-4">{log.inserted}</td>
                    <td className="py-2.5 pr-4">{log.updated}</td>
                    <td className="py-2.5 pr-4">{log.skipped}</td>
                    <td className="py-2.5 text-xs text-[#DC2626]">{log.error_msg || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {detailStatus && (
        <ModalDetailSinkron
          status={detailStatus}
          rows={detailRows}
          loading={detailLoading}
          onClose={() => setDetailStatus(null)}
        />
      )}
    </div>
  )
}
