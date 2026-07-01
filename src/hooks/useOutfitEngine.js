import { useMemo } from 'react'
import { buildOutfit, outfitItems } from '../utils/outfitLogic.js'
import { kmhToMph } from '../utils/weatherHelpers.js'

export function useOutfitEngine({ weather, preferences }) {
  return useMemo(() => {
    if (!weather) return null

    const feelsLike = weather.apparent_temperature ?? weather.temperature_2m ?? 15
    const windMph   = kmhToMph(weather.windspeed_10m ?? 0)
    const rainProb  = weather.precipitation_probability ?? 0
    const hour      = new Date().getHours()
    const isMorningOrEvening = hour < 9 || hour >= 20

    const { bucket, outfit } = buildOutfit({
      feelsLike,
      preferences,
      windMph,
      rainProb,
      isMorningOrEvening,
    })

    return {
      bucket,
      outfit,
      items: outfitItems(outfit),
      feelsLike,
      windMph,
      rainProb,
      isMorningOrEvening,
      hour,
    }
  }, [weather, preferences])
}
