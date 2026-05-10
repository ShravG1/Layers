import { useState } from 'react'
import { ALL_ITEMS } from '../utils/outfitLogic.js'
import { WARDROBE_CATALOG } from '../utils/wardrobe.js'

const CATEGORY_LABELS = { top: 'Tops', legs: 'Legs', outer: 'Outer', socks: 'Socks', extras: 'Extras' }

export function WhatIWoreModal({ onConfirm, onClose, ownedIds = null }) {
  const [selected, setSelected] = useState([])
  const [showAll, setShowAll] = useState(false)

  const owned = ownedIds ? ALL_ITEMS.filter(i => ownedIds.includes(i.id)) : ALL_ITEMS
  // Items NOT in the user's wardrobe (or all items if no wardrobe set)
  const ownedIds_ = new Set(owned.map(i => i.id))
  const extras = ALL_ITEMS.filter(i => !ownedIds_.has(i.id))

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const isSelected = (id) => selected.includes(id)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 rounded-t-3xl border-t border-zinc-700 pb-[max(env(safe-area-inset-bottom),1.5rem)] animate-slide-up flex flex-col max-h-[85vh]">
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mt-4 mb-4 flex-shrink-0" />

        <div className="px-5 flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">What did you actually wear?</h3>
          <p className="text-zinc-500 text-xs mt-0.5 mb-3">Tap everything you wore today</p>
        </div>

        <div className="overflow-y-auto flex-1 px-5">
          {/* Owned wardrobe items */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {owned.map(item => (
              <ItemButton key={item.id} item={item} selected={isSelected(item.id)} onToggle={toggle} />
            ))}
          </div>

          {/* Expand to show items not in wardrobe */}
          {extras.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setShowAll(o => !o)}
                className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-500 text-sm flex items-center justify-center gap-2 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <span>{showAll ? '▲' : '➕'}</span>
                <span>{showAll ? 'Hide other items' : 'Wore something not in my wardrobe'}</span>
              </button>

              {showAll && (
                <div className="mt-3 space-y-3">
                  {Object.entries(WARDROBE_CATALOG).map(([cat, items]) => {
                    const extraInCat = items.filter(i => !ownedIds_.has(i.id))
                    if (!extraInCat.length) return null
                    return (
                      <div key={cat}>
                        <p className="text-zinc-600 text-[10px] uppercase tracking-wide mb-1.5">{CATEGORY_LABELS[cat]}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {extraInCat.map(item => (
                            <ItemButton key={item.id} item={item} selected={isSelected(item.id)} onToggle={toggle} dim />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 pt-3 pb-1 flex gap-3 flex-shrink-0 border-t border-zinc-800">
          {selected.length > 0 && (
            <p className="absolute left-1/2 -translate-x-1/2 -top-6 text-indigo-400 text-xs">{selected.length} selected</p>
          )}
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
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all text-left
        ${selected
          ? 'bg-indigo-600 text-white'
          : dim
            ? 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 border border-zinc-700/50'
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }`}
    >
      <span className="text-xl">{item.emoji}</span>
      <span className="leading-tight">{item.name}</span>
    </button>
  )
}
