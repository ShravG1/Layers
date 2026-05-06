import { ITEM_EMOJI, BUCKET_LABELS } from '../utils/outfitLogic.js'
import { ITEM_BY_ID } from '../utils/wardrobe.js'

function renderWorn(id) {
  const item = ITEM_BY_ID[id]
  if (item) return { emoji: item.emoji, label: item.label }
  return { emoji: '👕', label: id }
}

const LS_KEY = 'wtw_history'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) ?? []
  } catch { return [] }
}

export function saveHistoryEntry(entry) {
  const history = loadHistory()
  history.unshift({ ...entry, id: Date.now() })
  // Keep last 50 entries
  localStorage.setItem(LS_KEY, JSON.stringify(history.slice(0, 50)))
}

function groupByDate(entries) {
  const groups = {}
  for (const e of entries) {
    const day = new Date(e.timestamp).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
    if (!groups[day]) groups[day] = []
    groups[day].push(e)
  }
  return Object.entries(groups)
}

const FEEDBACK_LABEL = { warm: '🔥 Too warm', ok: '👌 Just right', cold: '🥶 Too cold' }

export function HistoryPage() {
  const history = loadHistory()
  const groups  = groupByDate(history)

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 px-8 text-center gap-3 pt-20">
        <span className="text-4xl">📋</span>
        <p className="text-sm">No outfit history yet. Come back after your first recommendation!</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full pb-24 px-4 pt-4">
      <h2 className="text-white font-semibold text-lg mb-4">Your History</h2>
      {groups.map(([day, entries]) => (
        <div key={day} className="mb-5">
          <p className="text-zinc-500 text-xs uppercase tracking-wide mb-2">{day}</p>
          <div className="flex flex-col gap-2">
            {entries.map(e => (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white text-sm font-medium">Felt like {Math.round(e.feelsLike)}°C</p>
                    <p className="text-zinc-500 text-xs">{BUCKET_LABELS[e.bucket] ?? e.bucket}</p>
                  </div>
                  {e.feedback && (
                    <span className="text-xs text-zinc-400">{FEEDBACK_LABEL[e.feedback]}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {e.recommendedItems?.map((item, i) => (
                    <span key={i} className="bg-zinc-800 text-zinc-300 text-xs rounded-lg px-2 py-1">
                      {ITEM_EMOJI[item] ?? '👕'} {item}
                    </span>
                  ))}
                </div>

                {e.wornItems?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-800">
                    <p className="text-zinc-500 text-xs mb-1">Actually wore:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {e.wornItems.map((item, i) => {
                        const r = renderWorn(item)
                        return (
                          <span key={i} className="bg-indigo-900/40 text-indigo-300 text-xs rounded-lg px-2 py-1">
                            {r.emoji} {r.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
