// Evening and morning peak detection from Open-Meteo hourly arrays

// Evening hours: index 19–23 (7pm–11pm local)
// Morning/daytime peak: index 8–20 (8am–8pm)

export function getEveningForecast(hourly) {
  if (!hourly?.time) return null
  const now = new Date()
  const todayPrefix = now.toISOString().slice(0, 10) // "YYYY-MM-DD"

  const eveningIndices = hourly.time
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => {
      if (!t.startsWith(todayPrefix)) return false
      const hour = parseInt(t.slice(11, 13), 10)
      return hour >= 19 && hour <= 23
    })
    .map(({ i }) => i)

  if (eveningIndices.length === 0) return null

  const feelsLike = eveningIndices.map(i => hourly.apparent_temperature[i]).filter(v => v != null)
  const rainProbs  = eveningIndices.map(i => hourly.precipitation_probability[i]).filter(v => v != null)

  return {
    avgFeelsLike: feelsLike.reduce((a, b) => a + b, 0) / feelsLike.length,
    maxRainProb:  Math.max(...rainProbs, 0),
    minFeelsLike: Math.min(...feelsLike),
  }
}

export function getDaytimePeak(hourly) {
  if (!hourly?.time) return null
  const now = new Date()
  const todayPrefix = now.toISOString().slice(0, 10)

  const daytimeIndices = hourly.time
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => {
      if (!t.startsWith(todayPrefix)) return false
      const hour = parseInt(t.slice(11, 13), 10)
      return hour >= 8 && hour <= 20
    })
    .map(({ i }) => i)

  if (daytimeIndices.length === 0) return null

  const feelsLikes = daytimeIndices.map(i => hourly.apparent_temperature[i]).filter(v => v != null)
  return feelsLikes.length > 0 ? Math.max(...feelsLikes) : null
}

// Get current hour's UV index from hourly
export function getCurrentUV(hourly) {
  if (!hourly?.time || !hourly?.uv_index) return null
  const now = new Date()
  const currentHour = now.toISOString().slice(0, 13) // "YYYY-MM-DDTHH"
  const idx = hourly.time.findIndex(t => t.startsWith(currentHour))
  return idx >= 0 ? hourly.uv_index[idx] : null
}

// Get current hour's precipitation probability
export function getCurrentRainProb(hourly) {
  if (!hourly?.time || !hourly?.precipitation_probability) return null
  const now = new Date()
  const currentHour = now.toISOString().slice(0, 13)
  const idx = hourly.time.findIndex(t => t.startsWith(currentHour))
  return idx >= 0 ? hourly.precipitation_probability[idx] : null
}

// Scan upcoming hours today for any significant temp drop or rain spike from current conditions.
// Returns the worst advisory or null.
export function getIntradayAdvisory(hourly, currentFeelsLike, tempDropThreshold = 4) {
  if (!hourly?.time || currentFeelsLike == null) return null
  const now = new Date()
  const todayPrefix = now.toISOString().slice(0, 10)
  const nowHour = now.getHours()

  // Gather upcoming hours (2–10 hrs from now, still today)
  const upcoming = hourly.time
    .map((t, i) => {
      if (!t.startsWith(todayPrefix)) return null
      const h = parseInt(t.slice(11, 13), 10)
      if (h < nowHour + 2 || h > 23) return null
      return {
        hour: h,
        feelsLike: hourly.apparent_temperature?.[i],
        rain: hourly.precipitation_probability?.[i] ?? 0,
      }
    })
    .filter(Boolean)
    .filter(e => e.feelsLike != null)

  if (!upcoming.length) return null

  // Find biggest drop from current and peak rain
  let worstDrop = 0, worstDropHour = null, peakRain = 0, peakRainHour = null
  for (const e of upcoming) {
    const drop = currentFeelsLike - e.feelsLike
    if (drop > worstDrop) { worstDrop = drop; worstDropHour = e.hour }
    if (e.rain > peakRain) { peakRain = e.rain; peakRainHour = e.hour }
  }

  const fmtHour = h => h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`
  const hasRain = peakRain > 50
  const hasDrop = worstDrop >= tempDropThreshold

  if (!hasDrop && !hasRain) return null

  const dropTemp = Math.round(upcoming.find(e => e.hour === worstDropHour)?.feelsLike ?? currentFeelsLike)

  let message
  let maxRainProb = peakRain

  if (hasDrop && hasRain) {
    message = `Drops to ${dropTemp}° by ${fmtHour(worstDropHour)} and rain at ${fmtHour(peakRainHour)} — pack a jacket and umbrella`
  } else if (hasDrop) {
    message = `Drops to ${dropTemp}° by ${fmtHour(worstDropHour)} — consider packing a layer`
  } else {
    message = `Rain likely around ${fmtHour(peakRainHour)} (${peakRain}%) — umbrella recommended`
  }

  return { message, hasDrop, hasRain, maxRainProb, worstDrop }
}
