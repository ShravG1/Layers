import { useState, useRef } from 'react'
import { WeatherDisplay } from './WeatherDisplay.jsx'
import { WeatherIcon } from './WeatherIcon.jsx'
import { wmoLabel, kmhToMph, displayTempNum, tempSymbol } from '../utils/weatherHelpers.js'
import { DayBreakdown } from './DayBreakdown.jsx'

function getTomorrowData(hourly, daily) {
  if (!hourly?.time) return null
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const prefix = tomorrow.toISOString().slice(0, 10)

  let dailyIdx = -1
  if (daily?.time) dailyIdx = daily.time.findIndex(t => t === prefix)

  const midday = [12, 13, 11, 14, 10].reduce((found, h) => {
    if (found) return found
    const target = `${prefix}T${String(h).padStart(2, '0')}:`
    const idx = hourly.time.findIndex(t => t.startsWith(target))
    return idx >= 0 ? { idx } : null
  }, null)

  if (!midday && dailyIdx < 0) return null

  const hi     = dailyIdx >= 0 ? daily.apparent_temperature_max?.[dailyIdx] : null
  const lo     = dailyIdx >= 0 ? daily.apparent_temperature_min?.[dailyIdx] : null
  const code   = dailyIdx >= 0 ? (daily.weathercode ?? daily.weather_code)?.[dailyIdx] : null
  const rainMax= dailyIdx >= 0 ? daily.precipitation_probability_max?.[dailyIdx] : null
  const middayFeels = midday ? hourly.apparent_temperature?.[midday.idx] : null
  const middayWind  = midday ? hourly.windspeed_10m?.[midday.idx] : null
  const middayRain  = midday ? hourly.precipitation_probability?.[midday.idx] : null

  return {
    feelsLike: middayFeels ?? hi,
    hi, lo,
    code: code ?? (midday ? hourly.weathercode?.[midday.idx] : null),
    rain: rainMax ?? middayRain ?? 0,
    wind: middayWind ?? 0,
    date: prefix,
  }
}

function TomorrowCard({ hourly, daily, unit, onTap }) {
  const data = getTomorrowData(hourly, daily)
  if (!data) return (
    <div className="mx-4 mt-3 rounded-2xl glass-card p-5 flex items-center justify-center h-40">
      <p className="text-zinc-600 text-sm">Tomorrow's data not available</p>
    </div>
  )

  const sym      = tempSymbol(unit)
  const { label, condition } = wmoLabel(data.code ?? 0)
  const windMph  = Math.round(kmhToMph(data.wind))
  const feelsLike= displayTempNum(data.feelsLike, unit)
  const hi       = displayTempNum(data.hi, unit)
  const lo       = displayTempNum(data.lo, unit)

  return (
    <div className="animate-fade-in mx-4 mt-3 rounded-2xl glass-card p-5">
      <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-3">Tomorrow</p>
      <div className="flex items-start justify-between">
        <button onClick={onTap} className="text-left active:opacity-70 transition-opacity">
          <div className="text-[80px] font-black text-white leading-none tracking-tighter">
            {feelsLike}{sym}
          </div>
          <div className="text-zinc-400 text-sm mt-1.5">{label}</div>
          {hi != null && lo != null && (
            <div className="text-zinc-600 text-xs mt-1">{lo}{sym} – {hi}{sym}</div>
          )}
          <p className="text-indigo-500 text-[10px] mt-2">Tap for tomorrow's breakdown →</p>
        </button>
        <div className="flex flex-col items-center gap-2 pt-1">
          <WeatherIcon condition={condition} size={52} />
          {data.rain > 20 && (
            <span className="text-xs text-blue-400 bg-blue-900/30 border border-blue-800/40 rounded-full px-2 py-0.5">
              ☂️ {Math.round(data.rain)}%
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800/40 text-xs text-zinc-500">
        <span>💨 {windMph} mph</span>
        <span>🌧️ {Math.round(data.rain)}%</span>
      </div>
    </div>
  )
}

export function SwipeableWeatherCards({ weather, location, hourly, daily, unit, onLocationTap }) {
  const [page, setPage] = useState(0)
  const [showTomorrowBreakdown, setShowTomorrowBreakdown] = useState(false)
  const startX = useRef(null)
  const THRESHOLD = 50

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX }

  const onTouchEnd = (e) => {
    if (startX.current == null) return
    const dx = e.changedTouches[0].clientX - startX.current
    startX.current = null
    if (dx < -THRESHOLD && page === 0) setPage(1)
    else if (dx > THRESHOLD && page === 1) setPage(0)
  }

  const tomorrowDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10)
  })()

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Pages: only the active one is in flow; the other is hidden with display:none */}
      <div style={{ display: page === 0 ? 'block' : 'none' }}>
        <WeatherDisplay
          weather={weather}
          location={location}
          hourly={hourly}
          unit={unit}
          onLocationTap={onLocationTap}
        />
      </div>
      <div style={{ display: page === 1 ? 'block' : 'none' }}>
        <TomorrowCard
          hourly={hourly}
          daily={daily}
          unit={unit}
          onTap={() => setShowTomorrowBreakdown(true)}
        />
      </div>

      {/* Page dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {[0, 1].map(i => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`rounded-full transition-all ${
              page === i ? 'w-4 h-1.5 bg-indigo-400' : 'w-1.5 h-1.5 bg-zinc-700'
            }`}
          />
        ))}
      </div>

      {showTomorrowBreakdown && (
        <DayBreakdown
          hourly={hourly}
          weather={weather}
          unit={unit}
          date={tomorrowDate}
          onClose={() => setShowTomorrowBreakdown(false)}
        />
      )}
    </div>
  )
}
