import { kmhToMph, displayTempNum, tempSymbol } from '../utils/weatherHelpers.js'

function HourlyBar({ hour, feelsLike, actual, rain, isCurrent, min, max }) {
  const range = max - min || 1
  const pct = Math.round(((feelsLike - min) / range) * 100)
  const label = hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`

  return (
    <div className={`flex flex-col items-center gap-1 flex-1 ${isCurrent ? 'opacity-100' : 'opacity-60'}`}>
      <span className="text-[9px] text-zinc-500">{Math.round(feelsLike)}°</span>
      <div className="w-full flex flex-col justify-end" style={{ height: 48 }}>
        <div
          className={`w-full rounded-t-sm transition-all ${isCurrent ? 'bg-indigo-400' : 'bg-zinc-700'}`}
          style={{ height: `${Math.max(8, pct)}%` }}
        />
      </div>
      <span className={`text-[9px] ${isCurrent ? 'text-indigo-400 font-bold' : 'text-zinc-600'}`}>{label}</span>
    </div>
  )
}

export function DayBreakdown({ hourly, weather, unit = '°C', onClose }) {
  if (!hourly?.time) return null

  const today = new Date().toISOString().slice(0, 10)
  const nowHour = new Date().getHours()

  const hours = hourly.time
    .map((t, i) => {
      if (!t.startsWith(today)) return null
      const h = parseInt(t.slice(11, 13), 10)
      return {
        hour: h,
        feelsLike: hourly.apparent_temperature?.[i] ?? null,
        actual: hourly.temperature_2m?.[i] ?? null,
        rain: hourly.precipitation_probability?.[i] ?? 0,
        wind: hourly.windspeed_10m?.[i] ?? 0,
      }
    })
    .filter(Boolean)
    .filter(h => h.feelsLike != null)

  if (!hours.length) return null

  const feelsMin = Math.min(...hours.map(h => h.feelsLike))
  const feelsMax = Math.max(...hours.map(h => h.feelsLike))

  const sym       = tempSymbol(unit)
  const feelsLike = displayTempNum(weather.apparent_temperature ?? weather.temperature_2m ?? 0, unit)
  const actual    = displayTempNum(weather.temperature_2m ?? weather.apparent_temperature ?? 0, unit)
  const windMph   = Math.round(kmhToMph(weather.windspeed_10m ?? 0))
  const rain      = Math.round(weather.precipitation_probability ?? 0)
  const uv        = weather.uv_index ?? 0
  const gap       = actual - feelsLike

  // Factor explanations
  const factors = []
  if (windMph > 15) factors.push({ icon: '💨', label: 'Strong wind', detail: `${windMph} mph wind chill making it feel colder` })
  if (windMph > 5 && windMph <= 15) factors.push({ icon: '💨', label: 'Light breeze', detail: `${windMph} mph — small chill effect` })
  if (rain > 60) factors.push({ icon: '🌧️', label: 'High rain chance', detail: `${rain}% — feels damper and colder` })
  else if (rain > 30) factors.push({ icon: '🌦️', label: 'Some rain likely', detail: `${rain}% chance` })
  if (uv >= 6) factors.push({ icon: '☀️', label: 'High UV', detail: `UV ${Math.round(uv)} — sunny but check the shade temp` })
  if (gap > 3) factors.push({ icon: '🥶', label: 'Wind chill', detail: `Real temp ${actual}° but body exposure feels ${Math.abs(gap)}° colder` })
  if (gap < -2) factors.push({ icon: '🌡️', label: 'Feels warmer', detail: `High humidity makes ${actual}° feel ${Math.abs(gap)}° warmer` })
  if (!factors.length) factors.push({ icon: '✅', label: 'Conditions calm', detail: 'Feels-like is close to the actual temperature' })

  // Filter to show every 2 hours to avoid crowding
  const displayed = hours.filter(h => h.hour % 2 === 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111116] rounded-t-3xl border-t border-zinc-800 pb-[max(env(safe-area-inset-bottom),1.5rem)] animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-4 mb-4"/>

        <div className="px-5">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-white font-bold text-lg">Today's breakdown</h3>
            <button onClick={onClose} className="text-zinc-500 text-2xl leading-none">×</button>
          </div>
          <p className="text-zinc-500 text-xs mb-5">Tap the temp on the home screen to update.</p>

          {/* Big feels-like vs actual */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
              <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-0.5">Feels like</p>
              <p className="text-white text-3xl font-black">{feelsLike}{sym}</p>
              <p className="text-indigo-400 text-[10px] mt-0.5">What to dress for</p>
            </div>
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
              <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-0.5">Actual temp</p>
              <p className="text-zinc-300 text-3xl font-black">{actual}{sym}</p>
              <p className="text-zinc-600 text-[10px] mt-0.5">Air temperature</p>
            </div>
          </div>

          {/* Hourly feels-like chart */}
          <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-2">Feels-like today</p>
          <div className="flex gap-0.5 items-end mb-1">
            {displayed.map(h => (
              <HourlyBar
                key={h.hour}
                hour={h.hour}
                feelsLike={h.feelsLike}
                actual={h.actual}
                rain={h.rain}
                isCurrent={h.hour === nowHour || (nowHour % 2 !== 0 && h.hour === nowHour - 1)}
                min={feelsMin}
                max={feelsMax}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-zinc-700 mb-5">
            <span>Low {Math.round(feelsMin)}°</span>
            <span>High {Math.round(feelsMax)}°</span>
          </div>

          {/* Factors */}
          <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-2">Why it feels this way</p>
          <div className="flex flex-col gap-2 pb-2">
            {factors.map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5">
                <span className="text-lg">{f.icon}</span>
                <div>
                  <p className="text-white text-xs font-medium">{f.label}</p>
                  <p className="text-zinc-500 text-[11px]">{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
