'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast-provider'
import { confirmAlert } from '@/lib/swal'
import { savePengaturan, addTahunPelajaran, deleteTahunPelajaran } from '@/lib/actions/pengaturan-actions'

const toDateInput = (val: any): string => {
  if (!val) return ''
  if (typeof val === 'string') return val.split('T')[0]
  if (val instanceof Date) return val.toISOString().split('T')[0]
  return String(val).split('T')[0]
}

interface Props {
  sekolah: any
  semester: any[]
  tahunPel: any[]
  pembagian: any
}

export default function PengaturanClient({ sekolah, semester, tahunPel, pembagian }: Props) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)
  const [tahunInput, setTahunInput] = useState('')

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    const ok = await confirmAlert(
      'Simpan Pengaturan?',
      'Semester/tahun aktif akan diubah. Semua halaman akan menampilkan data periode baru.'
    )
    if (!ok) return

    setSaving(true)
    const result = await savePengaturan(fd)
    if (result.success) {
      showToast('Pengaturan berhasil disimpan!', 'success')
    } else {
      showToast(result.error || 'Gagal menyimpan pengaturan!', 'error')
    }
    setSaving(false)
  }

  const handleAddTahun = async () => {
    const nama = tahunInput.trim()
    if (!nama) return
    setAdding(true)
    const result = await addTahunPelajaran(nama)
    if (result.success) {
      showToast('Tahun pelajaran berhasil ditambahkan!', 'success')
      setTahunInput('')
    } else {
      showToast(result.error || 'Gagal menambah tahun pelajaran!', 'error')
    }
    setAdding(false)
  }

  const handleDeleteTahun = async (id: number, nama: string) => {
    const ok = await confirmAlert('Hapus Tahun Pelajaran', `Hapus ${nama}?`)
    if (!ok) return
    const result = await deleteTahunPelajaran(id)
    if (result.success) {
      showToast('Tahun pelajaran berhasil dihapus!', 'success')
    } else {
      showToast(result.error || 'Gagal menghapus tahun pelajaran!', 'error')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pengaturan Rapor */}
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Pengaturan Rapor</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Tanggal Pembagian Rapor</label>
              <input type="date" name="tanggal_rapor" defaultValue={toDateInput(pembagian?.tanggal_rapor)} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Tanggal Pembagian Middle</label>
              <input type="date" name="tanggal_mid" defaultValue={toDateInput(pembagian?.tanggal_mid)} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Lokasi TTD Rapor</label>
              <select name="lokasi" defaultValue={sekolah?.lokasi || 1} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                <option value={1}>Kabupaten</option>
                <option value={2}>Kecamatan</option>
                <option value={3}>Desa / Kelurahan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Tahun Pelajaran Aktif</label>
              <select name="tahun" defaultValue={sekolah?.tahun || ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                {tahunPel.map((tp: any) => (
                  <option key={tp.id_tahun_pelajaran} value={tp.id_tahun_pelajaran}>{tp.tahun_pelajaran}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">Semester Aktif</label>
              <select name="semester" defaultValue={sekolah?.semester || ''} className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all">
                {semester.map((s: any) => (
                  <option key={s.id_semester} value={s.id_semester}>{s.semester}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#DC2626] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        </div>
      </div>

      {/* Tahun Pelajaran */}
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Tahun Pelajaran</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <input
              value={tahunInput}
              onChange={(e) => setTahunInput(e.target.value)}
              placeholder="Contoh: 2026/2027"
              className="flex-1 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
            />
            <button
              onClick={handleAddTahun}
              disabled={adding || !tahunInput.trim()}
              className="bg-[#DC2626] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 transition-all flex-shrink-0"
            >
              {adding ? '...' : 'Tambah'}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.04)]">
                <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">No</th>
                <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Tahun Pelajaran</th>
                <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Status</th>
                <th className="text-left px-3 py-3 text-[#6B7280] text-xs uppercase tracking-wider font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tahunPel.map((tp: any, i: number) => {
                const isActive = Number(tp.id_tahun_pelajaran) === Number(sekolah?.tahun)
                return (
                  <tr key={tp.id_tahun_pelajaran} className="border-b border-[rgba(0,0,0,0.03)] hover:bg-[#F8F9FB] transition-colors">
                    <td className="px-3 py-3 text-sm text-[#1A1A2E]/70">{i + 1}</td>
                    <td className="px-3 py-3 text-sm text-[#1A1A2E]">{tp.tahun_pelajaran}</td>
                    <td className="px-3 py-3">
                      {isActive && (
                        <span className="inline-flex items-center text-xs font-medium text-white bg-[#DC2626] rounded-full px-2.5 py-0.5">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {!isActive && (
                        <button
                          onClick={() => handleDeleteTahun(tp.id_tahun_pelajaran, tp.tahun_pelajaran)}
                          className="text-[#DC2626]/70 hover:text-[#DC2626] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
