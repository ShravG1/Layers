import { conditionEmoji } from '../utils/weatherHelpers.js'
import { displayTempNum } from '../utils/weatherHelpers.js'

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export function WeeklyForecast({ daily, unit = '°C' }) {
  if (!daily?.time?.length) return null

  const today = new Date().toISOString().slice(0, 10)
  const days = daily.time.map((t, i) => ({
    date: t,
    isToday: t === today,
    label: t === today ? 'Today' : DAY_NAMES[new Date(t + 'T12:00:00').getDay()],
    code: daily.weathercode?.[i] ?? daily.weather_code?.[i] ?? 0,
    high: daily.apparent_temperature_max?.[i] ?? daily.temperature_2m_max?.[i],
    low:  daily.apparent_temperature_min?.[i] ?? daily.temperature_2m_min?.[i],
    rain: daily.precipitation_probability_max?.[i] ?? 0,
  }))

  // Range across the week for the bar visualisation
  const allHighs = days.map(d => d.high).filter(v => v != null)
  const allLows  = days.map(d => d.low).filter(v => v != null)
  const weekMin  = Math.min(...allLows)
  const weekMax  = Math.max(...allHighs)
  const range    = weekMax - weekMin || 1

  return (
    <div className="mx-4 mt-3 rounded-2xl glass-card p-4 animate-fade-in">
      <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-3">Next 7 days</p>
      <div className="flex flex-col gap-2">
        {days.map(d => {
          const lowPct  = ((d.low - weekMin) / range) * 100
          const highPct = ((d.high - weekMin) / range) * 100
          const widthPct = highPct - lowPct
          return (
            <div key={d.date} className="flex items-center gap-2 text-xs">
              <span className={`w-10 ${d.isToday ? 'text-indigo-400 font-semibold' : 'text-zinc-400'}`}>
                {d.label}
              </span>
              <span className="w-5 text-center">{conditionEmoji(d.code)}</span>
              <span className="w-6 text-right text-zinc-500">{displayTempNum(d.low, unit)}°</span>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full relative overflow-hidden">
                <div
                  className={`absolute h-full rounded-full ${d.isToday ? 'bg-indigo-400' : 'bg-zinc-500'}`}
                  style={{ left: `${lowPct}%`, width: `${Math.max(widthPct, 4)}%` }}
                />
              </div>
              <span className="w-6 text-right text-zinc-300">{displayTempNum(d.high, unit)}°</span>
              {d.rain >= 30 && (
                <span className="w-8 text-right text-blue-400 text-[10px]">{d.rain}%</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
