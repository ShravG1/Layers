import { useState } from 'react'
import { WhatIWoreModal } from './WhatIWoreModal.jsx'

export function OutfitCard({ outfitData, onLogWorn, ownedIds }) {
  const [showModal, setShowModal] = useState(false)
  const [logged, setLogged] = useState(false)

  if (!outfitData) return null

  const { items, isMorningOrEvening, hour } = outfitData
  const main  = items.filter(i => i.tier === 'main')
  const extras = items.filter(i => i.tier === 'extra')
  const tiny  = items.filter(i => i.tier === 'tiny')

  const handleLog = (worn) => {
    onLogWorn(worn)
    setLogged(true)
    setShowModal(false)
  }

  return (
    <>
      <div className="mx-4 mt-3 rounded-2xl glass-card p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-base">Today's Outfit</h2>
          {isMorningOrEvening && (
            <span className="text-[10px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full">
              {hour < 9 ? 'Morning chill' : 'Evening chill'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {main.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2.5"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-white text-sm">{item.name}</span>
            </div>
          ))}
        </div>

        {extras.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {extras.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-full px-2.5 py-1 text-zinc-300 text-xs"
              >
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </span>
            ))}
          </div>
        )}

        {tiny.length > 0 && (
          <p className="mt-3 text-[11px] text-zinc-600">
            {tiny.map(t => `${t.emoji} ${t.name.toLowerCase()}`).join(' · ')}
          </p>
        )}

        <div className="mt-4 flex justify-center">
          {logged ? (
            <span className="text-green-400 text-sm">✓ Logged</span>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-zinc-500 hover:text-white transition-colors underline underline-offset-2"
            >
              Log what I actually wore
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <WhatIWoreModal
          ownedIds={ownedIds}
          onConfirm={handleLog}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
