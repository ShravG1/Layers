import { buildOutfit, outfitItems } from './outfitLogic.js'
import { kmhToMph } from './weatherHelpers.js'
import { getDaytimePeak, getEveningForecast } from './forecastHelpers.js'

// Format the one-line notification string
export function formatNotificationBody({ current, hourly, preferences, settings }) {
  const feelsLike = current.apparent_temperature ?? current.temperature_2m
  const windMph   = kmhToMph(current.windspeed_10m ?? 0)
  const rainProb  = current.precipitation_probability ?? 0
  const hour      = new Date().getHours()
  const isMorning = hour < 9

  const { outfit } = buildOutfit({ feelsLike, preferences, windMph, rainProb, isMorningOrEvening: isMorning })
  const items = outfitItems(outfit).map(i => i.name).join(', ')

  const temp    = Math.round(current.temperature_2m ?? feelsLike)
  const feels   = Math.round(feelsLike)
  let body      = `${temp}°C, feels like ${feels}°C`

  // Evening rain warning
  const evening = hourly ? getEveningForecast(hourly) : null
  const threshold = settings?.eveningTempDrop ?? 4
  if (evening) {
    const drop = feelsLike - evening.avgFeelsLike
    if (drop >= threshold) body += `, gets cold later`
    else if (evening.maxRainProb > 40) body += `, rain later`
  }

  body += ` — ${items}`
  return body
}
