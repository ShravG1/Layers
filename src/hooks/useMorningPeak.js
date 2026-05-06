import { useMemo } from 'react'
import { getDaytimePeak } from '../utils/forecastHelpers.js'

export function useMorningPeak({ hourly, currentFeelsLike, settings }) {
  return useMemo(() => {
    if (settings?.dressForDayEnabled === false) return null

    const hour = new Date().getHours()
    // Only show on morning checks (before 10am)
    if (hour >= 10) return null
    if (!hourly || currentFeelsLike == null) return null

    const peakFeelsLike = getDaytimePeak(hourly)
    if (peakFeelsLike == null) return null

    const diff = peakFeelsLike - currentFeelsLike
    if (diff < 5) return null

    return {
      currentFeelsLike: Math.round(currentFeelsLike),
      peakFeelsLike: Math.round(peakFeelsLike),
      diff: Math.round(diff),
      message: `It's ${Math.round(currentFeelsLike)}°C now but feels like ${Math.round(peakFeelsLike)}°C by this afternoon — go lighter or take a layer you can remove`,
    }
  }, [hourly, currentFeelsLike, settings])
}
