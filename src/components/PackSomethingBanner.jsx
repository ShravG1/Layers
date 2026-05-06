export function PackSomethingBanner({ alert }) {
  if (!alert) return null
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
