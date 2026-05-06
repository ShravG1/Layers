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
