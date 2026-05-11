import { useState } from 'react'
import { ALL_ITEMS } from '../utils/outfitLogic.js'
import { WARDROBE_CATALOG } from '../utils/wardrobe.js'

const CATEGORY_LABELS = { top: 'Tops', legs: 'Legs', outer: 'Outer', socks: 'Socks', extras: 'Extras' }

export function WhatIWoreModal({ onConfirm, onClose, ownedIds = [] }) {
  const [selected, setSelected] = useState([])

  const ownedSet = new Set(ownedIds)
  const owned = ALL_ITEMS.filter(i => ownedSet.has(i.id))
  const notOwned = ALL_ITEMS.filter(i => !ownedSet.has(i.id))

  const toggle = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const sel = (id) => selected.includes(id)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 rounded-t-3xl border-t border-zinc-700 pb-[max(env(safe-area-inset-bottom),1rem)] animate-slide-up flex flex-col max-h-[90vh]">
        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-4"/>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">What did you actually wear?</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Tap everything — wardrobe and beyond</p>
            </div>
            {selected.length > 0 && (
              <span className="text-indigo-400 text-xs bg-indigo-400/10 px-2.5 py-1 rounded-full">
                {selected.length} selected
              </span>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 pb-2">

          {/* My wardrobe */}
          {owned.length > 0 && (
            <div className="mb-4">
              <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-2">My wardrobe</p>
              <div className="grid grid-cols-2 gap-2">
                {owned.map(item => (
                  <ItemButton key={item.id} item={item} selected={sel(item.id)} onToggle={toggle} />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-zinc-800"/>
            <p className="text-zinc-600 text-[10px] uppercase tracking-wide">Not in my wardrobe</p>
            <div className="flex-1 h-px bg-zinc-800"/>
          </div>

          {/* Everything else, grouped by category */}
          {Object.entries(WARDROBE_CATALOG).map(([cat, items]) => {
            const available = items.filter(i => !ownedSet.has(i.id))
            if (!available.length) return null
            return (
              <div key={cat} className="mb-3">
                <p className="text-zinc-600 text-[10px] uppercase tracking-wide mb-1.5">{CATEGORY_LABELS[cat]}</p>
                <div className="grid grid-cols-2 gap-2">
                  {available.map(item => (
                    <ItemButton key={item.id} item={item} selected={sel(item.id)} onToggle={toggle} dim />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 px-5 pt-3 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium"
          >
            Save log
          </button>
        </div>
      </div>
    </div>
  )
}

function ItemButton({ item, selected, onToggle, dim = false }) {
  return (
    <button
      onClick={() => onToggle(item.id)}
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all text-left active:scale-95
        ${selected
          ? 'bg-indigo-600 text-white border border-indigo-500'
          : dim
            ? 'bg-zinc-800/40 text-zinc-500 border border-zinc-700/50 hover:text-zinc-300'
            : 'bg-zinc-800 text-zinc-300 border border-transparent hover:bg-zinc-700'
        }`}
    >
      <span className={`text-xl ${!selected && dim ? 'opacity-50' : ''}`}>{item.emoji}</span>
      <span className="leading-tight">{item.name}</span>
    </button>
  )
}
