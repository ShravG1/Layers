import { useState, useCallback } from 'react'

const LS_KEY = 'wtw_notifications'

// Set this to your deployed worker URL. Empty disables remote subscribe.
const WORKER_URL = import.meta.env.VITE_PUSH_WORKER_URL || ''
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlB64ToUint8Array(b64) {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4)
  const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i)
  return out
}

// The worker cron fires hourly and stores an integer localHour, so notification
// time is hour-granular. Parse "HH:MM" (or "HH") to a 0-23 hour, defaulting to 7.
export function notifTimeToHour(time) {
  const h = parseInt(String(time ?? '').split(':')[0], 10)
  return Number.isFinite(h) && h >= 0 && h <= 23 ? h : 7
}

function loadStored() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : { enabled: false, time: '07:00', prompted: false }
  } catch {
    return { enabled: false, time: '07:00', prompted: false }
  }
}

export function usePushNotifications() {
  const [permission, setPermission] = useState(() => {
    if (typeof Notification === 'undefined') return 'unsupported'
    return Notification.permission
  })
  const [notifSettings, setNotifSettings] = useState(loadStored)

  const saveSettings = useCallback((next) => {
    setNotifSettings(prev => {
      const updated = { ...prev, ...next }
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const subscribeToPush = useCallback(async ({ lat, lon, city, localHour } = {}) => {
    if (!WORKER_URL || !VAPID_PUBLIC_KEY) return null
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    const tzOffsetMin = -new Date().getTimezoneOffset()
    const body = {
      subscription: sub.toJSON(),
      lat,
      lon,
      city,
      localHour: localHour ?? 7,
      tzOffsetMin,
    }
    try {
      await fetch(`${WORKER_URL}/subscribe`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
    } catch (e) {
      console.warn('subscribe failed', e)
    }
    return sub
  }, [])

  const requestPermission = useCallback(async (subscribeOpts) => {
    if (typeof Notification === 'undefined') return 'unsupported'
    const result = await Notification.requestPermission()
    setPermission(result)
    saveSettings({ prompted: true, enabled: result === 'granted' })
    if (result === 'granted') {
      try { await subscribeToPush(subscribeOpts) } catch (e) { console.warn(e) }
    }
    return result
  }, [saveSettings, subscribeToPush])

  const scheduleNotification = useCallback((title, body) => {
    if (permission !== 'granted') return
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png' })
      })
    } else {
      new Notification(title, { body, icon: '/icon-192.png' })
    }
  }, [permission])

  return { permission, notifSettings, requestPermission, saveSettings, scheduleNotification, subscribeToPush }
}
