export function PackSomethingBanner({ alert }) {
  if (!alert) return null
  const urgent = alert.maxRainProb > 60

  if (urgent) {
    return (
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden animate-fade-in">
        <div className="bg-blue-500/20 border border-blue-400/50 rounded-2xl p-4">
          <div className="flex gap-3 items-start">
            <span className="text-xl flex-shrink-0">🌧️</span>
            <div>
              <p className="text-blue-300 font-semibold text-sm">Heavy rain tonight</p>
              <p className="text-blue-200/90 text-sm mt-0.5">{alert.message}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="h-1.5 flex-1 bg-blue-900/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${Math.min(alert.maxRainProb, 100)}%` }}
              />
            </div>
            <span className="text-blue-400 text-[10px] font-medium">{alert.maxRainProb}%</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 p-4 animate-fade-in">
      <div className="flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">🎒</span>
        <div>
          <p className="text-amber-300 font-medium text-sm">Pack Something</p>
          <p className="text-amber-200/80 text-sm mt-0.5">{alert.message}</p>
        </div>
      </div>
    </div>
  )
}
