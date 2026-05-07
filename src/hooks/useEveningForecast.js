import { useMemo } from 'react'
import { getEveningForecast } from '../utils/forecastHelpers.js'

export function useEveningForecast({ hourly, currentFeelsLike, settings }) {
  return useMemo(() => {
    const hour = new Date().getHours()
    const eveningStartHour = settings?.eveningCheckHour ?? 19
    const tempDropThreshold = settings?.eveningTempDrop ?? 4

    // Only warn if currently before 6pm
    if (hour >= 18) return null
    if (!hourly || currentFeelsLike == null) return null

    const evening = getEveningForecast(hourly)
    if (!evening) return null

    const tempDrop    = currentFeelsLike - evening.avgFeelsLike
    const rainWarning = evening.maxRainProb > 40
    const coldWarning = tempDrop >= tempDropThreshold

    if (!coldWarning && !rainWarning) return null

    let message = ''
    const roundedEvening = Math.round(evening.avgFeelsLike)

    if (coldWarning && rainWarning) {
      message = `Drops to ${roundedEvening}°C tonight and rain expected — pack a jacket and umbrella`
    } else if (coldWarning) {
      const drop = Math.round(tempDrop)
      if (drop >= 8) message = `Gets cold after dark (${roundedEvening}°C) — pack a coat`
      else message = `Drops to ${roundedEvening}°C tonight — pack a jacket if you're heading out later`
    } else {
      message = `Rain expected this evening — throw an umbrella in your bag`
    }

    return { message, coldWarning, rainWarning, maxRainProb: evening.maxRainProb, eveningFeelsLike: evening.avgFeelsLike }
  }, [hourly, currentFeelsLike, settings])
}
