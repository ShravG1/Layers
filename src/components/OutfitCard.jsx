import { useState, useRef } from 'react'
import { WhatIWoreModal } from './WhatIWoreModal.jsx'

const TIER_BAR = {
  main:  '',
  extra: 'opacity-80',
  tiny:  'opacity-50',
}

// Category → accent colour (left bar)
function accentFor(id = '') {
  if (['vest','tshirt','polo','longsleeve','thermal','thin_hoodie','med_hoodie','thick_hoodie','fleece','jumper'].includes(id))
    return 'bg-indigo-500'
  if (['shorts','joggers','chinos','jeans','thermal_legs'].includes(id))
    return 'bg-violet-500'
  if (['windbreaker','rain_jacket','light_jacket','med_jacket','puffer','heavy_coat'].includes(id))
    return 'bg-sky-500'
  return 'bg-zinc-500'
}

export function OutfitCard({ outfitData, onLogWorn, ownedIds, onFeedback }) {
  const [showModal, setShowModal] = useState(false)
  const [logged, setLogged] = useState(false)
  const [swiped, setSwiped] = useState(null) // 'warm'|'cold'|'ok'

  // Swipe detection
  const startX = useRef(null)
  const startY = useRef(null)

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e) => {
    if (startX.current == null) return
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = e.changedTouches[0].clientY - startY.current
    startX.current = null
    if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return
    if (Math.abs(dx) > Math.abs(dy)) {
      const val = dx > 0 ? 'warm' : 'cold'
      setSwiped(val); onFeedback?.(val)
    } else if (dy > 40) {
      setSwiped('ok'); onFeedback?.('ok')
    }
  }

  if (!outfitData) return null
  const { items, isMorningOrEvening, hour } = outfitData
  const main   = items.filter(i => i.tier === 'main')
  const extras = items.filter(i => i.tier === 'extra')
  const tiny   = items.filter(i => i.tier === 'tiny')

  const handleLog = (worn) => { onLogWorn(worn); setLogged(true); setShowModal(false) }

  return (
    <>
      <div
        className="mx-4 mt-3 rounded-2xl glass-card overflow-hidden animate-fade-in"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="px-4 pt-4 pb-1 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Today's Layers</h2>
          <div className="flex items-center gap-2">
            {isMorningOrEvening && (
              <span className="text-[10px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full">
                {hour < 9 ? 'Morning chill' : 'Evening chill'}
              </span>
            )}
            {swiped && (
              <span className="text-[10px] text-green-400">
                {swiped === 'warm' ? '🔥 Too warm' : swiped === 'cold' ? '🥶 Too cold' : '👌 Just right'}
              </span>
            )}
          </div>
        </div>

        <div className="px-4 pb-1 mt-2 flex flex-col gap-1.5">
          {main.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-zinc-900/70 border border-zinc-800/60 overflow-hidden">
              <div className={`w-1 self-stretch ${accentFor(item.id)}`}/>
              <span className="text-2xl py-2.5">{item.emoji}</span>
              <span className="text-white text-sm font-medium">{item.name}</span>
            </div>
          ))}
        </div>

        {extras.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 mt-1">
            {extras.map(item => (
              <span key={item.id} className="inline-flex items-center gap-1 bg-zinc-900/70 border border-zinc-800 rounded-full px-2.5 py-1 text-zinc-300 text-xs">
                {item.emoji} {item.name}
              </span>
            ))}
          </div>
        )}

        {tiny.length > 0 && (
          <p className="px-4 pb-2 text-[11px] text-zinc-600">
            {tiny.map(t => `${t.emoji} ${t.name.toLowerCase()}`).join(' · ')}
          </p>
        )}

        <div className="px-4 pb-3 flex items-center justify-between border-t border-zinc-800/40 pt-3 mt-1">
          <p className="text-[10px] text-zinc-600">← swipe to rate · ↓ just right</p>
          {logged
            ? <span className="text-green-400 text-xs">✓ Logged</span>
            : <button onClick={() => setShowModal(true)} className="text-xs text-zinc-500 hover:text-white underline underline-offset-2">Log what I wore</button>
          }
        </div>
      </div>

      {showModal && (
        <WhatIWoreModal ownedIds={ownedIds} onConfirm={handleLog} onClose={() => setShowModal(false)}/>
      )}
    </>
  )
}
