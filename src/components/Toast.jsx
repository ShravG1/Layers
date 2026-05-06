import { useEffect } from 'react'

export function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-xs w-full px-4">
      <div className="animate-toast bg-indigo-600 text-white text-sm rounded-2xl px-4 py-3 shadow-xl text-center">
        {message}
      </div>
    </div>
  )
}
