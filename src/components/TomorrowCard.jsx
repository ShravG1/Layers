import { useMemo } from 'react'
import { buildOutfit, outfitItems } from '../utils/outfitLogic.js'

function getTomorrowMorning(hourly) {
  if (!hourly?.time) return null
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const prefix = tomorrow.toISOString().slice(0, 10)
  const morningHours = [7, 8, 9]
  for (const h of morningHours) {
    const target = `${prefix}T${String(h).padStart(2,'0')}:`
    const idx = hourly.time.findIndex(t => t.startsWith(target))
    if (idx >= 0) {
      return {
        feelsLike: hourly.apparent_temperature?.[idx],
        rain: hourly.precipitation_probability?.[idx] ?? 0,
        wind: hourly.windspeed_10m?.[idx] ?? 0,
        hour: h,
      }
    }
  }
  return null
}

export function TomorrowCard({ hourly, preferences }) {
  const data = useMemo(() => {
    const morning = getTomorrowMorning(hourly)
    if (!morning?.feelsLike) return null
    const { outfit } = buildOutfit({
      feelsLike: morning.feelsLike,
      preferences,
      windMph: morning.wind * 0.621371,
      rainProb: morning.rain,
      isMorningOrEvening: true,
    })
    const items = outfitItems(outfit).filter(i => i.tier === 'main').slice(0, 3)
    return { feelsLike: Math.round(morning.feelsLike), rain: morning.rain, items }
  }, [hourly, preferences])

  if (!data) return null

  return (
    <div className="mx-4 mt-3 rounded-2xl glass-card px-4 py-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Tomorrow morning</p>
        <p className="text-white text-sm font-semibold">{data.feelsLike}°C</p>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {data.items.map(item => (
          <span key={item.id} className="inline-flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-full px-2.5 py-1 text-zinc-300 text-xs">
            {item.emoji} {item.name}
          </span>
        ))}
        {data.rain > 40 && (
          <span className="inline-flex items-center gap-1 bg-blue-950/60 border border-blue-800/40 rounded-full px-2.5 py-1 text-blue-300 text-xs">
            ☂️ Rain likely
          </span>
        )}
      </div>
    </div>
  )
}
