'use client'

import type { DapodikLogDetailRow } from '@/lib/actions/dapodik-actions'

const STATUS_META: Record<string, { title: string; badge: string; dot: string }> = {
  inserted: { title: 'Ditambahkan', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  updated: { title: 'Diperbarui', badge: 'bg-red-50 text-[#DC2626] border-red-200', dot: 'bg-[#DC2626]' },
  skipped: { title: 'Dilewati', badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
}

const ENTITY_ORDER = [
  'Sekolah',
  'Kompetensi Keahlian',
  'Kelas',
  'Mata Pelajaran',
  'Guru/PTK',
  'Siswa',
  'Siswa Kelas',
  'Wali Kelas',
  'Mapel Kelas',
]

interface Props {
  status: 'inserted' | 'updated' | 'skipped'
  rows: DapodikLogDetailRow[] | null
  loading: boolean
  onClose: () => void
}

export default function ModalDetailSinkron({ status, rows, loading, onClose }: Props) {
  const meta = STATUS_META[status]
  const filtered = rows?.filter((r) => r.status === status) || []
  const total = filtered.length

  const grouped = ENTITY_ORDER.map((entity) => ({
    entity,
    items: filtered.filter((r) => r.entity === entity),
  })).filter((g) => g.items.length > 0)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
            <h3 className="font-semibold text-[#1A1A2E]">
              Detail {meta.title}
              {!loading && rows && <span className="text-sm font-normal text-[#6B7280] ml-2">({total} data)</span>}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F8F9FB] hover:text-[#1A1A2E] transition-colors"
            aria-label="Tutup"
          >
            <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-10 text-sm text-[#6B7280]">
              <span className="w-5 h-5 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin mr-2" />
              Memuat detail...
            </div>
          )}

          {!loading && !rows && (
            <p className="text-sm text-[#6B7280] py-8 text-center">
              Tidak ada data yang ditambahkan/diperbarui/dilewati dalam sesi ini.
            </p>
          )}

          {!loading && rows && total === 0 && (
            <p className="text-sm text-[#6B7280] py-8 text-center">Tidak ada data berstatus {meta.title.toLowerCase()} dalam sesi ini.</p>
          )}

          {!loading && rows && grouped.map((g) => (
            <div key={g.entity}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-[#1A1A2E]">{g.entity}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.badge}`}>{g.items.length}</span>
              </div>
              <ul className="divide-y divide-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.06)] rounded-xl bg-[#F8F9FB]">
                {g.items.map((r, i) => (
                  <li key={i} className="px-3.5 py-2.5 flex items-start justify-between gap-3">
                    <span className="text-sm text-[#1A1A2E] break-words">{r.label}</span>
                    {r.keterangan && <span className="text-xs text-[#6B7280] whitespace-nowrap mt-0.5">{r.keterangan}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-[rgba(0,0,0,0.06)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1A1A2E] text-white text-sm font-medium hover:bg-[#2a2a4a] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
