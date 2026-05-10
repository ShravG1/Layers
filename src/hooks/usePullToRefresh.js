import { useEffect, useRef, useState } from 'react'

const TRIGGER_DISTANCE = 70
const MAX_PULL = 120

export function usePullToRefresh(scrollRef, onRefresh) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onTouchStart = (e) => {
      if (el.scrollTop > 0 || refreshing) return
      startY.current = e.touches[0].clientY
    }
    const onTouchMove = (e) => {
      if (startY.current == null) return
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0) { setPull(0); return }
      // Resistance curve
      const eased = Math.min(MAX_PULL, dy * 0.5)
      setPull(eased)
    }
    const onTouchEnd = async () => {
      if (startY.current == null) return
      startY.current = null
      if (pull >= TRIGGER_DISTANCE) {
        setRefreshing(true)
        setPull(TRIGGER_DISTANCE)
        try { await onRefresh?.() } catch {}
        setRefreshing(false)
      }
      setPull(0)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: true })
    el.addEventListener('touchend',   onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [scrollRef, onRefresh, pull, refreshing])

  return { pull, refreshing, triggerDistance: TRIGGER_DISTANCE }
}
