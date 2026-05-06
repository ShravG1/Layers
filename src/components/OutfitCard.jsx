import { useState } from 'react'
import { WhatIWoreModal } from './WhatIWoreModal.jsx'

export function OutfitCard({ outfitData, onLogWorn }) {
  const [showModal, setShowModal] = useState(false)
  const [logged, setLogged] = useState(false)

  if (!outfitData) return null

  const { items, isMorningOrEvening, hour } = outfitData

  const handleLog = (worn) => {
    onLogWorn(worn)
    setLogged(true)
    setShowModal(false)
  }

  return (
    <>
      <div className="mx-4 mt-3 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-base">Today's Outfit</h2>
          {isMorningOrEvening && (
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              {hour < 9 ? 'Morning chill — going slightly warmer' : 'Evening — going slightly warmer'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2.5"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-white text-sm capitalize">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          {logged ? (
            <span className="text-green-400 text-sm">✓ Logged</span>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Log what I actually wore
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <WhatIWoreModal
          items={items}
          onConfirm={handleLog}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
