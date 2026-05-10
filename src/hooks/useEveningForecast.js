import { useMemo } from 'react'
import { getEveningForecast, getIntradayAdvisory } from '../utils/forecastHelpers.js'

export function useEveningForecast({ hourly, currentFeelsLike, settings }) {
  return useMemo(() => {
    const hour = new Date().getHours()
    const tempDropThreshold = settings?.eveningTempDrop ?? 4

    if (!hourly || currentFeelsLike == null) return null

    // Check intra-day (upcoming hours today, 2–10 hrs out)
    const intraday = getIntradayAdvisory(hourly, currentFeelsLike, tempDropThreshold)

    // Classic evening check (before 6pm only)
    let evening = null
    if (hour < 18) {
      const ev = getEveningForecast(hourly)
      if (ev) {
        const tempDrop    = currentFeelsLike - ev.avgFeelsLike
        const rainWarning = ev.maxRainProb > 40
        const coldWarning = tempDrop >= tempDropThreshold

        if (coldWarning || rainWarning) {
          const roundedEvening = Math.round(ev.avgFeelsLike)
          let message
          if (coldWarning && rainWarning) {
            message = `Drops to ${roundedEvening}° tonight and rain expected — pack a jacket and umbrella`
          } else if (coldWarning) {
            const drop = Math.round(tempDrop)
            message = drop >= 8
              ? `Gets cold after dark (${roundedEvening}°) — pack a coat`
              : `Drops to ${roundedEvening}° tonight — pack a jacket if heading out later`
          } else {
            message = `Rain expected this evening — throw an umbrella in your bag`
          }
          evening = { message, maxRainProb: ev.maxRainProb, coldWarning, rainWarning }
        }
      }
    }

    // Return whichever is more severe (intraday takes priority as it's more imminent)
    if (intraday && evening) {
      // If intra-day drop is bigger, use that; otherwise evening
      return intraday.worstDrop >= (evening.coldWarning ? tempDropThreshold : 0)
        ? { ...intraday, coldWarning: intraday.hasDrop, rainWarning: intraday.hasRain }
        : { ...evening }
    }
    if (intraday) return { ...intraday, coldWarning: intraday.hasDrop, rainWarning: intraday.hasRain }
    return evening
  }, [hourly, currentFeelsLike, settings])
}
