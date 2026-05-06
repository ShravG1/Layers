import { useState, useCallback } from 'react'
import { DEFAULT_WARDROBE } from '../utils/wardrobe.js'

const LS_KEY = 'wtw_preferences'

const DEFAULT_PREFS = {
  offset: 0,
  bucketAdjustments: {},
  feedbackLog: [],
  onboardingDone: false,
  thermalProfile: 'average',
  wardrobe: DEFAULT_WARDROBE,
  customExtras: [], // [{ id, label, emoji }]
  dailyMoodLog: [], // [{ date, mood: 'cold'|'ok'|'warm', morningPeak, eveningTemp, droppedSignificantly }]
  acknowledgedDrop: null, // last date user confirmed cold-drop
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

  const setThermalProfile = useCallback((profile) => {
    const offset = profile === 'warm' ? 3 : profile === 'cold' ? -3 : 0
    update({ offset, thermalProfile: profile })
  }, [update])

  const completeOnboarding = useCallback(({ profile, wardrobe }) => {
    const offset = profile === 'warm' ? 3 : profile === 'cold' ? -3 : 0
    update({ offset, thermalProfile: profile, wardrobe, onboardingDone: true })
  }, [update])

  const setWardrobe = useCallback((wardrobe) => update({ wardrobe }), [update])

  const addCustomExtra = useCallback((item) => {
    update(prev => ({
      ...prev,
      customExtras: [...(prev.customExtras || []), item],
    }))
  }, [update])

  const removeCustomExtra = useCallback((id) => {
    update(prev => ({
      ...prev,
      customExtras: (prev.customExtras || []).filter(e => e.id !== id),
    }))
  }, [update])

  const recordFeedback = useCallback((bucket, feelsLike, feedback) => {
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

  const logDailyMood = useCallback((entry) => {
    update(prev => ({
      ...prev,
      dailyMoodLog: [
        { ...entry, date: new Date().toISOString().slice(0, 10) },
        ...(prev.dailyMoodLog || []).slice(0, 60),
      ],
    }))
  }, [update])

  const acknowledgeColdDrop = useCallback(() => {
    update({ acknowledgedDrop: new Date().toISOString().slice(0, 10) })
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
    completeOnboarding,
    setWardrobe,
    addCustomExtra,
    removeCustomExtra,
    recordFeedback,
    logDailyMood,
    acknowledgeColdDrop,
    clearPendingToast,
    resetPreferences,
    resetOnboarding,
    update,
  }
}
