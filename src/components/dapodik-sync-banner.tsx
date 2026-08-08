'use client'

import { useEffect, useState } from 'react'
import { getDapodikSyncStatusAction } from '@/lib/actions/dapodik-actions'

const POLL_INTERVAL_MS = 30000

export default function DapodikSyncBanner() {
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const check = async () => {
      const res = await getDapodikSyncStatusAction()
      if (!alive) return
      setSyncing(res.syncing)
      setProgress(res.progress)
    }
    check()
    const timer = setInterval(check, POLL_INTERVAL_MS)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [])

  if (!syncing) return null

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <svg
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
      <div className="text-sm text-amber-900">
        <p className="font-semibold">Data sedang disinkron dari DAPODIK</p>
        <p className="mt-0.5 text-amber-800/90">
          Hindari mengubah atau menyimpan data pada periode aktif selama proses berjalan
          {progress ? <span className="font-medium"> · {progress}</span> : null}
        </p>
      </div>
    </div>
  )
}
