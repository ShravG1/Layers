import { useState } from 'react'
import { ITEM_EMOJI, BUCKET_LABELS } from '../utils/outfitLogic.js'
import { ITEM_BY_ID } from '../utils/wardrobe.js'

const LS_KEY = 'wtw_history'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) ?? []
  } catch { return [] }
}

export function saveHistoryEntry(entry) {
  const history = loadHistory()
  history.unshift({ ...entry, id: Date.now() })
  localStorage.setItem(LS_KEY, JSON.stringify(history.slice(0, 90)))
}

function renderWorn(id) {
  const item = ITEM_BY_ID[id]
  if (item) return { emoji: item.emoji, label: item.label }
  return { emoji: '👕', label: id }
}

const FEEDBACK_LABEL = { warm: '🔥 Too warm', ok: '👌 Just right', cold: '🥶 Too cold' }
const FEEDBACK_EMOJI = { warm: '🔥', ok: '👌', cold: '🥶' }

function dayKey(ts) {
  return new Date(ts).toISOString().slice(0, 10)
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const startWeekday = first.getDay() // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({
      day: d,
      key: date.toISOString().slice(0, 10),
      isToday: date.toDateString() === new Date().toDateString(),
    })
  }
  return cells
}

const WEEKDAYS = ['S','M','T','W','T','F','S']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function HistoryPage() {
  const history = loadHistory()
  const [view, setView] = useState('calendar') // 'calendar' | 'list'
  const [selectedDay, setSelectedDay] = useState(null)
  const today = new Date()
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 px-8 text-center gap-3 pt-20">
        <span className="text-4xl">📋</span>
        <p className="text-sm">No outfit history yet. Come back after your first recommendation!</p>
      </div>
    )
  }

  // Index history by day, keeping the latest entry per day for the cell
  const byDay = {}
  for (const e of history) {
    const k = dayKey(e.timestamp)
    if (!byDay[k]) byDay[k] = []
    byDay[k].push(e)
  }

  const cells = buildMonthGrid(cursor.year, cursor.month)
  const monthLabel = `${MONTH_NAMES[cursor.month]} ${cursor.year}`

  const goPrev = () => setCursor(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 })
  const goNext = () => setCursor(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 })

  const dayEntries = selectedDay ? byDay[selectedDay] ?? [] : []

  return (
    <div className="overflow-y-auto h-full pb-24 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">Your History</h2>
        <div className="flex rounded-lg overflow-hidden border border-zinc-800">
          {['calendar', 'list'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 text-[11px] capitalize ${view === v ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-500'}`}
            >{v}</button>
          ))}
        </div>
      </div>

      {view === 'calendar' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <button onClick={goPrev} className="text-zinc-500 hover:text-white px-2 py-1">‹</button>
            <p className="text-white text-sm font-medium">{monthLabel}</p>
            <button onClick={goNext} className="text-zinc-500 hover:text-white px-2 py-1">›</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className="text-center text-[10px] text-zinc-600 py-1">{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((c, i) => {
              if (!c) return <div key={i} className="aspect-square"/>
              const entries = byDay[c.key]
              const latest = entries?.[0]
              const fb = latest?.feedback
              return (
                <button
                  key={c.key}
                  onClick={() => entries && setSelectedDay(c.key)}
                  className={`aspect-square rounded-lg text-[11px] flex flex-col items-center justify-center transition-all
                    ${entries
                      ? fb === 'cold' ? 'bg-blue-500/20 border border-blue-500/40 text-blue-200'
                      : fb === 'warm' ? 'bg-red-500/20 border border-red-500/40 text-red-200'
                      : fb === 'ok'   ? 'bg-green-500/20 border border-green-500/40 text-green-200'
                      : 'bg-zinc-800/60 border border-zinc-700 text-zinc-300'
                    : 'text-zinc-600'}
                    ${c.isToday ? 'ring-1 ring-indigo-400' : ''}`}
                >
                  <span>{c.day}</span>
                  {fb && <span className="text-[10px] leading-none mt-0.5">{FEEDBACK_EMOJI[fb]}</span>}
                </button>
              )
            })}
          </div>

          <div className="flex gap-3 mt-4 text-[10px] text-zinc-500 justify-center flex-wrap">
            <span><span className="inline-block w-2 h-2 rounded-sm bg-blue-500/40 mr-1"/>Cold</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-green-500/40 mr-1"/>Just right</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-red-500/40 mr-1"/>Warm</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-zinc-700 mr-1"/>No rating</span>
          </div>
        </>
      )}

      {view === 'list' && (
        <div className="flex flex-col gap-2">
          {history.map(e => (
            <EntryCard key={e.id} entry={e}/>
          ))}
        </div>
      )}

      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={() => setSelectedDay(null)}>
          <div className="w-full max-w-md bg-[#111116] rounded-t-3xl border-t border-zinc-800 p-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] animate-slide-up max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-3"/>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold">
                {new Date(selectedDay).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
              <button onClick={() => setSelectedDay(null)} className="text-zinc-500 text-2xl leading-none">×</button>
            </div>
            <div className="flex flex-col gap-2">
              {dayEntries.map(e => <EntryCard key={e.id} entry={e}/>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EntryCard({ entry: e }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
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
  )
}
