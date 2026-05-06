import { useState } from 'react'

export function FeedbackRow({ onFeedback }) {
  const [selected, setSelected] = useState(null)

  const handle = (val) => {
    setSelected(val)
    onFeedback(val)
  }

  const options = [
    { val: 'warm', label: 'Too warm', emoji: '🔥' },
    { val: 'ok',   label: 'Just right', emoji: '👌' },
    { val: 'cold', label: 'Too cold', emoji: '🥶' },
  ]

  return (
    <div className="mx-4 mt-3 rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
      <p className="text-zinc-400 text-xs text-center mb-3">How does this recommendation feel?</p>
      <div className="flex gap-2 justify-center">
        {options.map(o => (
          <button
            key={o.val}
            onClick={() => handle(o.val)}
            className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs transition-all
              ${selected === o.val
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
          >
            <span className="text-lg">{o.emoji}</span>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
