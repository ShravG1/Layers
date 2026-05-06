// Pure CSS animated weather icons — no external libraries

export function WeatherIcon({ condition, size = 64 }) {
  if (condition === 'clear') return <SunIcon size={size} />
  if (condition === 'rain')  return <RainIcon size={size} />
  if (condition === 'snow')  return <SnowIcon size={size} />
  return <CloudIcon size={size} />
}

function SunIcon({ size }) {
  return (
    <div className="animate-pulse-sun flex items-center justify-center" style={{ fontSize: size }}>
      ☀️
    </div>
  )
}

function CloudIcon({ size }) {
  return (
    <div className="animate-drift-cloud flex items-center justify-center" style={{ fontSize: size }}>
      ⛅
    </div>
  )
}

function RainIcon({ size }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="animate-drift-cloud" style={{ fontSize: size * 0.75 }}>🌧️</div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="rain-drop animate-fall-rain"
            style={{ height: size * 0.25, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function SnowIcon({ size }) {
  return (
    <div className="animate-drift-cloud flex items-center justify-center" style={{ fontSize: size }}>
      🌨️
    </div>
  )
}
