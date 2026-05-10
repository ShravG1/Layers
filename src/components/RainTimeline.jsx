export function RainTimeline({ hourly }) {
  if (!hourly?.time || !hourly?.precipitation_probability) return null

  const today = new Date().toISOString().slice(0, 10)
  const nowHour = new Date().getHours()

  const points = hourly.time
    .map((t, i) => {
      if (!t.startsWith(today)) return null
      const h = parseInt(t.slice(11, 13), 10)
      return { hour: h, rain: hourly.precipitation_probability[i] ?? 0 }
    })
    .filter(Boolean)

  if (!points.length) return null

  const maxRain = Math.max(...points.map(p => p.rain))
  if (maxRain < 20) return null // hide if no meaningful rain today

  const W = 280, H = 40
  const stepX = W / Math.max(points.length - 1, 1)

  // Build smooth area path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${H - (p.rain / 100) * H}`).join(' ')
  const areaPath = `${linePath} L ${(points.length - 1) * stepX} ${H} L 0 ${H} Z`

  const peak = points.reduce((best, p) => p.rain > best.rain ? p : best, points[0])
  const peakLabel = peak.hour === 0 ? '12a' : peak.hour < 12 ? `${peak.hour}am` : peak.hour === 12 ? '12pm' : `${peak.hour - 12}pm`

  return (
    <div className="mx-4 mt-3 rounded-2xl glass-card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <p className="text-zinc-500 text-[10px] uppercase tracking-wide">Rain today</p>
        <p className="text-blue-400 text-[10px]">Peak {peak.rain}% at {peakLabel}</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
        <defs>
          <linearGradient id="rain-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#60a5fa" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#rain-fill)"/>
        <path d={linePath} fill="none" stroke="#60a5fa" strokeWidth="1.5"/>
        {points.map((p, i) => p.hour === nowHour && (
          <circle key={i} cx={i * stepX} cy={H - (p.rain / 100) * H} r="3" fill="#a5b4fc"/>
        ))}
      </svg>
      <div className="flex justify-between text-[9px] text-zinc-700 mt-1">
        <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>12a</span>
      </div>
    </div>
  )
}
