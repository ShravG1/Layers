import { useState } from 'react'
import { WardrobeSelect } from './WardrobeSelect.jsx'
import { backupConfigured, restoreFromCode } from '../hooks/useCloudBackup.js'

const PROFILES = [
  { profile: 'warm',    emoji: '🔥', label: 'Run warm',   desc: "Always hot — prefer fewer layers" },
  { profile: 'average', emoji: '👌', label: 'Average',    desc: "Standard recommendations" },
  { profile: 'cold',    emoji: '🥶', label: 'Run cold',   desc: "Always chilly — prefer extra layers" },
]

export function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState(null)
  const [wardrobe, setWardrobe] = useState([])  // start empty — user picks what they own
  const [showRestore, setShowRestore] = useState(false)

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

          {backupConfigured && (
            <button
              onClick={() => setShowRestore(true)}
              className="mt-5 text-center text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
            >
              Reinstalling? Restore from a backup code
            </button>
          )}
        </div>

        {showRestore && <RestoreModal onClose={() => setShowRestore(false)} />}
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
          Tap what you actually own. We'll only ever recommend from these.
        </p>
        {wardrobe.length > 0 && (
          <p className="text-indigo-400 text-xs mt-1">{wardrobe.length} items selected</p>
        )}
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

function RestoreModal({ onClose }) {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async () => {
    setBusy(true)
    setError(null)
    const res = await restoreFromCode(input)
    if (res.ok) {
      window.location.reload()
    } else {
      setError(res.error)
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-6">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-xs w-full">
        <p className="text-white font-semibold mb-1">Restore your data</p>
        <p className="text-zinc-500 text-xs mb-4">
          Enter the backup code from your old install.
        </p>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="XXXX-XXXX"
          autoCapitalize="characters"
          spellCheck={false}
          className="w-full bg-zinc-800 text-white font-mono tracking-widest text-center rounded-xl px-3 py-2.5 text-sm mb-2 placeholder:text-zinc-600"
        />
        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-800 text-zinc-400 rounded-xl text-sm"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy || !input.trim()}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-40"
          >
            {busy ? 'Restoring…' : 'Restore'}
          </button>
        </div>
      </div>
    </div>
  )
}
