import { pool } from './db'

/** Jika sync ditandai berjalan lebih dari batas ini (server crash/restart),
 *  status dianggap basi dan otomatis di-reset. */
const STALE_AFTER_MS = 30 * 60 * 1000

export interface DapodikSyncStatus {
  syncing: boolean
  progress: string | null
}

export async function getDapodikSyncStatus(): Promise<DapodikSyncStatus> {
  try {
    const [rows]: any = await pool.query(
      'SELECT syncing, sync_started_at, sync_progress FROM dapodik_config WHERE id = 1 LIMIT 1'
    )
    const cfg = rows?.[0]
    if (!cfg || Number(cfg.syncing) !== 1) {
      return { syncing: false, progress: null }
    }

    const startedAt = cfg.sync_started_at ? new Date(cfg.sync_started_at).getTime() : 0
    if (!startedAt || Date.now() - startedAt > STALE_AFTER_MS) {
      await pool.query(
        'UPDATE dapodik_config SET syncing = 0, sync_progress = NULL WHERE id = 1'
      )
      return { syncing: false, progress: null }
    }

    return { syncing: true, progress: cfg.sync_progress || null }
  } catch (e) {
    console.error('getDapodikSyncStatus error:', e)
    return { syncing: false, progress: null }
  }
}
