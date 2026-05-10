import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { WARDROBE_CATALOG, EMOJI_PICKER_OPTIONS } from '../utils/wardrobe.js'

const SECTIONS = [
  { key: 'top',    title: 'Tops',       hint: 'Select what you own' },
  { key: 'legs',   title: 'Legs',       hint: '' },
  { key: 'outer',  title: 'Outer layers', hint: '' },
  { key: 'socks',  title: 'Socks',      hint: 'Shown as a small note on cold days' },
  { key: 'extras', title: 'Extras',     hint: '' },
]

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const [rect, setRect] = useState(null)

  const handleOpen = () => {
    if (btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect())
    }
    setOpen(o => !o)
  }

  return (
    <div>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="w-10 h-10 text-xl bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center"
      >
        {value || '❓'}
      </button>
      {open && rect && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}/>
          <div
            className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-2xl p-2 grid grid-cols-7 gap-1 shadow-2xl"
            style={{
              top: rect.bottom + 8,
              left: Math.min(rect.left, window.innerWidth - 244),
              width: 236,
            }}
          >
            {EMOJI_PICKER_OPTIONS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => { onChange(e); setOpen(false) }}
                className="text-xl w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-lg"
              >
                {e}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

export function WardrobeSelect({ selected, onChange, customExtras = [], onAddCustom, onRemoveCustom, dense = false }) {
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('👕')
  const isOn = (id) => selected.includes(id)
  const toggle = (id) => onChange(isOn(id) ? selected.filter(s => s !== id) : [...selected, id])

  const addCustom = () => {
    const label = newLabel.trim()
    if (!label) return
    const id = 'custom_' + Date.now()
    onAddCustom?.({ id, label, emoji: newEmoji, custom: true })
    setNewLabel('')
    setNewEmoji('👕')
  }

  return (
    <div className={dense ? 'space-y-4' : 'space-y-5'}>
      {SECTIONS.map(({ key, title, hint }) => (
        <div key={key}>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-zinc-300 text-sm font-medium">{title}</p>
            {hint && <p className="text-zinc-600 text-[10px]">{hint}</p>}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {WARDROBE_CATALOG[key].map(item => {
              const on = isOn(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-all border
                    ${on ? 'bg-indigo-600/15 border-indigo-500/60 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                >
                  <span className={`text-lg ${on ? '' : 'opacity-40'}`}>{item.emoji}</span>
                  <span className="text-xs leading-tight">{item.label}</span>
                  {on && <span className="ml-auto text-indigo-400 text-[10px]">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Custom items */}
      {onAddCustom && (
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-2">Custom items</p>
          {customExtras.map(item => (
            <div key={item.id} className="flex items-center gap-2 mb-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-zinc-300 text-xs flex-1">{item.label}</span>
              <button onClick={() => onRemoveCustom?.(item.id)} className="text-zinc-600 hover:text-red-400 text-sm">×</button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <EmojiPicker value={newEmoji} onChange={setNewEmoji}/>
            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="Item name…"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={addCustom}
              className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
