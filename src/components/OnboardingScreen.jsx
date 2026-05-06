import { useState } from 'react'
import { WardrobeSelect } from './WardrobeSelect.jsx'
import { DEFAULT_WARDROBE } from '../utils/wardrobe.js'

const PROFILES = [
  { profile: 'warm',    emoji: '🔥', label: 'Run warm',   desc: "Always hot — prefer fewer layers" },
  { profile: 'average', emoji: '👌', label: 'Average',    desc: "Standard recommendations" },
  { profile: 'cold',    emoji: '🥶', label: 'Run cold',   desc: "Always chilly — prefer extra layers" },
]

export function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState(null)
  const [wardrobe, setWardrobe] = useState(DEFAULT_WARDROBE)

  // Step 0: Welcome + thermal profile
  if (step === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 px-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto animate-fade-in">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🧥</div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Layers</h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Smart outfit tips based on the weather and how you actually feel.
            </p>
          </div>

          <p className="text-zinc-300 text-center text-sm font-medium mb-4">
            Do you run warm, average, or cold?
          </p>

          <div className="flex flex-col gap-3 mb-2">
            {PROFILES.map(o => (
              <button
                key={o.profile}
                onClick={() => { setProfile(o.profile); setStep(1) }}
                className={`flex items-center gap-4 w-full rounded-2xl px-5 py-4 transition-all text-left border
                  ${profile === o.profile ? 'bg-indigo-600/20 border-indigo-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'}`}
              >
                <span className="text-3xl">{o.emoji}</span>
                <div>
                  <p className="text-white font-semibold">{o.label}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{o.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Wardrobe
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)]">
      <div className="px-6 pb-3 flex-shrink-0">
        <button onClick={() => setStep(0)} className="text-zinc-500 text-sm mb-2">← Back</button>
        <h2 className="text-white font-bold text-2xl tracking-tight">Your wardrobe</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Pick what you actually own. We'll only recommend from these.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <WardrobeSelect selected={wardrobe} onChange={setWardrobe} />
      </div>

      <div className="px-6 pt-3 border-t border-zinc-900 flex-shrink-0">
        <button
          onClick={() => onComplete({ profile, wardrobe })}
          disabled={!wardrobe.length}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
