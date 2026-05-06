import { useState, useCallback } from 'react'

const LS_KEY = 'wtw_notifications'

export function usePushNotifications() {
  const [permission, setPermission] = useState(() => {
    if (typeof Notification === 'undefined') return 'unsupported'
    return Notification.permission
  })

  const [notifSettings, setNotifSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) : { enabled: false, time: '07:30', prompted: false }
    } catch {
      return { enabled: false, time: '07:30', prompted: false }
    }
  })

  const saveSettings = useCallback((next) => {
    const updated = { ...notifSettings, ...next }
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
    setNotifSettings(updated)
  }, [notifSettings])

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported'
    const result = await Notification.requestPermission()
    setPermission(result)
    saveSettings({ prompted: true, enabled: result === 'granted' })
    return result
  }, [saveSettings])

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

  return { permission, notifSettings, requestPermission, saveSettings, scheduleNotification }
}
