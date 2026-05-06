import { getCurrentUV } from '../utils/forecastHelpers.js'
import { isSunny } from '../utils/weatherHelpers.js'

export function UVAlert({ weather, hourly, settings }) {
  if (settings?.uvAlertsEnabled === false) return null
  if (!weather || !hourly) return null

  const feelsLike = weather.apparent_temperature ?? weather.temperature_2m ?? 0
  const code      = weather.weathercode ?? 99
  const uv        = getCurrentUV(hourly)

  if (feelsLike < 20) return null
  if (!isSunny(code)) return null
  if (!uv || uv < 6)  return null

  return (
    <div className="mx-4 mt-3 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 p-4 animate-fade-in">
      <div className="flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">☀️</span>
        <div>
          <p className="text-yellow-300 font-medium text-sm">Strong Sun Today</p>
          <p className="text-yellow-200/80 text-sm mt-0.5">
            UV index {Math.round(uv)} — cap or sunscreen worth considering ☀️
          </p>
        </div>
      </div>
    </div>
  )
}
