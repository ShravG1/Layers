export function OnboardingScreen({ onSelect }) {
  const options = [
    { profile: 'warm', emoji: '🔥', label: 'Run Warm', desc: "You're always hot — prefer fewer layers" },
    { profile: 'average', emoji: '👌', label: 'About Average', desc: "Standard recommendations suit you" },
    { profile: 'cold', emoji: '🥶', label: 'Run Cold', desc: "You're always chilly — prefer extra layers" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 px-6">
      <div className="max-w-sm w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🧥</div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to WhatToWear</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            One quick question to personalise your outfit recommendations.
          </p>
        </div>

        <p className="text-zinc-300 text-center text-sm font-medium mb-4">
          Do you generally run warm, average, or cold?
        </p>

        <div className="flex flex-col gap-3">
          {options.map(o => (
            <button
              key={o.profile}
              onClick={() => onSelect(o.profile)}
              className="flex items-center gap-4 w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-indigo-500 rounded-2xl px-5 py-4 transition-all text-left"
            >
              <span className="text-3xl">{o.emoji}</span>
              <div>
                <p className="text-white font-semibold">{o.label}</p>
                <p className="text-zinc-400 text-xs mt-0.5">{o.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
