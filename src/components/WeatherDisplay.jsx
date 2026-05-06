import { WeatherIcon } from './WeatherIcon.jsx'
import { wmoLabel, kmhToMph, conditionEmoji } from '../utils/weatherHelpers.js'

export function WeatherDisplay({ weather, location }) {
  if (!weather) return null

  const feelsLike = Math.round(weather.apparent_temperature ?? weather.temperature_2m ?? 0)
  const temp      = Math.round(weather.temperature_2m ?? feelsLike)
  const windMph   = kmhToMph(weather.windspeed_10m ?? 0)
  const rainProb  = Math.round(weather.precipitation_probability ?? 0)
  const code      = weather.weathercode ?? 0
  const { label, condition } = wmoLabel(code)

  return (
    <div className="animate-fade-in px-4 pt-4 pb-2">
      {location?.name && (
        <p className="text-center text-sm text-zinc-400 mb-2">📍 {location.name}</p>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="text-6xl font-bold text-white leading-none">{temp}°</div>
          <div className="text-zinc-400 text-sm mt-1">Feels like <span className="text-white font-medium">{feelsLike}°C</span></div>
          <div className="text-zinc-300 text-sm mt-0.5">{label}</div>
        </div>
        <WeatherIcon condition={condition} size={56} />
      </div>

      <div className="flex gap-4 mt-3 text-sm text-zinc-400">
        <span>💨 {windMph} mph</span>
        <span>🌧️ {rainProb}% rain</span>
      </div>
    </div>
  )
}
