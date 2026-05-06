// WMO weather code → human label + condition category
export function wmoLabel(code) {
  if (code === 0) return { label: 'Clear sky', condition: 'clear' }
  if (code <= 3) return { label: code === 1 ? 'Mainly clear' : code === 2 ? 'Partly cloudy' : 'Overcast', condition: 'cloudy' }
  if (code <= 48) return { label: 'Foggy', condition: 'cloudy' }
  if (code <= 55) return { label: 'Drizzle', condition: 'rain' }
  if (code <= 65) return { label: 'Rain', condition: 'rain' }
  if (code <= 75) return { label: 'Snow', condition: 'snow' }
  if (code <= 82) return { label: 'Rain showers', condition: 'rain' }
  if (code === 95) return { label: 'Thunderstorm', condition: 'rain' }
  return { label: 'Unknown', condition: 'cloudy' }
}

// Convert km/h → mph
export function kmhToMph(kmh) {
  return Math.round(kmh / 1.609)
}

// Map weathercode to emoji
export function conditionEmoji(code) {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌦️'
  if (code <= 65) return '🌧️'
  if (code <= 75) return '❄️'
  if (code <= 82) return '🌧️'
  if (code === 95) return '⛈️'
  return '🌡️'
}

// Check if code indicates clear/sunny (for UV alert)
export function isSunny(code) {
  return code >= 0 && code <= 2
}
