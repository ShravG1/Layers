import { useEffect, useState } from 'react'

const LS_KEY = 'wtw_lastMoodPromptDate'

// Shows after 6pm if user hasn't logged today.
// If a significant cold-drop was detected, show a follow-up question.
export function DailyMoodPrompt({
  hour,
  dailyMoodLog = [],
  morningPeak,
  currentFeelsLike,
  onLog,
  onAcknowledgeDrop,
  acknowledgedDrop,
}) {
  const [dismissed, setDismissed] = useState(false)
  const [step, setStep] = useState(0)
  const [mood, setMood] = useState(null)
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const last = localStorage.getItem(LS_KEY)
    if (last === today) setDismissed(true)
  }, [today])

  if (dismissed || hour < 18) return null
  if (dailyMoodLog[0]?.date === today) return null

  const morningPeakTemp = morningPeak?.peakFeelsLike ?? null
  const droppedSignificantly =
    morningPeakTemp != null &&
    currentFeelsLike != null &&
    morningPeakTemp - currentFeelsLike >= 4

  const close = () => {
    localStorage.setItem(LS_KEY, today)
    setDismissed(true)
  }

  const submit = (m) => {
    setMood(m)
    onLog?.({
      mood: m,
      morningPeak: morningPeakTemp,
      eveningTemp: currentFeelsLike,
      droppedSignificantly,
    })
    // If they said "cold" AND we saw a drop AND they haven't acknowledged this date
    if (m === 'cold' && droppedSignificantly && acknowledgedDrop !== today) {
      setStep(1)
    } else {
      close()
    }
  }

  if (step === 1) {
    return (
      <div className="mx-4 mt-4 rounded-2xl glass-card p-4 animate-fade-in">
        <p className="text-white text-sm font-medium mb-1">Was it the evening drop?</p>
        <p className="text-zinc-500 text-xs mb-3">
          Temp dropped {Math.round(morningPeakTemp - currentFeelsLike)}°C from this morning's peak.
          We can flag this pattern for next time.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => { close() }}
            className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs"
          >
            No, cold all day
          </button>
          <button
            onClick={() => { onAcknowledgeDrop?.(); close() }}
            className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium"
          >
            Yes, evening drop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-4 rounded-2xl glass-card p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white text-sm font-medium">How did you feel today?</p>
          <p className="text-zinc-500 text-xs">Helps Layers tune your future picks.</p>
        </div>
        <button onClick={close} className="text-zinc-600 text-lg leading-none">×</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: 'cold', emoji: '🥶', label: 'Cold' },
          { id: 'ok',   emoji: '👌', label: 'Just right' },
          { id: 'warm', emoji: '🥵', label: 'Warm' },
        ].map(o => (
          <button
            key={o.id}
            onClick={() => submit(o.id)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all
              ${mood === o.id
                ? 'bg-indigo-600/20 border-indigo-500'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
          >
            <span className="text-xl">{o.emoji}</span>
            <span className="text-zinc-300 text-[11px]">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
