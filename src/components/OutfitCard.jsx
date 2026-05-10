import { useState } from 'react'
import { WhatIWoreModal } from './WhatIWoreModal.jsx'

function accentFor(id = '') {
  if (['vest','tshirt','polo','longsleeve','thermal','thin_hoodie','med_hoodie','thick_hoodie','fleece','jumper'].includes(id))
    return 'bg-indigo-500'
  if (['shorts','joggers','chinos','jeans','thermal_legs'].includes(id))
    return 'bg-violet-500'
  if (['windbreaker','rain_jacket','light_jacket','med_jacket','puffer','heavy_coat'].includes(id))
    return 'bg-sky-500'
  return 'bg-zinc-600'
}

const RATINGS = [
  { val: 'cold', emoji: '🥶', label: 'Too cold' },
  { val: 'ok',   emoji: '👌', label: 'Just right' },
  { val: 'warm', emoji: '🔥', label: 'Too warm' },
]

function calcStreak(feedbackLog) {
  if (!feedbackLog?.length) return 0
  const dates = [...new Set(feedbackLog.map(e => new Date(e.timestamp).toISOString().slice(0, 10)))].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dates[0] !== today && dates[0] !== yesterday) return 0
  let streak = 0
  let expected = dates[0] === today ? today : yesterday
  for (const d of dates) {
    if (d === expected) {
      streak++
      expected = new Date(new Date(expected).getTime() - 86400000).toISOString().slice(0, 10)
    } else break
  }
  return streak
}

export function OutfitCard({ outfitData, onLogWorn, ownedIds, onFeedback, feedbackLog }) {
  const [showModal, setShowModal] = useState(false)
  const [logged, setLogged] = useState(false)
  const [rated, setRated] = useState(null)
  const [shared, setShared] = useState(false)

  if (!outfitData) return null
  const { items, isMorningOrEvening, hour, feelsLike } = outfitData
  const streak = calcStreak(feedbackLog)

  const handleShare = async () => {
    const summary = items
      .filter(i => i.tier !== 'tiny')
      .map(i => `${i.emoji} ${i.name.toLowerCase()}`)
      .join(' + ')
    const text = `Layers says: ${summary} for ${Math.round(feelsLike)}°C 🧥`
    try {
      if (navigator.share) {
        await navigator.share({ text, title: 'Layers' })
      } else {
        await navigator.clipboard.writeText(text)
      }
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch { /* user cancelled */ }
  }
  const main   = items.filter(i => i.tier === 'main')
  const extras = items.filter(i => i.tier === 'extra')
  const tiny   = items.filter(i => i.tier === 'tiny')

  const handleRate = (val) => {
    if (rated) return
    navigator.vibrate?.(10)
    setRated(val)
    onFeedback?.(val)
  }

  const handleLog = (worn) => { onLogWorn(worn); setLogged(true); setShowModal(false) }

  return (
    <>
      <div className="mx-4 mt-3 rounded-2xl glass-card overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Today's Layers</h2>
          <div className="flex items-center gap-2">
            {isMorningOrEvening && (
              <span className="text-[10px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full">
                {hour < 9 ? 'Morning chill' : 'Evening chill'}
              </span>
            )}
            <button
              onClick={handleShare}
              className="text-zinc-500 hover:text-white text-sm active:scale-90 transition-all"
              title="Share outfit"
            >
              {shared ? '✓' : '↗'}
            </button>
          </div>
        </div>

        {/* Main items */}
        <div className="px-4 flex flex-col gap-1.5">
          {main.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-zinc-900/70 border border-zinc-800/60 overflow-hidden">
              <div className={`w-1 self-stretch ${accentFor(item.id)}`}/>
              <span className="text-2xl py-2.5">{item.emoji}</span>
              <span className="text-white text-sm font-medium">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Extras */}
        {extras.length > 0 && (
          <div className="px-4 pt-2 flex flex-wrap gap-1.5">
            {extras.map(item => (
              <span key={item.id} className="inline-flex items-center gap-1 bg-zinc-900/70 border border-zinc-800 rounded-full px-2.5 py-1 text-zinc-300 text-xs">
                {item.emoji} {item.name}
              </span>
            ))}
          </div>
        )}

        {/* Socks tiny note */}
        {tiny.length > 0 && (
          <p className="px-4 pt-1 text-[11px] text-zinc-600">
            {tiny.map(t => `${t.emoji} ${t.name.toLowerCase()}`).join(' · ')}
          </p>
        )}

        {/* Rating row */}
        <div className="px-4 pt-3 pb-3 mt-2 border-t border-zinc-800/40">
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-zinc-600 text-[10px]">How does this feel for you?</p>
            {streak >= 2 && (
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                🔥 {streak} day streak
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {RATINGS.map(r => (
              <button
                key={r.val}
                onClick={() => handleRate(r.val)}
                disabled={!!rated}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-xs transition-all
                  ${rated === r.val
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : rated
                      ? 'bg-zinc-900/40 border-zinc-800/40 text-zinc-700 cursor-default'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white active:scale-95'
                  }`}
              >
                <span className="text-lg">{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Log worn */}
        <div className="px-4 pb-3 flex justify-center">
          {logged
            ? <span className="text-green-400 text-xs">✓ Outfit logged</span>
            : <button onClick={() => setShowModal(true)} className="text-xs text-zinc-500 hover:text-white underline underline-offset-2">
                Log what I actually wore
              </button>
          }
        </div>
      </div>

      {showModal && (
        <WhatIWoreModal ownedIds={ownedIds} onConfirm={handleLog} onClose={() => setShowModal(false)}/>
      )}
    </>
  )
}
