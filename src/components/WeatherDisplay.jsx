import { WeatherIcon } from './WeatherIcon.jsx'
import { wmoLabel, kmhToMph } from '../utils/weatherHelpers.js'

function TempArc({ min, max, current }) {
  if (min == null || max == null || min === max) return null
  const pct = Math.max(0, Math.min(1, (current - min) / (max - min)))
  const R = 52, cx = 64, cy = 64
  const startA = Math.PI, endA = 0
  const toXY = (a) => [cx + R * Math.cos(a), cy + R * Math.sin(a)]
  const [sx, sy] = toXY(startA)
  const [ex, ey] = toXY(endA)
  const angle = startA + pct * (endA - startA) // goes right (counter-clockwise on arc)
  const [dx, dy] = toXY(angle)
  return (
    <svg width="128" height="72" viewBox="0 0 128 72" className="mt-1">
      <path d={`M ${sx} ${sy} A ${R} ${R} 0 0 1 ${ex} ${ey}`}
        fill="none" stroke="#27272a" strokeWidth="5" strokeLinecap="round"/>
      <path d={`M ${sx} ${sy} A ${R} ${R} 0 0 1 ${dx} ${dy}`}
        fill="none" stroke="#6366f1" strokeWidth="5" strokeLinecap="round"/>
      <circle cx={dx} cy={dy} r="5" fill="#a5b4fc"/>
      <text x="4" y="70" fontSize="10" fill="#52525b">{Math.round(min)}°</text>
      <text x="106" y="70" fontSize="10" fill="#52525b">{Math.round(max)}°</text>
    </svg>
  )
}

export function WeatherDisplay({ weather, location, hourly }) {
  if (!weather) return null

  const feelsLike = Math.round(weather.apparent_temperature ?? weather.temperature_2m ?? 0)
  const temp      = Math.round(weather.temperature_2m ?? feelsLike)
  const windMph   = Math.round(kmhToMph(weather.windspeed_10m ?? 0))
  const rainProb  = Math.round(weather.precipitation_probability ?? 0)
  const code      = weather.weathercode ?? 0
  const { label, condition } = wmoLabel(code)
  const gap = temp - feelsLike

  // Today's min/max from hourly
  let todayMin = null, todayMax = null
  if (hourly?.apparent_temperature && hourly?.time) {
    const today = new Date().toISOString().slice(0, 10)
    const vals = hourly.time
      .map((t, i) => t.startsWith(today) ? hourly.apparent_temperature[i] : null)
      .filter(v => v != null)
    if (vals.length) { todayMin = Math.min(...vals); todayMax = Math.max(...vals) }
  }

  return (
    <div className="animate-fade-in mx-4 mt-3 rounded-2xl glass-card p-5">
      {location?.name && (
        <p className="text-zinc-500 text-xs mb-3 flex items-center gap-1">
          <span>📍</span><span>{location.name}</span>
        </p>
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="text-[72px] font-bold text-white leading-none tracking-tight">{feelsLike}°</div>
          <div className="text-zinc-400 text-sm mt-1">{label}</div>
          {gap !== 0 && (
            <div className="text-xs mt-1 text-zinc-600">
              Real {temp}° · feels {gap > 0 ? `${gap}° colder` : `${Math.abs(gap)}° warmer`} due to {windMph > 10 ? 'wind' : 'humidity'}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <WeatherIcon condition={condition} size={52}/>
          <TempArc min={todayMin} max={todayMax} current={feelsLike}/>
        </div>
      </div>

      <div className="flex gap-4 mt-3 text-xs text-zinc-500">
        <span>💨 {windMph} mph</span>
        <span>🌧️ {rainProb}%</span>
        {weather.uv_index > 0 && <span>☀️ UV {Math.round(weather.uv_index)}</span>}
      </div>
    </div>
  )
}
