export function SavedLocations({ saved, current, onSwitch, onSave, onRemove }) {
  const isCurrentSaved = saved?.some(l => l.name === current?.name)
  if (!saved?.length && isCurrentSaved) return null

  return (
    <div className="mx-4 mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
      {saved?.map(loc => {
        const active = loc.name === current?.name
        return (
          <button
            key={loc.name}
            onClick={() => active ? onRemove(loc.name) : onSwitch(loc)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5
              ${active ? 'bg-indigo-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            <span>📍</span>
            <span>{loc.name.split(',')[0]}</span>
            {active && <span className="text-indigo-200 text-[10px]">×</span>}
          </button>
        )
      })}
      {current?.name && !isCurrentSaved && (
        <button
          onClick={onSave}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-zinc-900 border border-dashed border-zinc-700 text-zinc-500 hover:text-white"
        >
          + Save current
        </button>
      )}
    </div>
  )
}
