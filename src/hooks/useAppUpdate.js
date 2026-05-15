import { useState, useEffect } from 'react'

export function useAppUpdate() {
  const [needsReload, setNeedsReload] = useState(false)
  const [reg, setReg] = useState(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // With autoUpdate the new SW calls skipWaiting itself.
    // We detect the takeover via controllerchange and prompt a page reload.
    let prevController = navigator.serviceWorker.controller

    const onControllerChange = () => {
      if (prevController) {
        // Genuine update (not first install)
        setNeedsReload(true)
      }
      prevController = navigator.serviceWorker.controller
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    // Also catch the case where a SW is already waiting when the page loads
    navigator.serviceWorker.getRegistration().then(r => {
      if (!r) return
      setReg(r)
      if (r.waiting && navigator.serviceWorker.controller) {
        setNeedsReload(true)
      }
      r.addEventListener('updatefound', () => {
        const incoming = r.installing
        incoming?.addEventListener('statechange', () => {
          if (incoming.state === 'installed' && navigator.serviceWorker.controller) {
            setNeedsReload(true)
          }
        })
      })
    })

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  const applyUpdate = () => {
    // Reload as soon as the new SW takes control — prevents a race where
    // the reload would otherwise be served by the old SW.
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => window.location.reload(),
      { once: true }
    )
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    } else {
      window.location.reload()
    }
    // Safety net: hard-reload after 1.5s if controllerchange never fires
    setTimeout(() => window.location.reload(), 1500)
  }

  return { needsReload, applyUpdate }
}
