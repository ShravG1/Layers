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
    // Tell a waiting SW to take over immediately, then reload.
    // With autoUpdate the SW already skipped waiting, so just reload.
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    } else {
      window.location.reload()
    }
  }

  return { needsReload, applyUpdate }
}
