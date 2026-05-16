import { useState, useEffect, useCallback, useRef } from 'react'

const WORKER_URL = import.meta.env.VITE_PUSH_WORKER_URL || ''

// localStorage keys that hold real user data worth backing up.
export const BACKUP_KEYS = [
  'wtw_history',
  'wtw_preferences',
  'wtw_settings',
  'wtw_saved_locations',
  'wtw_notifications',
]

const CODE_KEY = 'wtw_backup_code'
const META_KEY = 'wtw_backup_meta'

// Unambiguous alphabet — no 0/O, 1/I/L.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export const backupConfigured = Boolean(WORKER_URL)

function genCode() {
  const a = new Uint32Array(8)
  crypto.getRandomValues(a)
  return [...a].map(n => ALPHABET[n % ALPHABET.length]).join('')
}

export function getBackupCode() {
  let c = localStorage.getItem(CODE_KEY)
  if (!c || c.length !== 8) {
    c = genCode()
    localStorage.setItem(CODE_KEY, c)
  }
  return c
}

export function formatCode(c) {
  return c ? `${c.slice(0, 4)}-${c.slice(4)}` : ''
}

export function normalizeCode(input) {
  const c = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  return /^[A-Z0-9]{8}$/.test(c) ? c : null
}

function collect() {
  const data = {}
  for (const k of BACKUP_KEYS) {
    const v = localStorage.getItem(k)
    if (v != null) data[k] = v
  }
  return data
}

function hash(obj) {
  const s = JSON.stringify(obj)
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return h
}

function readMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY)) || {} } catch { return {} }
}
function writeMeta(m) {
  localStorage.setItem(META_KEY, JSON.stringify(m))
}

// Pull a backup for `code` and write it into localStorage. Caller should
// reload afterwards so hooks re-read storage. Used by onboarding too.
export async function restoreFromCode(rawCode) {
  if (!WORKER_URL) return { ok: false, error: 'Backup is not configured.' }
  const code = normalizeCode(rawCode)
  if (!code) return { ok: false, error: 'That code doesn\'t look right.' }
  let res
  try {
    res = await fetch(`${WORKER_URL}/sync/restore?code=${code}`)
  } catch {
    return { ok: false, error: 'Network error — try again.' }
  }
  if (res.status === 404) return { ok: false, error: 'No backup found for that code.' }
  if (!res.ok) return { ok: false, error: 'Restore failed — try again.' }
  const body = await res.json().catch(() => null)
  if (!body?.data) return { ok: false, error: 'Backup was empty.' }
  for (const [k, v] of Object.entries(body.data)) {
    if (BACKUP_KEYS.includes(k) && typeof v === 'string') localStorage.setItem(k, v)
  }
  localStorage.setItem(CODE_KEY, code)
  writeMeta({ lastBackup: body.updatedAt || Date.now(), lastHash: hash(collect()) })
  return { ok: true, updatedAt: body.updatedAt }
}

export function useCloudBackup() {
  const [code] = useState(() => (backupConfigured ? getBackupCode() : ''))
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [lastBackup, setLastBackup] = useState(() => readMeta().lastBackup || null)
  const inFlight = useRef(false)

  const push = useCallback(async ({ force = false } = {}) => {
    if (!backupConfigured || inFlight.current) return
    const data = collect()
    if (Object.keys(data).length === 0) return
    const h = hash(data)
    if (!force && readMeta().lastHash === h) return

    inFlight.current = true
    setStatus('saving')
    try {
      const res = await fetch(`${WORKER_URL}/sync/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, data }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const body = await res.json()
      const ts = body.updatedAt || Date.now()
      writeMeta({ lastBackup: ts, lastHash: h })
      setLastBackup(ts)
      setStatus('saved')
    } catch {
      setStatus('error')
    } finally {
      inFlight.current = false
    }
  }, [code])

  // Auto-backup: shortly after open, when the tab is hidden, and periodically.
  useEffect(() => {
    if (!backupConfigured) return
    const t = setTimeout(() => push(), 4000)
    const onHide = () => { if (document.visibilityState === 'hidden') push() }
    document.addEventListener('visibilitychange', onHide)
    const iv = setInterval(() => push(), 5 * 60 * 1000)
    return () => {
      clearTimeout(t)
      clearInterval(iv)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [push])

  return {
    configured: backupConfigured,
    code: formatCode(code),
    status,
    lastBackup,
    backupNow: () => push({ force: true }),
    restore: restoreFromCode,
  }
}
