export function MorningPeakBanner({ peak }) {
  if (!peak) return null
  return (
    <div className="mx-4 mt-3 rounded-2xl bg-sky-400/10 border border-sky-400/30 p-4 animate-fade-in">
      <div className="flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">🌅</span>
        <div>
          <p className="text-sky-300 font-medium text-sm">Dress for the Day</p>
          <p className="text-sky-200/80 text-sm mt-0.5">{peak.message}</p>
        </div>
      </div>
    </div>
  )
}
