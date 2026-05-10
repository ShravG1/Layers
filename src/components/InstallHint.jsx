import { useEffect, useState } from 'react'

// Detects iOS Safari (no native PWA install prompt) and Android Chrome
// (which fires a beforeinstallprompt event we can use directly).
function detect() {
  if (typeof window === 'undefined') return { ios: false, standalone: false }
  const ua = window.navigator.userAgent
  const ios = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua)
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  return { ios, standalone }
}

const LS_KEY = 'wtw_installHintDismissed'

export function InstallHint() {
  const [{ ios, standalone }] = useState(detect)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(LS_KEY) === '1')

  useEffect(() => {
    if (standalone) return
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [standalone])

  if (standalone || dismissed) return null
  if (!ios && !deferredPrompt) return null

  const close = () => {
    localStorage.setItem(LS_KEY, '1')
    setDismissed(true)
  }

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      close()
    }
  }

  return (
    <div className="mx-4 mt-4 rounded-2xl glass-card p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-1">
        <p className="text-white text-sm font-medium">Add Layers to your home screen</p>
        <button onClick={close} className="text-zinc-600 text-lg leading-none">×</button>
      </div>
      {ios ? (
        <p className="text-zinc-500 text-xs leading-relaxed">
          Tap the <span className="text-zinc-300">Share</span> button below, then{' '}
          <span className="text-zinc-300">Add to Home Screen</span>. Then enable daily notifications on the next launch.
        </p>
      ) : (
        <>
          <p className="text-zinc-500 text-xs leading-relaxed mb-3">
            Install for quick access and daily outfit notifications.
          </p>
          <button
            onClick={install}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium"
          >
            Install Layers
          </button>
        </>
      )}
    </div>
  )
}

// Detects whether we're a freshly-installed PWA. Returns true on first launch
// in standalone mode after add-to-home-screen.
export function useFreshlyInstalled() {
  const [fresh, setFresh] = useState(false)
  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (!standalone) return
    const seen = localStorage.getItem('wtw_pwaLaunched')
    if (!seen) {
      localStorage.setItem('wtw_pwaLaunched', '1')
      setFresh(true)
    }
  }, [])
  return fresh
}
