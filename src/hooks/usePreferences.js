import { useState, useCallback } from 'react'

const LS_KEY = 'wtw_preferences'

const DEFAULT_PREFS = {
  offset: 0,               // -3 run cold, 0 average, +3 run warm
  bucketAdjustments: {},   // { [bucketLabel]: -1 | 0 | 1 }
  feedbackLog: [],          // [{ bucket, feelsLike, feedback, timestamp }]
  onboardingDone: false,
  thermalProfile: 'average', // 'warm' | 'average' | 'cold'
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

function save(prefs) {
  localStorage.setItem(LS_KEY, JSON.stringify(prefs))
}

export function usePreferences() {
  const [prefs, setPrefs] = useState(load)

  const update = useCallback((next) => {
    setPrefs(prev => {
      const updated = typeof next === 'function' ? next(prev) : { ...prev, ...next }
      save(updated)
      return updated
    })
  }, [])

  // Called from onboarding
  const setThermalProfile = useCallback((profile) => {
    const offset = profile === 'warm' ? 3 : profile === 'cold' ? -3 : 0
    update({ offset, thermalProfile: profile, onboardingDone: true })
  }, [update])

  // Record hot/cold feedback and auto-adjust if threshold met
  const recordFeedback = useCallback((bucket, feelsLike, feedback) => {
    // feedback: 'warm' | 'ok' | 'cold'
    update(prev => {
      const log = [
        ...prev.feedbackLog,
        { bucket, feelsLike, feedback, timestamp: Date.now() },
      ]

      const bucketLogs = log.filter(l => l.bucket === bucket)
      const warmCount  = bucketLogs.filter(l => l.feedback === 'warm').length
      const coldCount  = bucketLogs.filter(l => l.feedback === 'cold').length
      const THRESHOLD  = 5

      let adj = prev.bucketAdjustments[bucket] ?? 0
      let toastBucket = null

      if (warmCount >= THRESHOLD && warmCount > coldCount) {
        adj = Math.max(adj - 1, -1)
        toastBucket = bucket
      } else if (coldCount >= THRESHOLD && coldCount > warmCount) {
        adj = Math.min(adj + 1, 1)
        toastBucket = bucket
      }

      return {
        ...prev,
        feedbackLog: log,
        bucketAdjustments: { ...prev.bucketAdjustments, [bucket]: adj },
        pendingToast: toastBucket,
      }
    })
  }, [update])

  const clearPendingToast = useCallback(() => {
    update({ pendingToast: null })
  }, [update])

  const resetPreferences = useCallback(() => {
    const fresh = { ...DEFAULT_PREFS }
    save(fresh)
    setPrefs(fresh)
  }, [])

  const resetOnboarding = useCallback(() => {
    update({ onboardingDone: false })
  }, [update])

  return {
    prefs,
    setThermalProfile,
    recordFeedback,
    clearPendingToast,
    resetPreferences,
    resetOnboarding,
    update,
  }
}
