import { useState } from 'react'
import { ALL_ITEMS, ITEM_EMOJI } from '../utils/outfitLogic.js'

export function WhatIWoreModal({ onConfirm, onClose }) {
  const [selected, setSelected] = useState([])

  const toggle = (item) => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 rounded-t-3xl border-t border-zinc-700 p-6 animate-slide-up">
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-5" />
        <h3 className="text-white font-semibold text-lg mb-4">What did you actually wear?</h3>

        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pb-2">
          {ALL_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all text-left
                ${selected.includes(item)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
            >
              <span className="text-xl">{ITEM_EMOJI[item] ?? '👕'}</span>
              <span className="capitalize">{item}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Save log
          </button>
        </div>
      </div>
    </div>
  )
}
