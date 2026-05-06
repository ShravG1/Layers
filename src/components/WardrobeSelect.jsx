import { WARDROBE_CATALOG } from '../utils/wardrobe.js'

const SECTIONS = [
  { key: 'top',   title: 'Tops',     hint: 'Pick what you actually own' },
  { key: 'legs',  title: 'Legs',     hint: '' },
  { key: 'outer', title: 'Outer',    hint: '' },
  { key: 'socks', title: 'Socks',    hint: 'Small detail — only flagged on cold days' },
  { key: 'extras',title: 'Extras',   hint: '' },
]

export function WardrobeSelect({ selected, onChange, dense = false }) {
  const isOn = (id) => selected.includes(id)
  const toggle = (id) => {
    onChange(isOn(id) ? selected.filter(s => s !== id) : [...selected, id])
  }

  return (
    <div className={dense ? 'space-y-4' : 'space-y-5'}>
      {SECTIONS.map(({ key, title, hint }) => (
        <div key={key}>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-zinc-300 text-sm font-medium">{title}</p>
            {hint && <p className="text-zinc-600 text-[10px]">{hint}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {WARDROBE_CATALOG[key].map(item => {
              const on = isOn(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all border
                    ${on
                      ? 'bg-indigo-600/15 border-indigo-500/60 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}
                  `}
                >
                  <span className={`text-xl ${on ? '' : 'opacity-40'}`}>{item.emoji}</span>
                  <span className="text-sm">{item.label}</span>
                  {on && <span className="ml-auto text-indigo-400 text-xs">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
