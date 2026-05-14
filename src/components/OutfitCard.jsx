import { useState, useRef } from 'react'
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

function FeedbackSlider({ onRate, rated }) {
  const trackRef = useRef(null)
  const [pos, setPos] = useState(50) // 0-100
  const [active, setActive] = useState(false)

  const clampedPos = Math.max(0, Math.min(100, pos))
  const zone = clampedPos < 33 ? 'cold' : clampedPos < 67 ? 'ok' : 'warm'
  const emoji = zone === 'cold' ? '🥶' : zone === 'ok' ? '👌' : '🔥'
  const label = zone === 'cold' ? 'Too cold' : zone === 'ok' ? 'Just right' : 'Too warm'
  const snapPos = zone === 'cold' ? 16 : zone === 'ok' ? 50 : 84

  const getPct = (clientX) => {
    if (!trackRef.current) return 50
    const rect = trackRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  }

  const onPointerDown = (e) => {
    if (rated) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setActive(true)
    setPos(getPct(e.clientX))
  }
  const onPointerMove = (e) => {
    if (!active || rated) return
    setPos(getPct(e.clientX))
  }
  const onPointerUp = (e) => {
    if (!active) return
    setActive(false)
    setPos(snapPos)
    navigator.vibrate?.(10)
    onRate(zone)
  }

  const displayPos = rated ? snapPos : (active ? clampedPos : (rated ? snapPos : 50))

  if (rated) {
    const ratedEmoji = rated === 'cold' ? '🥶' : rated === 'ok' ? '👌' : '🔥'
    const ratedLabel = rated === 'cold' ? 'Too cold' : rated === 'ok' ? 'Just right' : 'Too warm'
    const ratedPos = rated === 'cold' ? 16 : rated === 'ok' ? 50 : 84
    return (
      <div className="px-4 pt-1 pb-1">
        <div className="relative h-10 flex items-center select-none">
          <span className="absolute left-0 text-lg opacity-40">🥶</span>
          <div className="absolute inset-x-8 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right,#3b82f6,#22c55e,#ef4444)' }} />
          <div
            className="absolute w-9 h-9 rounded-full bg-zinc-900 border-2 border-indigo-500 flex items-center justify-center shadow-lg"
            style={{ left: `calc(${ratedPos}% - 1.125rem + ${ratedPos === 16 ? '2rem' : ratedPos === 84 ? '-2rem' : '0px'})` }}
          >
            <span className="text-base">{ratedEmoji}</span>
          </div>
          <span className="absolute right-0 text-lg opacity-40">🔥</span>
        </div>
        <p className="text-center text-xs text-indigo-400 mt-0.5">{ratedLabel} — logged</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-1 pb-1">
      <div
        ref={trackRef}
        className="relative h-12 flex items-center select-none touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="absolute left-0 text-xl">🥶</span>
        <div className="absolute inset-x-8 h-1.5 rounded-full overflow-hidden">
          <div className="h-full w-full" style={{ background: 'linear-gradient(to right,#3b82f6,#22c55e,#ef4444)' }} />
        </div>
        <div
          className="absolute w-10 h-10 rounded-full bg-white shadow-lg border border-zinc-200 flex items-center justify-center"
          style={{
            left: `calc(${active ? clampedPos : 50}% - 1.25rem + ${active && clampedPos < 15 ? '2rem' : active && clampedPos > 85 ? '-2rem' : '0px'})`,
            transition: active ? 'none' : 'left 0.2s ease',
          }}
        >
          <span className="text-base">{active ? emoji : '👆'}</span>
        </div>
        <span className="absolute right-0 text-xl">🔥</span>
      </div>
      <p className="text-center text-[10px] text-zinc-600 -mt-0.5">
        {active ? label : 'Drag to rate'}
      </p>
    </div>
  )
}

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
        <div className="pt-3 mt-2 border-t border-zinc-800/40">
          <div className="flex items-center justify-center gap-2 mb-1 px-4">
            <p className="text-zinc-600 text-[10px]">How does this feel for you?</p>
            {streak >= 2 && (
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                🔥 {streak} day streak
              </span>
            )}
          </div>
          <FeedbackSlider onRate={handleRate} rated={rated} />
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
