import { useState } from 'react'
import { WeatherIcon } from './WeatherIcon.jsx'
import { wmoLabel, kmhToMph, displayTempNum, tempSymbol } from '../utils/weatherHelpers.js'
import { DayBreakdown } from './DayBreakdown.jsx'

function TempArc({ min, max, current, unit = '°C' }) {
  if (min == null || max == null || min === max) return null
  const conv = c => unit === '°F' ? Math.round(c * 9/5 + 32) : Math.round(c)
  const pct = Math.max(0, Math.min(1, (current - min) / (max - min)))
  const R = 44, cx = 54, cy = 54
  const toXY = (a) => [cx + R * Math.cos(a), cy + R * Math.sin(a)]
  const [sx, sy] = toXY(Math.PI)
  const [ex, ey] = toXY(0)
  const angle = Math.PI + pct * Math.PI
  const [dx, dy] = toXY(angle)
  return (
    <svg width="108" height="60" viewBox="0 0 108 60">
      <path d={`M ${sx} ${sy} A ${R} ${R} 0 0 1 ${ex} ${ey}`}
        fill="none" stroke="#27272a" strokeWidth="4" strokeLinecap="round"/>
      <path d={`M ${sx} ${sy} A ${R} ${R} 0 0 1 ${dx} ${dy}`}
        fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round"/>
      <circle cx={dx} cy={dy} r="4.5" fill="#a5b4fc"/>
      <text x="2"   y="58" fontSize="9" fill="#52525b">{conv(min)}°</text>
      <text x="88"  y="58" fontSize="9" fill="#52525b">{conv(max)}°</text>
    </svg>
  )
}

export function WeatherDisplay({ weather, location, hourly, unit = '°C', onLocationTap }) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  if (!weather) return null

  const feelsLikeC = weather.apparent_temperature ?? weather.temperature_2m ?? 0
  const tempC      = weather.temperature_2m ?? feelsLikeC
  const feelsLike  = displayTempNum(feelsLikeC, unit)
  const temp       = displayTempNum(tempC, unit)
  const sym        = tempSymbol(unit)
  const windMph   = Math.round(kmhToMph(weather.windspeed_10m ?? 0))
  const rainProb  = Math.round(weather.precipitation_probability ?? 0)
  const code      = weather.weathercode ?? 0
  const { label, condition } = wmoLabel(code)
  const gap = tempC - feelsLikeC   // always in °C for logic

  let todayMin = null, todayMax = null
  if (hourly?.apparent_temperature && hourly?.time) {
    const today = new Date().toISOString().slice(0, 10)
    const vals = hourly.time
      .map((t, i) => t.startsWith(today) ? hourly.apparent_temperature[i] : null)
      .filter(v => v != null)
    if (vals.length) { todayMin = Math.min(...vals); todayMax = Math.max(...vals) }
  }

  return (
    <>
      <div className="animate-fade-in mx-4 mt-3 rounded-2xl glass-card p-5">
        {location?.name && (
          <button
            onClick={onLocationTap}
            className="text-zinc-500 text-xs mb-3 flex items-center gap-1 active:opacity-70 transition-opacity"
          >
            <span>📍</span><span>{location.name}</span><span className="text-zinc-700 text-[10px]">▾</span>
          </button>
        )}

        <div className="flex items-start justify-between">
          {/* Left: temp + label */}
          <button
            onClick={() => setShowBreakdown(true)}
            className="text-left active:opacity-70 transition-opacity"
          >
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-0.5">
              Feels like
            </p>
            <div className="text-[80px] font-black text-white leading-none tracking-tighter">
              {feelsLike}{sym}
            </div>
            <div className="text-zinc-400 text-sm mt-1.5">{label}</div>
            {Math.abs(gap) > 1 && (
              <div className="text-xs mt-1 text-zinc-600">
                Actually {temp}{sym} · {displayTempNum(Math.abs(gap), unit)}{sym} {gap > 0 ? 'colder' : 'warmer'} due to {windMph > 10 ? 'wind' : 'humidity'}
              </div>
            )}
            <p className="text-indigo-500 text-[10px] mt-2">Tap for day breakdown →</p>
          </button>

          {/* Right: icon + arc */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <WeatherIcon condition={condition} size={52}/>
            <TempArc min={todayMin} max={todayMax} current={feelsLikeC} unit={unit}/>
          </div>
        </div>

        <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800/40 text-xs text-zinc-500 flex-wrap">
          <span>💨 {windMph} mph</span>
          <span>🌧️ {rainProb}%</span>
          {weather.relative_humidity_2m != null && <span>💧 {Math.round(weather.relative_humidity_2m)}%</span>}
          {weather.uv_index > 0 && <span>☀️ UV {Math.round(weather.uv_index)}</span>}
        </div>
      </div>

      {showBreakdown && (
        <DayBreakdown
          hourly={hourly}
          weather={weather}
          unit={unit}
          onClose={() => setShowBreakdown(false)}
        />
      )}
    </>
  )
}
