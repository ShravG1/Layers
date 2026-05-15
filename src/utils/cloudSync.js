// Automatic cloud backup so data survives PWA reinstalls.
// Keyed by a single hardcoded personal key — this is a personal app
// with no sensitive data, so there's no per-user auth.

const WORKER_URL = import.meta.env.VITE_PUSH_WORKER_URL || ''
const PERSONAL_KEY = 'layers-shrav-7f3a9c1e6b2d480a'

const DATA_KEYS = [
  'wtw_settings', 'wtw_history', 'wtw_preferences',
  'wtw_saved_locations', 'wtw_notifications',
  'wtw_installHintDismissed', 'wtw_lastMoodPromptDate', 'wtw_pwaLaunched',
]

function snapshot() {
  const data = {}
  for (const key of DATA_KEYS) {
    const val = localStorage.getItem(key)
    if (val !== null) data[key] = val
  }
  return data
}

let lastSent = ''

// Push the current localStorage state to the cloud (skips if unchanged).
export async function pushBackup() {
  if (!WORKER_URL) return
  const data = snapshot()
  const serialized = JSON.stringify(data)
  if (serialized === lastSent || serialized === '{}') return
  try {
    await fetch(`${WORKER_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ k: PERSONAL_KEY, data }),
    })
    lastSent = serialized
  } catch {
    // Offline / transient — will retry on the next trigger.
  }
}

// On a fresh install (no local data) pull the cloud backup and restore it.
// Returns true if data was restored (caller should reload).
export async function restoreIfEmpty() {
  if (!WORKER_URL) return false
  const hasLocal = DATA_KEYS.some(k => localStorage.getItem(k) !== null)
  if (hasLocal) return false
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(
      `${WORKER_URL}/sync?k=${encodeURIComponent(PERSONAL_KEY)}`,
      { signal: ctrl.signal },
    )
    clearTimeout(t)
    if (!res.ok) return false
    const data = await res.json()
    const keys = Object.keys(data || {})
    if (keys.length === 0) return false
    for (const key of keys) {
      if (DATA_KEYS.includes(key)) localStorage.setItem(key, data[key])
    }
    lastSent = JSON.stringify(snapshot())
    return true
  } catch {
    return false
  }
}

// Start periodic + lifecycle-driven backups.
export function startAutoSync() {
  if (!WORKER_URL) return
  const interval = setInterval(pushBackup, 30000)
  const onHide = () => { if (document.visibilityState === 'hidden') pushBackup() }
  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('pagehide', pushBackup)
  return () => {
    clearInterval(interval)
    document.removeEventListener('visibilitychange', onHide)
    window.removeEventListener('pagehide', pushBackup)
  }
}
